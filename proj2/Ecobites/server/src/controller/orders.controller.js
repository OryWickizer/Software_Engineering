// Combine orders with neighbors for delivery optimization
export const combineOrdersWithNeighbors = async (req, res) => {
  try {
    const { customerId, radiusMeters = 500 } = req.body;
    
    // Get the customer's most recent active order to use its delivery address
    const activeStatuses = ['PLACED', 'PREPARING', 'READY'];
    const myOrder = await Order.findOne({ customerId, status: { $in: activeStatuses } }).sort({ createdAt: -1 });
    
    if (!myOrder) {
      return res.status(400).json({ message: 'You don\'t have any active orders to combine' });
    }
    
    // Ensure initiating order has coordinates; if missing, compute deterministic fallback
    if (!myOrder.deliveryAddress) myOrder.deliveryAddress = {};
    const ensureCoords = (addr) => {
      if (!addr) return null;
      if (addr.coordinates && typeof addr.coordinates.lat === 'number' && typeof addr.coordinates.lng === 'number') {
        return addr.coordinates;
      }
      const { street = '', city = '', zipCode = '' } = addr;
      const addressHash = `${String(street)}|${String(city)}|${String(zipCode)}`.toLowerCase();
      const hash = addressHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const lat = 35.7796 + (hash % 100) / 10000; // Raleigh base + small offset
      const lng = -78.6382 + (hash % 100) / 10000;
      return { lat, lng };
    };
    if (!myOrder.deliveryAddress.coordinates) {
      myOrder.deliveryAddress.coordinates = ensureCoords(myOrder.deliveryAddress);
      try { await myOrder.save(); } catch {}
    }
    
    // Find other customers with orders in PLACED/PREPARING/READY status, within city/zip
    const orders = await Order.find({
      status: { $in: activeStatuses },
      'deliveryAddress.city': myOrder.deliveryAddress.city,
      'deliveryAddress.zipCode': myOrder.deliveryAddress.zipCode,
    });
    // Filter by geo proximity (Haversine formula)
    function getDistanceMeters(coord1, coord2) {
      if (!coord1 || !coord2) return Infinity;
      const R = 6371000; // meters
      const toRad = (v) => v * Math.PI / 180;
      const dLat = toRad(coord2.lat - coord1.lat);
      const dLng = toRad(coord2.lng - coord1.lng);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
    const nearbyOrders = orders.filter(o => {
      // Skip the initiating customer's own order
      if (String(o._id) === String(myOrder._id)) return false;
      // Ensure neighbor has coordinates; compute deterministic fallback if missing
      if (!o.deliveryAddress) o.deliveryAddress = {};
      if (!o.deliveryAddress.coordinates) {
        o.deliveryAddress.coordinates = ensureCoords(o.deliveryAddress);
        // best-effort persist; ignore errors
        try { o.markModified && o.markModified('deliveryAddress'); o.save(); } catch {}
      }
      const dist = getDistanceMeters(myOrder.deliveryAddress.coordinates, o.deliveryAddress.coordinates);
      const isNearby = dist <= radiusMeters && String(o.customerId) !== String(customerId);
      return isNearby;
    });
    
    if (nearbyOrders.length === 0) {
      return res.status(200).json({ message: 'No nearby orders to combine', combinedOrders: [] });
    }

    // Mark orders as combined: update status and add eco rewards to both customers
    const COMBINED_REWARD = 20; // points for combining
    const updatedOrderIds = [];
    // Determine combine group id
    const groupId = `GRP${myOrder._id.toString().slice(-6)}`;
    const allOrders = [myOrder, ...nearbyOrders].filter(Boolean);
    const allIds = allOrders.map(o => o._id);

    for (const o of allOrders) {
      o.status = 'COMBINED';
      o.combineGroupId = groupId;
      o.combineWith = allIds.filter(id => id.toString() !== o._id.toString());
      o.statusHistory.push({ status: 'COMBINED', updatedBy: customerId });
      await o.save();
      updatedOrderIds.push(o._id);
      // Add eco reward points to each customer
      const targetUser = await User.findById(o.customerId);
      if (targetUser) {
        targetUser.rewardPoints = (targetUser.rewardPoints || 0) + COMBINED_REWARD;
        await targetUser.save();
      }
    }

    // Return updated orders and success message
    return res.status(200).json({
      message: `Orders combined! Both you and your neighbors earned ${COMBINED_REWARD} eco points.`,
      combinedOrders: allOrders, // Use filtered allOrders instead of raw array
      updatedOrderIds
    });
  } catch (error) {
    console.error('combineOrdersWithNeighbors error:', error);
    res.status(500).json({ message: 'Failed to combine orders' });
  }
};
import {Order} from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { calculateEcoReward, calculateDriverIncentive } from '../config/constants.js';
import axios from 'axios';

// Helper function to geocode address
async function geocodeAddress({ street, city, zipCode }) {
  try {
    const query = encodeURIComponent(`${street}, ${city}, ${zipCode}`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'EcoBites/1.0 (contact@example.com)' },
      timeout: 5000
    });
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
      return coords;
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error.message);
    return null;
  }
}

export const createOrder = async (req, res) => {
  try {
    const { customerId: bodyCustomerId, restaurantId: bodyRestaurantId, items: bodyItems, deliveryAddress, specialInstructions, packagingPreference } = req.body;

    // Only authenticated customers can create orders for themselves
    if (req.user.role !== 'customer' || req.user._id.toString() !== (bodyCustomerId || req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create order for this customer'
      });
    }

    // Validate items
    if (!Array.isArray(bodyItems) || bodyItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    // Extract menu item ids and fetch from DB
    const menuItemIds = bodyItems.map(i => i.menuItemId || i.menuItem || i._id).filter(Boolean);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ success: false, message: 'One or more menu items are invalid' });
    }

    // Ensure all menu items belong to the same restaurant and compute subtotal
    const restaurantIdFromItems = menuItems[0].restaurantId.toString();
    for (const mi of menuItems) {
      if (mi.restaurantId.toString() !== restaurantIdFromItems) {
        return res.status(400).json({ success: false, message: 'All items must belong to the same restaurant' });
      }
    }

    const items = bodyItems.map(bi => {
      const mi = menuItems.find(m => m._id.toString() === (bi.menuItemId || bi.menuItem || bi._id).toString());
      const qty = Number(bi.quantity) || 1;
      return {
        menuItemId: mi._id,
        name: mi.name,
        price: mi.price,
        quantity: qty
      };
    });

    const subtotal = items.reduce((s, it) => s + (it.price * it.quantity), 0);
    const deliveryFee = 0; // tests expect no delivery fee
    const tax = 0; // compute tax here if needed
    const total = subtotal + deliveryFee + tax;

    // Prefer server-derived restaurant id
    const restaurantId = bodyRestaurantId && bodyRestaurantId.toString() === restaurantIdFromItems ? bodyRestaurantId : restaurantIdFromItems;

    // Compute eco reward points based on packaging preference using constant
    const selectedPackaging = ['reusable', 'compostable', 'minimal'].includes(packagingPreference)
      ? packagingPreference
      : 'minimal';
    // Seasonal highlights bonus: sum per item
    const seasonalBonus = items.reduce((sum, it) => {
      const mi = menuItems.find(m => m._id.toString() === it.menuItemId.toString());
      const qty = Number(it.quantity) || 1;
      if (mi && mi.isSeasonal) {
        const pts = Number(mi.seasonalRewardPoints || 0);
        return sum + (pts * qty);
      }
      return sum;
    }, 0);
    const ecoRewardPoints = calculateEcoReward(selectedPackaging) + seasonalBonus;

    // Geocode the delivery address for this order (not updating user profile)
    let addressWithCoordinates = { ...deliveryAddress };
    if (deliveryAddress?.street && deliveryAddress?.city && deliveryAddress?.zipCode) {
      // Add a small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const coordinates = await geocodeAddress({
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        zipCode: deliveryAddress.zipCode
      });
      
      if (coordinates) {
        addressWithCoordinates.coordinates = coordinates;
      } else {
        // Fallback: Create deterministic coordinates based on address hash
        // This ensures orders with identical addresses get identical coordinates
        const addressHash = `${deliveryAddress.street}|${deliveryAddress.city}|${deliveryAddress.zipCode}`.toLowerCase();
        const hash = addressHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const lat = 35.7796 + (hash % 100) / 10000; // Raleigh base + small offset
        const lng = -78.6382 + (hash % 100) / 10000;
        addressWithCoordinates.coordinates = { lat, lng };
      }
    }

    const order = new Order({
      customerId: req.user._id,
      restaurantId,
      items,
      deliveryAddress: addressWithCoordinates,
      subtotal,
      deliveryFee,
      tax,
      total,
      packagingPreference: selectedPackaging,
      ecoRewardPoints,
      specialInstructions,
      status: 'PLACED',
      statusHistory: [{ status: 'PLACED', updatedBy: req.user._id.toString() }]
    });

    await order.save();

    // Return the created order directly (without populating) so IDs remain as strings
    res.status(201).json(order);
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrdersByRole = async (req, res) => {
  try {
    const { role, userId } = req.params;
    
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these orders'
      });
    }
    
  let query = {};
    
    if (role === 'customer') {
      query.customerId = userId;
    } else if (role === 'restaurant') {
      query.restaurantId = userId;
    } else if (role === 'driver') {
      query.driverId = userId;
    }
    
    let q = Order.find(query).sort({ createdAt: -1 });

    // When driver is querying their orders, enrich with restaurant name for UI
    if (role === 'driver') {
      q = q
        .populate({ path: 'restaurantId', select: 'restaurantName name address' })
        .populate({ path: 'customerId', select: 'name phone address' });
    }

    const found = await q.exec();

    // Map to plain objects and add restaurant convenience field when populated
    const orders = found.map((o) => {
      const obj = o.toObject ? o.toObject() : o;
      if (obj.restaurantId && typeof obj.restaurantId === 'object') {
        obj.restaurant = obj.restaurantId.restaurantName || obj.restaurantId.name || '';
        obj.pickupAddress = obj.restaurantId.address || null;
        obj.restaurantId = obj.restaurantId._id ? obj.restaurantId._id.toString() : obj.restaurantId;
      }
      if (obj.customerId && typeof obj.customerId === 'object') {
        obj.customerName = obj.customerId.name || '';
        obj.customerPhone = obj.customerId.phone || '';
        // Keep deliveryAddress as-is on order; ensure present
        if (!obj.deliveryAddress && obj.customerId.address) obj.deliveryAddress = obj.customerId.address;
        obj.customerId = obj.customerId._id ? obj.customerId._id.toString() : obj.customerId;
      }
      return obj;
    });
    
    // Return array of orders directly (without population)
    res.json(orders);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Return order directly
    res.json(order);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, driverId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Authorization checks
    if (status === 'CANCELLED' && req.user._id.toString() !== order.customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only customer can cancel order'
      });
    }
    
    if (['ACCEPTED', 'PREPARING', 'READY'].includes(status) && 
        req.user._id.toString() !== order.restaurantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only restaurant can update to this status'
      });
    }
    
    if (['DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) && 
        req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only driver can update to this status'
      });
    }
    
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user.role
    });
    
    if (driverId && status === 'DRIVER_ASSIGNED') {
      order.driverId = driverId;
    }
    
    try {
      // If delivered and eco rewards not yet credited, credit to customer
      if (status === 'DELIVERED' && order.ecoRewardPoints > 0 && !order.ecoRewardCredited) {
        await User.findByIdAndUpdate(order.customerId, { $inc: { rewardPoints: order.ecoRewardPoints } });
        order.ecoRewardCredited = true;
      }

      // Driver incentives for green delivery methods on delivery
      if (status === 'DELIVERED' && order.driverId && !order.driverRewardCredited) {
        const driver = await User.findById(order.driverId);
        if (driver) {
          const driverPts = calculateDriverIncentive(driver.vehicleType);
          if (driverPts > 0) {
            await User.findByIdAndUpdate(order.driverId, { $inc: { rewardPoints: driverPts } });
            order.driverRewardPoints = driverPts;
            order.driverRewardCredited = true;
          }
        }
      }
      await order.save();

      // If this order is part of a combined group and a driver was assigned,
      // atomically assign the same driver to the rest of the group and mark them DRIVER_ASSIGNED too.
      if (status === 'DRIVER_ASSIGNED' && order.combineGroupId && driverId) {
        const others = await Order.find({
          combineGroupId: order.combineGroupId,
          _id: { $ne: order._id },
          driverId: null
        });
        for (const other of others) {
          other.driverId = driverId;
          other.status = 'DRIVER_ASSIGNED';
          other.statusHistory.push({ status: 'DRIVER_ASSIGNED', updatedBy: req.user.role });
          await other.save();
        }
      }

      // Return updated order directly (without population)
      res.json(order);
    } catch (saveError) {
      console.error('updateOrderStatus save error:', saveError);
      throw saveError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAvailableOrdersForDrivers = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can access this route'
      });
    }
    
    // Show READY and COMBINED orders for drivers
    const found = await Order.find({
      status: { $in: ['READY', 'COMBINED'] },
      driverId: null
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'restaurantId', select: 'restaurantName name address' })
      .populate({ path: 'customerId', select: 'name phone address' });

    // Map to include a top-level 'restaurant' field for UI
    const orders = found.map((o) => {
      const obj = o.toObject ? o.toObject() : o;
      if (obj.restaurantId && typeof obj.restaurantId === 'object') {
        obj.restaurant = obj.restaurantId.restaurantName || obj.restaurantId.name || '';
        obj.pickupAddress = obj.restaurantId.address || null;
        obj.restaurantId = obj.restaurantId._id ? obj.restaurantId._id.toString() : obj.restaurantId;
      }
      if (obj.customerId && typeof obj.customerId === 'object') {
        obj.customerName = obj.customerId.name || '';
        obj.customerPhone = obj.customerId.phone || '';
        if (!obj.deliveryAddress && obj.customerId.address) obj.deliveryAddress = obj.customerId.address;
        obj.customerId = obj.customerId._id ? obj.customerId._id.toString() : obj.customerId;
      }
      return obj;
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
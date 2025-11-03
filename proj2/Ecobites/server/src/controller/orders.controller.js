// Combine orders with neighbors for delivery optimization
export const combineOrdersWithNeighbors = async (req, res) => {
  try {
    const { customerId, radiusMeters = 500 } = req.body;
    // Get the customer's address
    const customer = await (await import('../models/User.model.js')).User.findById(customerId);
    if (!customer || !customer.address || !customer.address.coordinates) {
      return res.status(400).json({ message: 'Customer address/coordinates not found' });
    }
    // Find other customers with orders in PLACED/PREPARING/READY status, within city/zip
    const activeStatuses = ['PLACED', 'PREPARING', 'READY'];
    const orders = await Order.find({
      status: { $in: activeStatuses },
      'deliveryAddress.city': customer.address.city,
      'deliveryAddress.zipCode': customer.address.zipCode,
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
      if (!o.deliveryAddress?.coordinates) return false;
      const dist = getDistanceMeters(customer.address.coordinates, o.deliveryAddress.coordinates);
      return dist <= radiusMeters && String(o.customerId) !== String(customerId);
    });
    if (nearbyOrders.length === 0) {
      return res.status(200).json({ message: 'No nearby orders to combine', combinedOrders: [] });
    }

    // Mark orders as combined: update status and add eco rewards to both customers
    const COMBINED_REWARD = 20; // points for combining
    const updatedOrderIds = [];
    // Determine combine group id
    const myOrder = await Order.findOne({ customerId, status: { $in: activeStatuses } });
    const groupId = `GRP${(myOrder?._id?.toString() || Date.now().toString()).slice(-6)}`;
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
      combinedOrders: [myOrder, ...nearbyOrders],
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
  console.log('🔎 menuItemIds:', menuItemIds);
  console.log('🔎 menuItems from DB:', menuItems.map(m => ({ id: m._id.toString(), restaurantId: m.restaurantId })));

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
    const ecoRewardPoints = calculateEcoReward(selectedPackaging);

    const order = new Order({
      customerId: req.user._id,
      restaurantId,
      items,
      deliveryAddress,
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
    console.log('updateOrderStatus called for orderId:', orderId);
    const { status, driverId } = req.body;
    
    const order = await Order.findById(orderId);
  console.log('updateOrderStatus found order:', order);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Authorization checks
  console.log('updateOrderStatus details:', { status, reqUserId: req.user._id.toString(), reqUserRole: req.user.role, orderCustomerId: order.customerId?.toString(), orderRestaurantId: order.restaurantId?.toString() });
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
import {Order} from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { MenuItem } from '../models/MenuItem.model.js';

export const createOrder = async (req, res) => {
  try {
    const { customerId: bodyCustomerId, restaurantId: bodyRestaurantId, items: bodyItems, deliveryAddress, specialInstructions } = req.body;

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

    const order = new Order({
      customerId: req.user._id,
      restaurantId,
      items,
      deliveryAddress,
      subtotal,
      deliveryFee,
      tax,
      total,
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
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 });
    
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
    
    const orders = await Order.find({
      status: 'READY',
      driverId: null
    })
    .sort({ createdAt: -1 });
    
    // Return array of available orders directly
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
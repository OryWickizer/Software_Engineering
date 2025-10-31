import {Order} from '../models/Order.model.js';
import { User } from '../models/User.model.js';

export const createOrder = async (req, res) => {
  try {
    const { customerId, restaurantId, items, deliveryAddress, subtotal, total, specialInstructions } = req.body;
    
    if (req.user.role !== 'customer' || req.user._id.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create order for this customer'
      });
    }
    
    const order = new Order({
      customerId,
      restaurantId,
      items,
      deliveryAddress,
      subtotal,
      total,
      specialInstructions,
      status: 'PLACED',
      statusHistory: [{
        status: 'PLACED',
        updatedBy: 'customer'
      }]
    });
    
    await order.save();
    await order.populate('customerId restaurantId items.menuItemId');
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
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
      .populate('customerId restaurantId driverId items.menuItemId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('customerId restaurantId driverId items.menuItemId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
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
    
    await order.save();
    await order.populate('customerId restaurantId driverId items.menuItemId');
    
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
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
    .populate('customerId restaurantId items.menuItemId')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
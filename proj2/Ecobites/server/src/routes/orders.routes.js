import { Router } from 'express';
import { register, login } from '../controller/auth.controller.js';
import { createOrder, getOrdersByRole, updateOrderStatus, getAvailableOrdersForDrivers, getOrderById, combineOrdersWithNeighbors } from '../controller/orders.controller.js';
import { protect } from '../middleware/auth.middleware.js';


const router = Router();

// order routes
// Combine orders for delivery optimization
router.post('/combine', protect, combineOrdersWithNeighbors);
router.post('/', protect, createOrder);

// IMPORTANT: place specific routes BEFORE the generic parameterized route to avoid shadowing
router.get('/available/drivers', protect, getAvailableOrdersForDrivers);
router.get('/detail/:orderId', protect, getOrderById);

router.patch('/:orderId/status', protect, updateOrderStatus);
// Support PUT for status updates (tests expect PUT)
router.put('/:orderId/status', protect, updateOrderStatus);

// This generic route must come last
router.get('/:role/:userId', protect, getOrdersByRole);


export default router;

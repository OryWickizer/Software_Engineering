import { Router } from 'express';
import { register, login } from '../controller/auth.controller.js';
import { createOrder, getOrdersByRole, updateOrderStatus, getAvailableOrdersForDrivers, getOrderById } from '../controller/orders.controller.js';
import { protect } from '../middleware/auth.middleware.js';


const router = Router();

//order routes
router.post('/', protect, createOrder);
router.get('/:role/:userId', protect, getOrdersByRole);
router.get('/detail/:orderId', protect, getOrderById);
router.patch('/:orderId/status', protect, updateOrderStatus);
// Support PUT for status updates (tests expect PUT)
router.put('/:orderId/status', protect, updateOrderStatus);
router.get('/available/drivers', protect, getAvailableOrdersForDrivers);


export default router;

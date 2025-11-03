import { Router } from 'express';
import { register, login } from '../controller/auth.controller.js';

const router = Router();
import { createMenuItem, getMenuByRestaurant, updateMenuItem, deleteMenuItem } from '../controller/menu.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

//menu routes
router.post('/', protect, authorize('restaurant'), createMenuItem);
router.get('/restaurant/:restaurantId', getMenuByRestaurant);
router.put('/:id', protect, authorize('restaurant'), updateMenuItem);
router.delete('/:id', protect, authorize('restaurant'), deleteMenuItem);
export default router;

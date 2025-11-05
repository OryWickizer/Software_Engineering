import { Router } from 'express';
import { register, login } from '../controller/auth.controller.js';

const router = Router();
import { createMenuItem, getMenuByRestaurant, updateMenuItem, deleteMenuItem, getSeasonalByRestaurant, getSeasonalAll } from '../controller/menu.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

//menu routes
router.post('/', protect, authorize('restaurant'), createMenuItem);
router.get('/restaurant/:restaurantId', getMenuByRestaurant);
router.get('/restaurant/:restaurantId/seasonal', getSeasonalByRestaurant);
router.get('/seasonal', getSeasonalAll);
router.put('/:id', protect, authorize('restaurant'), updateMenuItem);
router.delete('/:id', protect, authorize('restaurant'), deleteMenuItem);
export default router;

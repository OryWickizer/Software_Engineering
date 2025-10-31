import { Router } from 'express';
import { register, login } from '../controller/auth.controller.js';

import { getAllRestaurants, getRestaurantById } from '../controller/restaurant.controller.js';

const router = Router();
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
export default router;

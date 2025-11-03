import { Router } from 'express';
import { register, login, me } from '../controller/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

//auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);






export default router;
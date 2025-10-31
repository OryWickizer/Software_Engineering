import { Router } from 'express';
import { register, login } from '../controller/auth.controller.js';

const router = Router();

//auth routes
router.post('/register', register);
router.post('/login', login);






export default router;
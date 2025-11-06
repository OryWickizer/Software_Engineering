import { Router } from 'express';
import { updateAddress, geocodeOnly } from '../controller/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Geocode address without updating profile (for one-time orders)
router.post('/geocode', protect, geocodeOnly);

// Update address and geocode (for saving to profile)
router.post('/address', protect, updateAddress);

export default router;

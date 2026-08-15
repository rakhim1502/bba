import express from 'express';
import {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getHotels)
  .post(protect, authorize('ADMIN'), createHotel);

router.route('/:id')
  .get(getHotel)
  .put(protect, authorize('ADMIN'), updateHotel)
  .delete(protect, authorize('ADMIN'), deleteHotel);

export default router;

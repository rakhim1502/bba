import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

router.route('/:id')
  .get(protect, getBooking);

router.patch('/:id/cancel', protect, cancelBooking);

router.put('/:id/status', protect, authorize('ADMIN'), updateBookingStatus);

export default router;

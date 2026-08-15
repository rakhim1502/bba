import express from 'express';
import {
  getRooms,
  getRoom,
  checkAvailability,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getRooms);

router.get('/check-availability', checkAvailability);

router.route('/:id')
  .get(getRoom)
  .put(protect, authorize('ADMIN'), updateRoom)
  .delete(protect, authorize('ADMIN'), deleteRoom);

export default router;

import express from 'express';
import {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getDashboardStats,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('ADMIN'), getDashboardStats);

router.route('/')
  .get(protect, authorize('ADMIN'), getUsers);

router.route('/:id')
  .get(protect, authorize('ADMIN'), getUser)
  .put(protect, authorize('ADMIN'), updateUserRole)
  .delete(protect, authorize('ADMIN'), deleteUser);

export default router;

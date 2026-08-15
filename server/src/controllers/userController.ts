import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import User from '../models/User.js';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, role, search } = req.query;

  const query: any = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search as string, 'i') },
      { email: new RegExp(search as string, 'i') },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: users,
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    data: user,
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role',
    });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  await user.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const Hotel = (await import('../models/Hotel.js')).default;
  const Room = (await import('../models/Room.js')).default;
  const Booking = (await import('../models/Booking.js')).default;

  const totalHotels = await Hotel.countDocuments();
  const totalRooms = await Room.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalBookings = await Booking.countDocuments();

  const revenueData = await Booking.aggregate([
    { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayBookings = await Booking.countDocuments({
    createdAt: { $gte: today },
  });

  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('hotel', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const bookingsByStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      totalHotels,
      totalRooms,
      totalUsers,
      totalBookings,
      totalRevenue,
      todayBookings,
      recentBookings,
      bookingsByStatus,
    },
  });
});

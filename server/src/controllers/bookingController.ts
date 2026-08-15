import { asyncHandler } from '../middleware/error.js';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

export const createBooking = asyncHandler(async (req, res) => {
  const { roomId, checkIn, checkOut, guests, guestInfo } = req.body;

  if (!roomId || !checkIn || !checkOut || !guests || !guestInfo) {
    res.status(400).json({
      success: false,
      message: 'All required fields must be provided',
    });
    return;
  }

  const requestedCheckIn = new Date(checkIn);
  const requestedCheckOut = new Date(checkOut);

  if (requestedCheckIn >= requestedCheckOut) {
    res.status(400).json({
      success: false,
      message: 'Check-out date must be after check-in date',
    });
    return;
  }

  const room = await Room.findById(roomId).populate('hotel');
  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  if (guests > room.capacity) {
    res.status(400).json({
      success: false,
      message: `Room capacity is ${room.capacity}. Cannot accommodate ${guests} guests.`,
    });
    return;
  }

  const overlappingBookings = await Booking.find({
    room: roomId,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    $or: [
      {
        checkIn: { $lt: requestedCheckOut },
        checkOut: { $gt: requestedCheckIn },
      },
    ],
  });

  if (overlappingBookings.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Room is not available for the selected dates',
    });
    return;
  }

  const numberOfNights = Math.ceil(
    (requestedCheckOut.getTime() - requestedCheckIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = numberOfNights * room.price;

  const booking = await Booking.create({
    user: (req as any).user._id,
    hotel: room.hotel,
    room: roomId,
    checkIn: requestedCheckIn,
    checkOut: requestedCheckOut,
    guests,
    totalPrice,
    guestInfo,
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate('hotel')
    .populate('room')
    .populate('user');

  res.status(201).json({
    success: true,
    data: populatedBooking,
  });
});

export const getBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query: any = {};

  if ((req as any).user.role !== 'ADMIN') {
    query.user = (req as any).user._id;
  }

  if (status) {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const bookings = await Booking.find(query)
    .populate('hotel')
    .populate('room')
    .populate('user', '-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Booking.countDocuments(query);

  res.json({
    success: true,
    count: bookings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: bookings,
  });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('hotel')
    .populate('room')
    .populate('user', '-password');

  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found' });
    return;
  }

  if ((req as any).user.role !== 'ADMIN' && booking.user._id.toString() !== (req as any).user._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized to access this booking' });
    return;
  }

  res.json({
    success: true,
    data: booking,
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found' });
    return;
  }

  if ((req as any).user.role !== 'ADMIN' && booking.user.toString() !== (req as any).user._id.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    return;
  }

  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
    res.status(400).json({
      success: false,
      message: `Cannot cancel booking with status ${booking.status}`,
    });
    return;
  }

  booking.status = 'CANCELLED';
  await booking.save();

  res.json({
    success: true,
    data: booking,
  });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
    res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
    return;
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404).json({ success: false, message: 'Booking not found' });
    return;
  }

  booking.status = status;
  await booking.save();

  res.json({
    success: true,
    data: booking,
  });
});

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const { hotel, type, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  const query: any = { isAvailable: true };

  if (hotel) {
    query.hotel = hotel;
  }

  if (type) {
    query.type = type;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const rooms = await Room.find(query).populate('hotel').skip(skip).limit(Number(limit));

  const total = await Room.countDocuments(query);

  res.json({
    success: true,
    count: rooms.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: rooms,
  });
});

export const getRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.findById(req.params.id).populate('hotel');
  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  res.json({
    success: true,
    data: room,
  });
});

export const checkAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { roomId, checkIn, checkOut } = req.query;

  if (!roomId || !checkIn || !checkOut) {
    res.status(400).json({
      success: false,
      message: 'Room ID, check-in date, and check-out date are required',
    });
    return;
  }

  const requestedCheckIn = new Date(checkIn as string);
  const requestedCheckOut = new Date(checkOut as string);

  if (requestedCheckIn >= requestedCheckOut) {
    res.status(400).json({
      success: false,
      message: 'Check-out date must be after check-in date',
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

  const isAvailable = overlappingBookings.length === 0;

  res.json({
    success: true,
    data: {
      roomId,
      checkIn: requestedCheckIn,
      checkOut: requestedCheckOut,
      isAvailable,
    },
  });
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  let room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: room,
  });
});

export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404).json({ success: false, message: 'Room not found' });
    return;
  }

  await room.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

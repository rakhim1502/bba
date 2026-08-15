import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

export const getHotels = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    city,
    minPrice,
    maxPrice,
    rating,
    amenities,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const query: any = {};

  if (search) {
    query.$text = { $search: search as string };
  }

  if (city) {
    query['location.city'] = new RegExp(city as string, 'i');
  }

  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  if (amenities) {
    const amenityList = Array.isArray(amenities) ? amenities : [amenities];
    query.amenities = { $all: amenityList.map((a: string) => new RegExp(a, 'i')) };
  }

  const roomsQuery = { isAvailable: true };
  if (minPrice || maxPrice) {
    const priceQuery: any = {};
    if (minPrice) priceQuery.$gte = Number(minPrice);
    if (maxPrice) priceQuery.$lte = Number(maxPrice);
    roomsQuery.price = priceQuery;
  }

  const roomIds = await Room.find(roomsQuery).distinct('_id');
  const hotelsWithRooms = await Hotel.aggregate([
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: 'hotel',
        as: 'rooms',
        pipeline: [{ $match: roomsQuery }],
      },
    },
    {
      $match: {
        ...query,
        _id: { $in: roomIds.length > 0 ? roomIds : [new require('mongoose').Types.ObjectId()] },
      },
    },
  ]);

  const sortOptions: any = {};
  sortOptions[sortBy as string] = order === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);
  const total = hotelsWithRooms.length;

  const paginatedHotels = hotelsWithRooms.slice(skip, skip + Number(limit));

  const hotels = await Hotel.find({ _id: { $in: paginatedHotels.map((h: any) => h._id) } })
    .populate('rooms')
    .sort(sortOptions);

  res.json({
    success: true,
    count: hotels.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: hotels,
  });
});

export const getHotel = asyncHandler(async (req: Request, res: Response) => {
  const hotel = await Hotel.findById(req.params.id).populate('rooms');
  if (!hotel) {
    res.status(404).json({ success: false, message: 'Hotel not found' });
    return;
  }

  res.json({
    success: true,
    data: hotel,
  });
});

export const createHotel = asyncHandler(async (req: Request, res: Response) => {
  const hotel = await Hotel.create(req.body);
  res.status(201).json({
    success: true,
    data: hotel,
  });
});

export const updateHotel = asyncHandler(async (req: Request, res: Response) => {
  let hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    res.status(404).json({ success: false, message: 'Hotel not found' });
    return;
  }

  hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: hotel,
  });
});

export const deleteHotel = asyncHandler(async (req: Request, res: Response) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    res.status(404).json({ success: false, message: 'Hotel not found' });
    return;
  }

  await hotel.deleteOne();

  res.json({
    success: true,
    data: {},
  });
});

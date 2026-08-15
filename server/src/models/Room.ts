import mongoose from 'mongoose';

export type RoomType = 'Single' | 'Double' | 'Twin' | 'Deluxe' | 'Suite';

export interface IRoom extends mongoose.Document {
  hotel: mongoose.Types.ObjectId;
  roomNumber: string;
  type: RoomType;
  capacity: number;
  price: number;
  description: string;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new mongoose.Schema<IRoom>(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
      index: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Single', 'Double', 'Twin', 'Deluxe', 'Suite'],
      required: [true, 'Room type is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [20, 'Capacity cannot exceed 20'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ hotel: 1, type: 1 });

const Room = mongoose.model<IRoom>('Room', roomSchema);

export default Room;

import mongoose from 'mongoose';

export interface IHotel extends mongoose.Document {
  name: string;
  location: {
    city: string;
    address: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  description: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  priceRange: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const hotelSchema = new mongoose.Schema<IHotel>(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      minlength: [2, 'Hotel name must be at least 2 characters'],
      maxlength: [100, 'Hotel name cannot exceed 100 characters'],
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    priceRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

hotelSchema.index({ name: 'text', 'location.city': 'text', 'location.country': 'text' });

const Hotel = mongoose.model<IHotel>('Hotel', hotelSchema);

export default Hotel;

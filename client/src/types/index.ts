export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Location {
  city: string;
  address: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Hotel {
  _id: string;
  name: string;
  location: Location;
  description: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  priceRange: {
    min: number;
    max: number;
  };
  rooms?: Room[];
}

export type RoomType = 'Single' | 'Double' | 'Twin' | 'Deluxe' | 'Suite';

export interface Room {
  _id: string;
  hotel: string | Hotel;
  roomNumber: string;
  type: RoomType;
  capacity: number;
  price: number;
  description: string;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  _id: string;
  user: string | User;
  hotel: string | Hotel;
  room: string | Room;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  createdAt: string;
}

export interface Review {
  _id: string;
  user: string | User;
  hotel: string | Hotel;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DashboardStats {
  totalHotels: number;
  totalRooms: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  recentBookings: Booking[];
  bookingsByStatus: { _id: string; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

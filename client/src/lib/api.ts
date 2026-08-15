import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<{ _id: string; name: string; email: string; role: string; token: string }>>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ _id: string; name: string; email: string; role: string; token: string }>>('/auth/login', data),
  
  getMe: () => api.get<ApiResponse<{ _id: string; name: string; email: string; phone?: string; role: string }>>('/auth/me'),
};

export const hotelsApi = {
  getAll: (params?: {
    search?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    amenities?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => api.get<ApiResponse<any[]>>('/hotels', { params }),
  
  getById: (id: string) => api.get<ApiResponse<any>>(`/hotels/${id}`),
  
  create: (data: any) => api.post<ApiResponse<any>>('/hotels', data),
  
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/hotels/${id}`, data),
  
  delete: (id: string) => api.delete<ApiResponse<any>>(`/hotels/${id}`),
};

export const roomsApi = {
  getAll: (params?: {
    hotel?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) => api.get<ApiResponse<any[]>>('/rooms', { params }),
  
  getById: (id: string) => api.get<ApiResponse<any>>(`/rooms/${id}`),
  
  checkAvailability: (roomId: string, checkIn: string, checkOut: string) =>
    api.get<ApiResponse<{ roomId: string; checkIn: string; checkOut: string; isAvailable: boolean }>>('/rooms/check-availability', {
      params: { roomId, checkIn, checkOut },
    }),
  
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/rooms/${id}`, data),
  
  delete: (id: string) => api.delete<ApiResponse<any>>(`/rooms/${id}`),
};

export const bookingsApi = {
  create: (data: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestInfo: {
      fullName: string;
      email: string;
      phone: string;
      specialRequests?: string;
    };
  }) => api.post<ApiResponse<any>>('/bookings', data),
  
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<any[]>>('/bookings', { params }),
  
  getById: (id: string) => api.get<ApiResponse<any>>(`/bookings/${id}`),
  
  cancel: (id: string) => api.patch<ApiResponse<any>>(`/bookings/${id}/cancel`),
};

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get<ApiResponse<any[]>>('/users', { params }),
  
  getById: (id: string) => api.get<ApiResponse<any>>(`/users/${id}`),
  
  updateRole: (id: string, role: 'USER' | 'ADMIN') =>
    api.put<ApiResponse<any>>(`/users/${id}`, { role }),
  
  delete: (id: string) => api.delete<ApiResponse<any>>(`/users/${id}`),
  
  getDashboardStats: () => api.get<ApiResponse<any>>('/users/dashboard'),
};

export default api;

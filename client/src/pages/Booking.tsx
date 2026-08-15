import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { bookingsApi } from '../lib/api';
import { Hotel, Room, Booking } from '../types';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  hotel?: Hotel;
  room?: Room;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as LocationState;

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: '',
  });

  const { hotel, room, checkIn, checkOut, guests } = state || {};

  const mutation = useMutation({
    mutationFn: (data: any) =>
      bookingsApi.create({
        roomId: room!._id,
        checkIn: checkIn!,
        checkOut: checkOut!,
        guests: guests || 2,
        guestInfo: data,
      }),
    onSuccess: (response) => {
      navigate('/booking-success', { state: { booking: response.data.data } });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
    },
  });

  if (!hotel || !room || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No booking details found</h2>
          <button
            onClick={() => navigate('/hotels')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Browse Hotels
          </button>
        </div>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = nights * room.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Booking</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>
            
            <div className="space-y-4">
              <div>
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-lg">{hotel.name}</h3>
                <p className="text-gray-600 text-sm">
                  {hotel.location.city}, {hotel.location.country}
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Room Type</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{new Date(checkIn).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{new Date(checkOut).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price per night</span>
                  <span className="font-medium">${room.price}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Price</span>
                  <span className="text-primary-600">${totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Guest Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Any special requests or requirements..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  By clicking "Confirm Booking", you agree to our terms and conditions. 
                  You can cancel your booking up to 24 hours before check-in.
                </p>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Processing...' : `Confirm Booking - $${totalPrice}`}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../lib/api';
import { Booking } from '../../types';

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: () => bookingsApi.getAll(statusFilter !== 'all' ? { status: statusFilter } : undefined),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      alert('Booking cancelled successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    },
  });

  const bookings = bookingsData?.data.data as Booking[] | undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Bookings Management</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            {status === 'all' ? 'All Bookings' : status}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Guest</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Hotel</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Room</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Check-in</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Check-out</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Price</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-t hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">{booking.guestInfo.fullName}</p>
                        <p className="text-xs text-gray-500">{booking.guestInfo.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {typeof booking.hotel !== 'string' ? booking.hotel.name : 'Hotel'}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {typeof booking.room !== 'string' ? booking.room.type : 'Room'}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-right">
                      ${booking.totalPrice}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                              cancelMutation.mutate(booking._id);
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500">No bookings found</p>
        </div>
      )}
    </div>
  );
}

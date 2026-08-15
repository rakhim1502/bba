import { useNavigate, useLocation } from 'react-router-dom';
import { Booking } from '../types';

interface LocationState {
  booking?: Booking;
}

export default function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No booking found</h2>
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 print:shadow-none">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your reservation has been successfully completed</p>
          </div>

          {/* Booking Details */}
          <div className="border-t border-b py-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Booking ID</span>
              <span className="font-mono font-semibold">{booking._id}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>

          {/* Hotel Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Hotel Details</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {typeof booking.hotel !== 'string' && (
                <>
                  <h3 className="font-semibold text-lg">{booking.hotel.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {booking.hotel.location.address}, {booking.hotel.location.city},{' '}
                    {booking.hotel.location.country}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Room Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Room Details</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {typeof booking.room !== 'string' && (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Room Type</span>
                    <span className="font-medium">{booking.room.type}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Room Number</span>
                    <span className="font-medium">{booking.room.roomNumber}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dates & Guests */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Stay Details</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-semibold">{new Date(booking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-semibold">{new Date(booking.checkOut).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Guests</p>
                  <p className="font-semibold">{booking.guests}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="font-semibold text-primary-600">${booking.totalPrice}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800">{booking.guestInfo.fullName}</p>
              <p className="text-gray-600 text-sm">{booking.guestInfo.email}</p>
              <p className="text-gray-600 text-sm">{booking.guestInfo.phone}</p>
              {booking.guestInfo.specialRequests && (
                <p className="text-gray-600 text-sm mt-2">
                  Special Requests: {booking.guestInfo.specialRequests}
                </p>
              )}
            </div>
          </div>

          {/* Booking Date */}
          <div className="text-sm text-gray-500 text-center mb-6">
            Booked on {new Date(booking.createdAt).toLocaleString()}
          </div>

          {/* Actions */}
          <div className="flex gap-4 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Print Confirmation
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              View My Bookings
            </button>
          </div>

          <div className="mt-6 text-center print:hidden">
            <button
              onClick={() => navigate('/')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block mt-8 text-center text-sm text-gray-500">
          <p>Thank you for booking with HotelBook!</p>
          <p>For any questions, contact us at support@hotelbook.com</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hotelsApi, roomsApi, bookingsApi } from '../lib/api';
import { Hotel, Room } from '../types';
import { useAuth } from '../context/AuthContext';

export default function HotelDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const { data: hotelData, isLoading: hotelLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: () => hotelsApi.getById(id!),
    enabled: !!id,
  });

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms', { hotel: id }],
    queryFn: () => roomsApi.getAll({ hotel: id }),
    enabled: !!id,
  });

  const hotel = hotelData?.data.data as Hotel | undefined;
  const rooms = roomsData?.data.data as Room[] | undefined;

  const handleBookNow = () => {
    if (!selectedRoom || !checkIn || !checkOut) {
      alert('Please select a room and dates');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/booking', {
      state: {
        hotel,
        room: selectedRoom,
        checkIn,
        checkOut,
        guests,
      },
    });
  };

  if (hotelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel not found</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{hotel.name}</h1>
            <p className="text-lg md:text-xl opacity-90">
              {hotel.location.address}, {hotel.location.city}, {hotel.location.country}
            </p>
            <div className="flex items-center mt-4 gap-4">
              <div className="flex items-center">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="ml-1 text-lg font-semibold">{hotel.rating}</span>
                <span className="ml-1 opacity-80">({hotel.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${hotel.name} ${i + 1}`}
                    className="w-full h-40 md:h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ))}
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Hotel</h2>
              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-primary-600">✓</span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Available Rooms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Rooms</h2>
              {roomsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-md animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : rooms && rooms.length > 0 ? (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      onClick={() => setSelectedRoom(room)}
                      className={`bg-white rounded-xl overflow-hidden shadow-md cursor-pointer transition-all ${
                        selectedRoom?._id === room._id
                          ? 'ring-2 ring-primary-600'
                          : 'hover:shadow-lg'
                      }`}
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <img
                            src={room.images[0]}
                            alt={room.roomNumber}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="p-6 md:w-2/3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {room.type} Room
                              </h3>
                              <p className="text-gray-600 text-sm">Room {room.roomNumber}</p>
                            </div>
                            <span className="text-2xl font-bold text-primary-600">
                              ${room.price}
                              <span className="text-sm text-gray-500 font-normal">/night</span>
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3 line-clamp-2">{room.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>👥 Up to {room.capacity} guests</span>
                            <span>📏 {room.type}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {room.amenities.slice(0, 4).map((amenity, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No rooms available at this hotel.
                </div>
              )}
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Book Your Stay</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} Guest{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRoom && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Selected Room</h3>
                    <p className="text-gray-700">{selectedRoom.type} Room</p>
                    <p className="text-primary-600 font-bold">${selectedRoom.price}/night</p>
                    {checkIn && checkOut && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {Math.ceil(
                              (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            nights
                          </span>
                          <span className="font-semibold">
                            $
                            {Math.ceil(
                              (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) * selectedRoom.price}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleBookNow}
                  disabled={!selectedRoom || !checkIn || !checkOut}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthenticated ? 'Proceed to Booking' : 'Login to Book'}
                </button>

                {!selectedRoom && (
                  <p className="text-sm text-gray-500 text-center">
                    Please select a room from the list above
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsApi } from '../../lib/api';
import { Hotel } from '../../types';

export default function AdminHotels() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    country: '',
    description: '',
    amenities: '',
    images: '',
  });

  const { data: hotelsData, isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: () => hotelsApi.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => hotelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      setShowModal(false);
      resetForm();
      alert('Hotel created successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create hotel');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hotelsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      setShowModal(false);
      setEditingHotel(null);
      resetForm();
      alert('Hotel updated successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update hotel');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hotelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      alert('Hotel deleted successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to delete hotel');
    },
  });

  const hotels = hotelsData?.data.data as Hotel[] | undefined;

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      address: '',
      country: '',
      description: '',
      amenities: '',
      images: '',
    });
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      city: hotel.location.city,
      address: hotel.location.address,
      country: hotel.location.country,
      description: hotel.description,
      amenities: hotel.amenities.join(', '),
      images: hotel.images.join(', '),
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hotelData = {
      name: formData.name,
      location: {
        city: formData.city,
        address: formData.address,
        country: formData.country,
      },
      description: formData.description,
      amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      images: formData.images.split(',').map((i) => i.trim()).filter(Boolean),
    };

    if (editingHotel) {
      updateMutation.mutate({ id: editingHotel._id, data: hotelData });
    } else {
      createMutation.mutate(hotelData);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hotels Management</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingHotel(null);
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          + Add Hotel
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : hotels && hotels.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Location</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Rating</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Rooms</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel._id} className="border-t hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="font-medium">{hotel.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {hotel.location.city}, {hotel.location.country}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-yellow-500">★</span> {hotel.rating} ({hotel.reviewCount})
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {hotel.priceRange.min}-${hotel.priceRange.max}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleEdit(hotel)}
                      className="text-blue-600 hover:text-blue-800 mr-3 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${hotel.name}?`)) {
                          deleteMutation.mutate(hotel._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No hotels found</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
          >
            Add Your First Hotel
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="WiFi, Pool, Gym, Spa"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URLs (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingHotel
                    ? 'Update Hotel'
                    : 'Create Hotel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingHotel(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

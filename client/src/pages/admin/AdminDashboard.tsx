import { useQuery } from '@tanstack/react-query';
import { usersApi, bookingsApi, hotelsApi, roomsApi } from '../../lib/api';
import { DashboardStats } from '../../types';

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => usersApi.getDashboardStats(),
  });

  const stats = statsData?.data.data as DashboardStats | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Hotels', value: stats?.totalHotels || 0, icon: '🏨', color: 'bg-blue-100' },
    { title: 'Total Rooms', value: stats?.totalRooms || 0, icon: '🛏️', color: 'bg-green-100' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-purple-100' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: '📅', color: 'bg-yellow-100' },
    { title: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: '💰', color: 'bg-emerald-100' },
    { title: "Today's Bookings", value: stats?.todayBookings || 0, icon: '📆', color: 'bg-pink-100' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-full flex items-center justify-center`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
        
        {stats?.recentBookings && stats.recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Guest</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hotel</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Check-in</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      {typeof booking.user !== 'string' ? booking.user.name : 'Guest'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {typeof booking.hotel !== 'string' ? booking.hotel.name : 'Hotel'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-right">
                      ${booking.totalPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent bookings</p>
        )}
      </div>

      {/* Bookings by Status */}
      {stats?.bookingsByStatus && stats.bookingsByStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings by Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.bookingsByStatus.map((item) => (
              <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-primary-600">{item.count}</p>
                <p className="text-sm text-gray-600 mt-1">{item._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

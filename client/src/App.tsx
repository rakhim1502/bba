import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import Booking from './pages/Booking';
import BookingSuccess from './pages/BookingSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminLayout from './pages/admin/AdminLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Routes>
              <Route path="/" element={<><Navbar /><main className="flex-grow"><Home /></main><Footer /></>} />
              <Route path="/hotels" element={<><Navbar /><main className="flex-grow"><Hotels /></main><Footer /></>} />
              <Route path="/hotels/:id" element={<><Navbar /><main className="flex-grow"><HotelDetails /></main><Footer /></>} />
              <Route path="/booking" element={<><Navbar /><main className="flex-grow"><Booking /></main><Footer /></>} />
              <Route path="/booking-success" element={<><Navbar /><main className="flex-grow"><BookingSuccess /></main><Footer /></>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<><Navbar /><main className="flex-grow"><Dashboard /></main><Footer /></>} />
              <Route path="/admin/*" element={<AdminLayout />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});

    console.log('Cleared existing data...');

    // Create users
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      phone: '+1234567890',
      role: 'ADMIN',
    });

    await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: hashedUserPassword,
      phone: '+1987654321',
      role: 'USER',
    });

    console.log('Created users...');

    // Create hotels
    const hotels = await Hotel.create([
      {
        name: 'Grand Plaza Hotel',
        location: {
          city: 'New York',
          address: '123 Fifth Avenue, Manhattan',
          country: 'USA',
          coordinates: { latitude: 40.7128, longitude: -74.006 },
        },
        description: 'Luxury hotel in the heart of Manhattan with stunning city views and world-class amenities.',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        ],
        amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service', 'Parking'],
        rating: 4.8,
        reviewCount: 324,
        priceRange: { min: 200, max: 800 },
      },
      {
        name: 'Ocean View Resort',
        location: {
          city: 'Miami',
          address: '456 Ocean Drive, South Beach',
          country: 'USA',
          coordinates: { latitude: 25.7617, longitude: -80.1918 },
        },
        description: 'Beachfront resort offering breathtaking ocean views and premium beachside experience.',
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1571896349842-6e53ce41e8f2?w=800',
        ],
        amenities: ['WiFi', 'Private Beach', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Water Sports'],
        rating: 4.7,
        reviewCount: 256,
        priceRange: { min: 250, max: 1000 },
      },
      {
        name: 'Mountain Retreat Lodge',
        location: {
          city: 'Aspen',
          address: '789 Mountain Road',
          country: 'USA',
          coordinates: { latitude: 39.1911, longitude: -106.8175 },
        },
        description: 'Cozy mountain lodge perfect for skiing enthusiasts and nature lovers.',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
        ],
        amenities: ['WiFi', 'Fireplace', 'Ski Storage', 'Restaurant', 'Bar', 'Hiking Trails'],
        rating: 4.6,
        reviewCount: 189,
        priceRange: { min: 180, max: 600 },
      },
      {
        name: 'Urban Boutique Hotel',
        location: {
          city: 'San Francisco',
          address: '321 Market Street',
          country: 'USA',
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        },
        description: 'Modern boutique hotel in downtown San Francisco with contemporary design.',
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe215?w=800',
          'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800',
        ],
        amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'Business Center', 'Concierge'],
        rating: 4.5,
        reviewCount: 412,
        priceRange: { min: 150, max: 500 },
      },
      {
        name: 'Desert Oasis Resort',
        location: {
          city: 'Las Vegas',
          address: '555 Strip Boulevard',
          country: 'USA',
          coordinates: { latitude: 36.1699, longitude: -115.1398 },
        },
        description: 'Luxurious desert resort with casino, entertainment, and world-class dining.',
        images: [
          'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800',
          'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800',
        ],
        amenities: ['WiFi', 'Casino', 'Pool', 'Spa', 'Multiple Restaurants', 'Shows', 'Nightclub'],
        rating: 4.9,
        reviewCount: 567,
        priceRange: { min: 120, max: 900 },
      },
    ]);

    console.log('Created hotels...');

    // Create rooms for each hotel
    const allRooms: any[] = [];

    for (const hotel of hotels) {
      const hotelRooms = await Room.create([
        {
          hotel: hotel._id,
          roomNumber: `${hotel.name.charAt(0)}101`,
          type: 'Single',
          capacity: 1,
          price: hotel.priceRange.min,
          description: 'Cozy single room with modern amenities, perfect for solo travelers.',
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
          amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
          isAvailable: true,
        },
        {
          hotel: hotel._id,
          roomNumber: `${hotel.name.charAt(0)}201`,
          type: 'Double',
          capacity: 2,
          price: Math.round((hotel.priceRange.min + hotel.priceRange.max) / 3),
          description: 'Comfortable double room with queen-size bed and city views.',
          images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'],
          amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe'],
          isAvailable: true,
        },
        {
          hotel: hotel._id,
          roomNumber: `${hotel.name.charAt(0)}202`,
          type: 'Twin',
          capacity: 2,
          price: Math.round((hotel.priceRange.min + hotel.priceRange.max) / 3),
          description: 'Twin room with two single beds, ideal for friends or colleagues.',
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
          amenities: ['WiFi', 'TV', 'Air Conditioning', 'Work Desk', 'Safe'],
          isAvailable: true,
        },
        {
          hotel: hotel._id,
          roomNumber: `${hotel.name.charAt(0)}301`,
          type: 'Deluxe',
          capacity: 3,
          price: Math.round((hotel.priceRange.min + hotel.priceRange.max) * 2 / 3),
          description: 'Spacious deluxe room with premium furnishings and panoramic views.',
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
          amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Bathtub'],
          isAvailable: true,
        },
        {
          hotel: hotel._id,
          roomNumber: `${hotel.name.charAt(0)}401`,
          type: 'Suite',
          capacity: 4,
          price: hotel.priceRange.max,
          description: 'Luxurious suite with separate living area and premium amenities.',
          images: ['https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800'],
          amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Jacuzzi', 'Butler Service'],
          isAvailable: true,
        },
      ]);
      allRooms.push(...hotelRooms);
    }

    console.log('Created rooms...');

    // Create sample bookings
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    await Booking.create({
      user: (await User.findOne({ email: 'user@example.com' }))!._id,
      hotel: hotels[0]._id,
      room: allRooms[0]._id,
      checkIn,
      checkOut,
      guests: 1,
      totalPrice: allRooms[0].price * 3,
      status: 'CONFIRMED',
      guestInfo: {
        fullName: 'John Doe',
        email: 'user@example.com',
        phone: '+1987654321',
        specialRequests: 'Late check-in requested',
      },
    });

    console.log('Created sample bookings...');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📧 Test Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: user@example.com / user123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

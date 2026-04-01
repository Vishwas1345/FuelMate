/**
 * Seed / refresh the public demo customer account and a large delivered order history.
 *
 * Run from server directory:
 *   npm run seed:demo
 *
 * Requires MONGODB_URI in server/.env
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';

const DEMO_EMAIL = 'customer@fuelmate.com';
const DEMO_PASSWORD = 'DemoFuelMate2026!';

const formatAddress = (a) =>
  [a.addressLine, a.city, a.state, a.zipCode, a.country].filter(Boolean).join(', ');

const demoAddresses = [
  {
    label: 'home',
    addressLine: '12 Galaxy Heights, VIP Road',
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    zipCode: '395007',
  },
  {
    label: 'work',
    addressLine: 'Unit 402, Business Hub',
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    zipCode: '395009',
  },
  {
    label: 'other',
    addressLine: 'Near Dumas Beach Road',
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    zipCode: '395007',
  },
];

const demoVehicles = [
  { type: 'car', model: 'Honda City', plateNumber: 'GJ01DC9001' },
  { type: 'bike', model: 'Activa', plateNumber: 'GJ01BK2044' },
  { type: 'car', model: 'Hyundai Creta', plateNumber: 'GJ03AB7722' },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing. Set it in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);

  let user = await User.findOne({ email: DEMO_EMAIL });

  if (!user) {
    user = new User({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: 'Demo Customer',
      role: 'customer',
      authProvider: 'local',
      isProfileComplete: true,
      phone: '+91 98765 00000',
      addresses: demoAddresses,
      vehicles: demoVehicles,
    });
    await user.save();
    console.log('Created demo user:', DEMO_EMAIL);
  } else {
    user.name = 'Demo Customer';
    user.role = 'customer';
    user.authProvider = 'local';
    user.googleId = undefined;
    user.isProfileComplete = true;
    user.phone = user.phone || '+91 98765 00000';
    user.addresses = demoAddresses;
    user.vehicles = demoVehicles;
    user.password = DEMO_PASSWORD;
    await user.save();
    console.log('Updated demo user:', DEMO_EMAIL);
  }

  const station =
    (await User.findOne({ email: 'station@fuelmate.com', role: 'station' }).select(
      '_id businessName fuelProvider'
    )) ||
    (await User.findOne({ role: 'station' }).select('_id businessName fuelProvider')) ||
    null;
  const stationId = station?._id ?? null;
  const stationName = station?.businessName || 'FuelMate Partner (Demo)';
  const brand = station?.fuelProvider || 'IndianOil';

  const deleted = await Order.deleteMany({ userId: user._id });
  console.log(`Removed ${deleted.deletedCount} existing orders for demo user.`);

  const paymentMethods = ['upi', 'card', 'cash', 'netbanking'];
  const deliveryLines = demoAddresses.map(formatAddress);
  const now = Date.now();
  const orderDocs = [];

  const TOTAL_DELIVERED = 52;

  for (let i = 0; i < TOTAL_DELIVERED; i += 1) {
    const daysAgo = Math.min(85, Math.floor(i * 1.65) + (i % 7));
    const jitter = Math.floor(Math.random() * 3.6e6);
    const createdAt = new Date(now - daysAgo * 86400000 - jitter);

    const fuelType = i % 4 === 0 ? 'Diesel' : 'Petrol';
    const quantity = 3 + (i % 15);
    const unitPrice = fuelType === 'Petrol' ? 101.5 : 92.5;
    const fuelCost = quantity * unitPrice;
    const platformFee = quantity * 2;
    const sameCity = true;
    const deliveryFee = sameCity ? 0 : fuelType === 'Petrol' ? 35 : 40;
    const totalPrice = Math.round((fuelCost + platformFee + deliveryFee) * 100) / 100;

    orderDocs.push({
      userId: user._id,
      fuelType,
      quantity,
      brand,
      stationId,
      selectedStation: stationName,
      deliveryAddress: deliveryLines[i % deliveryLines.length],
      paymentMethod: paymentMethods[i % paymentMethods.length],
      totalPrice,
      status: 'delivered',
      estimatedDelivery: new Date(createdAt.getTime() + 30 * 60000),
      driver: {
        name: ['Amit Verma', 'Priya Patel', 'Rajesh Kumar'][i % 3],
        phone: '+91 98765 43210',
        email: 'driver@fuelmate.demo',
        currentLocation: 'Surat',
      },
      createdAt,
      updatedAt: createdAt,
    });
  }

  await Order.insertMany(orderDocs);
  console.log(`Inserted ${orderDocs.length} delivered orders.`);

  await mongoose.disconnect();

  console.log('\n--- Demo login (share with reviewers) ---');
  console.log('  Email:    ', DEMO_EMAIL);
  console.log('  Password: ', DEMO_PASSWORD);
  console.log('  Orders:   ', TOTAL_DELIVERED, 'delivered (order history + analytics)');
  console.log('-------------------------------------------\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Seed / refresh the full demo: one fuel station (seller) and one customer (buyer),
 * linked by ~6 months of orders, plus reviews and analytics.
 *
 *   demo@fuelmate.com      — station (Fuel Partner board)
 *   customer@fuelmate.com  — customer
 *
 * Run from server directory:
 *   npm run seed:demo
 *
 * Safe to rerun: only the two demo users' orders, reviews and analytics are replaced.
 * Requires MONGODB_URI in server/.env
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Analytics from '../models/Analytics.js';
import analyticsController from '../controllers/analyticsController.js';
import redis from '../lib/redis.js';

const STATION_EMAIL = 'demo@fuelmate.com';
const CUSTOMER_EMAIL = 'customer@fuelmate.com';
const DEMO_PASSWORD = 'DemoFuelMate2026!';

const DAY = 86400000;
const MIN = 60000;

const stationProfile = {
  name: 'Demo Station Admin',
  role: 'station',
  authProvider: 'local',
  googleId: undefined,
  isProfileComplete: true,
  isEmailVerified: true,
  phone: '+91 261 555 0100',
  avatar: 'https://ui-avatars.com/api/?name=Indian+Oil&background=FF6600&color=fff&size=128&bold=true',
  businessName: 'Indian Oil — Dumas VIP Road Hub',
  businessPhone: '+91 261 555 0100',
  gstNumber: '24AABCFM1234H1Z5',
  fuelProvider: 'IndianOil',
  pumpLocation: {
    addressLine: 'NH-48, Near Dumas Road Junction, VIP village',
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    zipCode: '395007',
    coordinates: { lat: 21.1702, lng: 72.8311 },
  },
  trucksNeeded: 5,
  driversNeeded: 8,
  about:
    'Indian Oil (IOCL) authorized retail + mobile dispensing for residential and SME fleets. ' +
    '24×7 dispatch desk, calibrated metering, and GPS-tracked bowsers for safe doorstep delivery across Surat.',
  history:
    'Operating since 2018. Moved to FuelMate in 2024 for a live order queue, partner payouts, and customer ETA tracking.',
  startingYear: 2018,
  isAvailable: true,
  fuelPrices: { petrol: 101.6, diesel: 92.65 },
};

const customerAddresses = [
  { label: 'home', addressLine: '12 Galaxy Heights, VIP Road', city: 'Surat', state: 'Gujarat', country: 'India', zipCode: '395007' },
  { label: 'work', addressLine: 'Unit 402, Business Hub, Ring Road', city: 'Surat', state: 'Gujarat', country: 'India', zipCode: '395002' },
  { label: 'other', addressLine: 'Near Dumas Beach Road', city: 'Surat', state: 'Gujarat', country: 'India', zipCode: '395007' },
];

const customerProfile = {
  name: 'Demo Customer',
  role: 'customer',
  authProvider: 'local',
  googleId: undefined,
  isProfileComplete: true,
  isEmailVerified: true,
  phone: '+91 98765 00000',
  avatar: 'https://ui-avatars.com/api/?name=Demo+Customer&background=f97316&color=fff&size=128&bold=true',
  dob: new Date('1994-06-15'),
  gender: 'prefer_not_to_say',
  addresses: customerAddresses,
  vehicles: [
    { type: 'car', model: 'Honda City', plateNumber: 'GJ05DC9001' },
    { type: 'bike', model: 'Honda Activa 6G', plateNumber: 'GJ05BK2044' },
    { type: 'car', model: 'Hyundai Creta', plateNumber: 'GJ05AB7722' },
  ],
};

const driverRoster = [
  { name: 'Amit Verma', phone: '+91 98765 43210', email: 'amit.verma@fuelmate.com', currentLocation: 'Adajan, Surat' },
  { name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya.patel@fuelmate.com', currentLocation: 'Vesu, Surat' },
  { name: 'Rajesh Kumar', phone: '+91 98765 43212', email: 'rajesh.kumar@fuelmate.com', currentLocation: 'City Light, Surat' },
];

const stationReviews = [
  { rating: 5, comment: 'Driver arrived in 25 minutes and the meter reading matched exactly. Great service.' },
  { rating: 5, comment: 'Saved me a trip on a busy Monday morning. Booking to delivery was seamless.' },
  { rating: 4, comment: 'Quick delivery to my office. Would love an evening slot after 9pm.' },
  { rating: 5, comment: 'Live tracking was spot on and Priya was very professional.' },
  { rating: 4, comment: 'Good prices, on-time delivery. One order was a bit late during the rain but they called ahead.' },
];

/** General app reviews shown on the landing page (no stationId on purpose). */
const landingReviews = [
  { name: 'Rahul Sharma', email: 'rahul.s@example.com', rating: 5, comment: 'FuelMate is a lifesaver for our delivery fleet. No more queues at the pump.' },
  { name: 'Meera Krishnan', email: 'meera.k@example.com', rating: 5, comment: 'Ordering fuel is now as easy as ordering food. Love the live ETA.' },
  { name: 'Arjun Patel', email: 'arjun.p@example.com', rating: 4, comment: 'Clean app, transparent pricing. The UPI checkout is quick.' },
  { name: 'Sneha Desai', email: 'sneha.d@example.com', rating: 5, comment: 'Got diesel delivered to our generator site the same hour. Brilliant.' },
  { name: 'Vikram Singh', email: 'vikram.s@example.com', rating: 4, comment: 'Reliable and safe. Drivers follow proper handling procedures.' },
];

const formatAddress = (a) => [a.addressLine, a.city, a.state, a.zipCode, a.country].filter(Boolean).join(', ');
const round2 = (n) => Math.round(n * 100) / 100;

/** Create the user, or overwrite an existing one with the demo profile and password. */
async function upsertUser(email, profile) {
  let user = await User.findOne({ email });
  const existed = Boolean(user);
  if (!user) user = new User({ email });
  Object.assign(user, profile);
  user.password = DEMO_PASSWORD;
  await user.save();
  console.log(`${existed ? 'Updated' : 'Created'} ${profile.role}:`, email);
  return user;
}

function buildOrders(customer, station) {
  const now = Date.now();
  const deliveryLines = customerAddresses.map(formatAddress);
  const paymentMethods = ['upi', 'card', 'upi', 'cash', 'netbanking'];
  const orders = [];

  const addOrder = (i, createdAt, status) => {
    const fuelType = i % 4 === 0 ? 'Diesel' : 'Petrol';
    const quantity = 3 + ((i * 7) % 18); // 3–20 L, the schema's range
    const unitPrice = fuelType === 'Petrol' ? station.fuelPrices.petrol : station.fuelPrices.diesel;
    const platformFee = quantity * 2;
    const deliveryFee = i % 6 === 0 ? (fuelType === 'Petrol' ? 35 : 40) : 0;
    const hasDriver = ['in-transit', 'delivered'].includes(status);

    orders.push({
      userId: customer._id,
      fuelType,
      quantity,
      brand: station.fuelProvider,
      stationId: station._id,
      selectedStation: station.businessName,
      deliveryAddress: deliveryLines[i % deliveryLines.length],
      paymentMethod: paymentMethods[i % paymentMethods.length],
      totalPrice: round2(quantity * unitPrice + platformFee + deliveryFee),
      status,
      estimatedDelivery: status === 'cancelled' ? undefined : new Date(createdAt.getTime() + 30 * MIN),
      driver: hasDriver ? driverRoster[i % driverRoster.length] : undefined,
      createdAt,
      updatedAt: status === 'delivered' ? new Date(createdAt.getTime() + (22 + (i % 15)) * MIN) : createdAt,
    });
  };

  // History: 86 orders over ~180 days, every 13th one cancelled.
  const HISTORY = 86;
  for (let i = 0; i < HISTORY; i += 1) {
    const daysAgo = 1 + Math.floor((i * 179) / HISTORY);
    const hourOfDay = 8 + ((i * 5) % 13); // 08:00–20:00
    const createdAt = new Date(now - daysAgo * DAY);
    createdAt.setHours(hourOfDay, (i * 17) % 60, 0, 0);
    addOrder(i, createdAt, i % 13 === 5 ? 'cancelled' : 'delivered');
  }

  // Live orders from today, so tracking and the station queue have something to show.
  [
    ['in-transit', 18],
    ['confirmed', 9],
    ['pending', 4],
    ['pending', 1],
  ].forEach(([status, minutesAgo], k) => addOrder(HISTORY + k, new Date(now - minutesAgo * MIN), status));

  return orders;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing. Set it in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const station = await upsertUser(STATION_EMAIL, stationProfile);
  const customer = await upsertUser(CUSTOMER_EMAIL, customerProfile);
  const demoIds = [station._id, customer._id];

  // Clear only what belongs to the demo pair, then rebuild it.
  const removedOrders = await Order.deleteMany({ $or: [{ userId: { $in: demoIds } }, { stationId: { $in: demoIds } }] });
  const removedReviews = await Review.deleteMany({
    $or: [{ userId: { $in: demoIds } }, { stationId: { $in: demoIds } }, { email: { $in: landingReviews.map((r) => r.email) } }],
  });
  console.log(`Removed ${removedOrders.deletedCount} old orders and ${removedReviews.deletedCount} old reviews.`);

  const orders = buildOrders(customer, station);
  await Order.insertMany(orders);

  const now = Date.now();
  await Review.insertMany([
    ...stationReviews.map((r, i) => ({
      ...r,
      userId: customer._id,
      stationId: station._id,
      name: customer.name,
      email: customer.email,
      createdAt: new Date(now - (150 - i * 32) * DAY),
    })),
    ...landingReviews.map((r, i) => ({ ...r, createdAt: new Date(now - (60 - i * 11) * DAY) })),
  ]);

  // Same aggregation the API uses, so the stored numbers match the orders exactly.
  for (const user of [station, customer]) {
    const stats = await analyticsController.aggregateAnalytics(user._id, user.role);
    await Analytics.findOneAndUpdate(
      { userId: user._id },
      { ...stats, role: user.role, lastUpdated: new Date() },
      { upsert: true }
    );
  }

  const countBy = (status) => orders.filter((o) => o.status === status).length;
  await mongoose.disconnect();
  redis.disconnect(); // lib/redis connects on import; close it so the script can exit

  console.log('\n--- Demo logins (share with reviewers) ---');
  console.log('  Station:  ', STATION_EMAIL);
  console.log('  Customer: ', CUSTOMER_EMAIL);
  console.log('  Password: ', DEMO_PASSWORD, '(both)');
  console.log(
    `  Orders:    ${orders.length} (${countBy('delivered')} delivered, ${countBy('cancelled')} cancelled, ` +
      `${countBy('in-transit')} in-transit, ${countBy('confirmed')} confirmed, ${countBy('pending')} pending)`
  );
  console.log(`  Reviews:   ${stationReviews.length} on the station, ${landingReviews.length} on the landing page`);
  console.log('  Analytics: 2 docs (station + customer)');
  console.log('------------------------------------------\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

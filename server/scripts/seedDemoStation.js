/**
 * Seed / refresh the public demo fuel-partner (station) account + rich profile +
 * a large delivered order history for station dashboards & analytics.
 *
 * Run from server directory:
 *   npm run seed:demo-station
 *
 * Recommended: run `npm run seed:demo` first so customer@fuelmate.com exists (used as one of the buyers).
 * Requires MONGODB_URI in server/.env
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';

const STATION_EMAIL = 'station@fuelmate.com';
const STATION_PASSWORD = 'DemoFuelMate2026!';
const DEMO_CUSTOMER_EMAIL = 'customer@fuelmate.com';

const buyerSeeds = [
  { email: 'sw-buyer1@fuelmate.com', name: 'Rahul Sharma', phone: '+91 90110 10001' },
  { email: 'sw-buyer2@fuelmate.com', name: 'Meera Krishnan', phone: '+91 90110 10002' },
  { email: 'sw-buyer3@fuelmate.com', name: 'Arjun Patel', phone: '+91 90110 10003' },
  { email: 'sw-buyer4@fuelmate.com', name: 'Sneha Desai', phone: '+91 90110 10004' },
  { email: 'sw-buyer5@fuelmate.com', name: 'Vikram Singh', phone: '+91 90110 10005' },
  { email: 'sw-buyer6@fuelmate.com', name: 'Ananya Iyer', phone: '+91 90110 10006' },
];

const deliveryPool = [
  '402, Green Valley, Adajan, Surat, Gujarat 395009',
  '18, City Light Road, Athwa, Surat, Gujarat 395007',
  'Shop 12, Vesu Main Road, Surat, Gujarat 395007',
  'Plot 7, Industrial Estate, Sachin, Surat, Gujarat 394230',
  '89, Ghod Dod Road, Surat, Gujarat 395007',
  'Tower B, VIP Road, Vesu, Surat, Gujarat 395007',
  'Near VR Mall, Dumas Road, Surat, Gujarat 395007',
];

const driverRoster = [
  { name: 'Amit Verma', phone: '+91 98765 43210', email: 'amit.verma@fuelmate.com', currentLocation: 'Adajan, Surat' },
  { name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya.patel@fuelmate.com', currentLocation: 'Vesu, Surat' },
  { name: 'Rajesh Kumar', phone: '+91 98765 43212', email: 'rajesh.kumar@fuelmate.com', currentLocation: 'City Light, Surat' },
];

async function ensureBuyer(doc) {
  let u = await User.findOne({ email: doc.email });
  const minimalAddress = [{
    label: 'home',
    addressLine: 'Demo delivery node',
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    zipCode: '395007',
  }];
  if (!u) {
    u = new User({
      email: doc.email,
      password: STATION_PASSWORD,
      name: doc.name,
      role: 'customer',
      authProvider: 'local',
      isProfileComplete: true,
      phone: doc.phone,
      addresses: minimalAddress,
      vehicles: [{ type: 'car', model: 'Demo', plateNumber: `GJDEMO${Math.floor(Math.random() * 9000)}` }],
    });
    await u.save();
    console.log('Created synthetic buyer:', doc.email);
  }
  return u;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing. Set it in server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);

  /** @type {mongoose.Document & any} */
  let station = await User.findOne({ email: STATION_EMAIL });

  const stationProfile = {
    name: 'Demo Station Admin',
    role: 'station',
    authProvider: 'local',
    googleId: undefined,
    isProfileComplete: true,
    phone: '+91 261 555 0100',
    businessName: 'Surat City Fuel Hub — Demo',
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
      'IOCL-authorized retail + mobile dispensing for residential and SME fleets. ' +
      '24×7 dispatch desk, calibrated metering, and GPS-tracked bowzers for safe doorstep delivery across Surat.',
    history:
      'Operating since 2018. Migrated to FuelMate in 2024 for live order queue, partner payouts, and customer ETA tracking.',
    startingYear: 2018,
    isAvailable: true,
    fuelPrices: { petrol: 101.6, diesel: 92.65 },
    avatar:
      'https://ui-avatars.com/api/?name=Surat+Fuel+Hub&background=f97316&color=fff&size=128',
  };

  if (!station) {
    station = new User({
      email: STATION_EMAIL,
      password: STATION_PASSWORD,
      ...stationProfile,
    });
    await station.save();
    console.log('Created demo station:', STATION_EMAIL);
  } else {
    Object.assign(station, stationProfile);
    station.password = STATION_PASSWORD;
    await station.save();
    console.log('Updated demo station:', STATION_EMAIL);
  }

  const buyerIds = [];
  const demoCustomer = await User.findOne({ email: DEMO_CUSTOMER_EMAIL });
  if (demoCustomer) buyerIds.push(demoCustomer._id);

  for (const b of buyerSeeds) {
    const u = await ensureBuyer(b);
    buyerIds.push(u._id);
  }

  if (buyerIds.length === 0) {
    console.error('No buyer users available. Run: npm run seed:demo');
    await mongoose.disconnect();
    process.exit(1);
  }

  const deleted = await Order.deleteMany({ stationId: station._id });
  console.log(`Removed ${deleted.deletedCount} existing orders for this station.`);

  const paymentMethods = ['upi', 'card', 'cash', 'netbanking'];
  const brand = station.fuelProvider;
  const stationName = station.businessName;
  const now = Date.now();
  const TOTAL_DELIVERED = 78;

  const orderDocs = [];
  for (let i = 0; i < TOTAL_DELIVERED; i += 1) {
    const daysAgo = Math.min(88, Math.floor(i * 1.12) + (i % 9));
    const jitter = Math.floor(Math.random() * 4.2e6);
    const createdAt = new Date(now - daysAgo * 86400000 - jitter);

    const fuelType = i % 5 === 0 ? 'Diesel' : 'Petrol';
    const quantity = 4 + (i % 14);
    const unitPrice = fuelType === 'Petrol' ? station.fuelPrices.petrol : station.fuelPrices.diesel;
    const fuelCost = quantity * unitPrice;
    const platformFee = Math.round(quantity * 2 * 100) / 100;
    const deliveryFee = i % 6 === 0 ? (fuelType === 'Petrol' ? 35 : 40) : 0;
    const totalPrice = Math.round((fuelCost + platformFee + deliveryFee) * 100) / 100;

    const userId = buyerIds[i % buyerIds.length];

    orderDocs.push({
      userId,
      fuelType,
      quantity,
      brand,
      stationId: station._id,
      selectedStation: stationName,
      deliveryAddress: deliveryPool[i % deliveryPool.length],
      paymentMethod: paymentMethods[i % paymentMethods.length],
      totalPrice,
      status: 'delivered',
      estimatedDelivery: new Date(createdAt.getTime() + 28 * 60000),
      driver: driverRoster[i % driverRoster.length],
      createdAt,
      updatedAt: createdAt,
    });
  }

  await Order.insertMany(orderDocs);
  console.log(`Inserted ${orderDocs.length} delivered orders for station dashboard.`);

  await mongoose.disconnect();

  console.log('\n--- Demo station login (Fuel Partner board) ---');
  console.log('  Email:    ', STATION_EMAIL);
  console.log('  Password: ', STATION_PASSWORD);
  console.log('  Orders:   ', TOTAL_DELIVERED, 'delivered (analytics + history)');
  console.log('  Buyers:   ', buyerIds.length, 'customer accounts (including', DEMO_CUSTOMER_EMAIL, 'if present)');
  console.log('------------------------------------------------\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

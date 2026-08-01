import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === 'local';
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  avatar: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'station'],
    default: 'customer'
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  /** Local signups only: false until email OTP verified; missing/true = can log in. */
  isEmailVerified: {
    type: Boolean,
  },
  // Customer specific fields
  addresses: [{
    label: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    addressLine: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    zipCode: { type: String, trim: true }
  }],
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  vehicles: [{
    type: { type: String, enum: ['car', 'bike', 'truck', 'other'], default: 'car' },
    model: { type: String, trim: true },
    plateNumber: { type: String, trim: true, uppercase: true }
  }],
  // Station (Seller) specific fields
  businessName: {
    type: String,
    trim: true
  },
  businessPhone: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  fuelProvider: {
    type: String,
    enum: ['HP', 'IndianOil', 'BharatPetroleum', 'Shell', 'Reliance', 'Nayara'],
    trim: true
  },
  pumpLocation: {
    addressLine: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  trucksNeeded: {
    type: Number,
    min: 0
  },
  driversNeeded: {
    type: Number,
    min: 0
  },
  // New Station fields
  about: {
    type: String,
    trim: true,
    default: ''
  },
  history: {
    type: String,
    trim: true,
    default: ''
  },
  startingYear: {
    type: Number
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  fuelPrices: {
    petrol: { type: Number, default: 101.5 },
    diesel: { type: Number, default: 92.5 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Skip password hashing for OAuth users or if password not modified
  if (!this.password || !this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;  // Use ES module export

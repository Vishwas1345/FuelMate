import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel'],
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  },
  brand: {
    type: String,
    required: true,
  },
  selectedStation: {
    type: String,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'upi', 'netbanking'],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending',
  },
  driver: {
    name: String,
    phone: String,
    email: String,
    currentLocation: String,
  },
  estimatedDelivery: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;  // Use ES module export

import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['customer', 'station'],
        required: true
    },
    totalFuel: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    fuelTypeBreakdown: {
        petrol: { type: Number, default: 0 },
        diesel: { type: Number, default: 0 }
    },
    dailyTrends: [
        {
            date: { type: String, required: true },
            quantity: { type: Number, default: 0 },
            amount: { type: Number, default: 0 }
        }
    ],
    monthlyTrends: [
        {
            month: { type: String, required: true }, // YYYY-MM
            quantity: { type: Number, default: 0 },
            amount: { type: Number, default: 0 }
        }
    ],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

export default Analytics;

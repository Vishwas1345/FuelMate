import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        default: function () {
            return this.email ? this.email.split('@')[0] : 'Anonymous';
        }
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Review', reviewSchema);

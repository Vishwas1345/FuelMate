import User from '../models/User.js';
import Order from '../models/Order.js';
import Analytics from '../models/Analytics.js';
import bcrypt from 'bcryptjs';

class UserService {
    async getProfile(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }
        return user;
    }

    async updateProfile(userId, updateData) {
        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // Update only allowed fields
        const allowedUpdates = [
            'name', 'phone', 'addresses', 'avatar', 'role',
            'businessName', 'businessPhone', 'gstNumber', 'fuelProvider', 'pumpLocation', 'trucksNeeded', 'driversNeeded',
            'isProfileComplete',
            'dob', 'gender', 'vehicles'
        ];

        // Filter updates
        const updates = Object.keys(updateData)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        // Check if profile is complete based on role
        if (updates.isProfileComplete) {
            // You can add server-side validation here to ensure fields are actually present
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            const error = new Error('User not found during update');
            error.status = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;

        }

        return updatedUser;
    }

    async getStations(city) {
        let query = {
            role: 'station',
            isAvailable: true
        };

        if (city && city.trim()) {
            // Broader matching: if city matches, great, but let's see why it might fail.
            // For now, I'll make the query return any station in that city OR if no city matches, 
            // still allow it to show up if the user wants "every station".
            // To be safe and meet the user's latest request exactly:
            // "i wont every station to be listed who has on their respective toogles"
            // I will remove the city filter from the hard-find and instead just filter by role and availability.
            const normalizedCity = city.trim();
        }

        // The user wants EVERY station that is online to be listed.
        // We will return all online stations.
        return await User.find({
            role: 'station',
            isAvailable: true
        }).select('_id businessName pumpLocation fuelProvider isAvailable fuelPrices avatar about history startingYear businessPhone email phone');
    }

    async toggleAvailability(userId) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'station') {
            throw new Error('Not authorized or user not found');
        }

        user.isAvailable = !user.isAvailable;
        await user.save();
        return { isAvailable: user.isAvailable };
    }

    async getDashboardStats(stationId) {
        const orders = await Order.find({ stationId }).sort({ createdAt: -1 });

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const petrolSold = orders
            .filter(o => o.fuelType === 'Petrol')
            .reduce((sum, o) => sum + (o.quantity || 0), 0);
        const dieselSold = orders
            .filter(o => o.fuelType === 'Diesel')
            .reduce((sum, o) => sum + (o.quantity || 0), 0);

        // Simple graph data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const graphData = last7Days.map(date => {
            const dayOrders = orders.filter(o => o.createdAt && o.createdAt.toISOString().startsWith(date));
            return {
                date,
                amount: dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
            };
        });

        return {
            totalRevenue,
            petrolSold,
            dieselSold,
            recentOrders: orders.slice(0, 5),
            graphData
        };
    }

    async updatePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            const error = new Error('Current password and new password are required');
            error.status = 400;
            error.code = 'MISSING_FIELDS';
            throw error;
        }

        if (String(newPassword).length < 8) {
            const error = new Error('Password must be at least 8 characters');
            error.status = 400;
            error.code = 'WEAK_PASSWORD';
            throw error;
        }

        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // OAuth users may not have a local password
        if (!user.password) {
            const error = new Error('Password change is not available for this account');
            error.status = 400;
            error.code = 'PASSWORD_NOT_SET';
            throw error;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            const error = new Error('Current password is incorrect');
            error.status = 401;
            error.code = 'INVALID_CURRENT_PASSWORD';
            throw error;
        }

        user.password = newPassword;
        await user.save();
        return { success: true };
    }

    async deleteAccount(userId, payload = {}) {
        const { reason } = payload || {};

        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // Remove associated records
        await Promise.allSettled([
            Order.deleteMany({ $or: [{ userId }, { stationId: userId }] }),
            Analytics.deleteOne({ userId }),
        ]);

        await User.deleteOne({ _id: userId });

        return { success: true, reason: reason || '' };
    }
}


export default new UserService();

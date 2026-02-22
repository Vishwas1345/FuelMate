import User from '../models/User.js';
import Order from '../models/Order.js';

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
        }).select('businessName pumpLocation fuelProvider isAvailable fuelPrices avatar');
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
}


export default new UserService();

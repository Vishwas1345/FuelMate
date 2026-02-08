import User from '../models/User.js';

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
}

export default new UserService();

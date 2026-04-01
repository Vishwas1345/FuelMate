import userService from '../services/userService.js';
import logger from '../utils/logger.js';

class UserController {
    async getProfile(req, res) {
        try {
            logger.info('Fetching user profile', { userId: req.user._id });
            const user = await userService.getProfile(req.user._id);
            logger.info('User profile fetched successfully', { userId: req.user._id });
            res.json(user);
        } catch (error) {
            logger.error('Error fetching profile', { error: error.message, stack: error.stack, userId: req.user?._id });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            logger.info('Updating user profile', { userId: req.user._id, fields: Object.keys(req.body) });
            const updatedUser = await userService.updateProfile(req.user._id, req.body);
            logger.info('User profile updated successfully', { userId: req.user._id });
            res.json(updatedUser);
        } catch (error) {
            logger.error('Error updating profile', { error: error.message, stack: error.stack, userId: req.user?._id });
            res.status(error.status || 500).json({ message: error.message });
        }
    }
    async getStations(req, res) {
        try {
            const { city } = req.query;
            logger.info('Fetching stations', { city });
            const stations = await userService.getStations(city);
            res.json(stations);
        } catch (error) {
            logger.error('Error fetching stations', { error: error.message });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async toggleAvailability(req, res) {
        try {
            logger.info('Toggling availability', { userId: req.user._id });
            const result = await userService.toggleAvailability(req.user._id);
            res.json(result);
        } catch (error) {
            logger.error('Error toggling availability', { error: error.message });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getDashboardStats(req, res) {
        try {
            logger.info('Fetching dashboard stats', { userId: req.user._id });
            const stats = await userService.getDashboardStats(req.user._id);
            res.json(stats);
        } catch (error) {
            logger.error('Error fetching dashboard stats', { error: error.message });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async updatePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body || {};
            logger.info('Updating password', { userId: req.user._id });
            const result = await userService.updatePassword(req.user._id, currentPassword, newPassword);
            res.json(result);
        } catch (error) {
            logger.error('Error updating password', { error: error.message, userId: req.user?._id });
            res.status(error.status || 500).json({ message: error.message, code: error.code });
        }
    }

    async deleteAccount(req, res) {
        try {
            const { reason } = req.body || {};
            logger.warn('Deleting account', { userId: req.user._id, reason: reason || '' });
            const result = await userService.deleteAccount(req.user._id, { reason });
            res.json(result);
        } catch (error) {
            logger.error('Error deleting account', { error: error.message, userId: req.user?._id });
            res.status(error.status || 500).json({ message: error.message, code: error.code });
        }
    }
}

export default new UserController();

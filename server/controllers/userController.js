import userService from '../services/userService.js';
import logger from '../utils/logger.js';

class UserController {
    async getProfile(req, res) {
        try {
            const user = await userService.getProfile(req.user._id);
            res.json(user);
        } catch (error) {
            logger.error('Error fetching profile', { error: error.message, stack: error.stack, userId: req.user?._id });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const updatedUser = await userService.updateProfile(req.user._id, req.body);
            res.json(updatedUser);
        } catch (error) {
            logger.error('Error updating profile', { error: error.message, stack: error.stack, userId: req.user?._id });
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

export default new UserController();

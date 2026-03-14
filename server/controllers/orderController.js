import orderService from '../services/orderService.js';
import logger from '../utils/logger.js';

class OrderController {
    async getUserOrders(req, res) {
        try {
            logger.info('Fetching user orders', { userId: req.user.id, role: req.user.role });
            const orders = await orderService.getUserOrders(req.user.id, req.user.role);
            logger.info('User orders fetched successfully', { userId: req.user.id, count: orders.length });
            res.json(orders);
        } catch (error) {
            logger.error('Error fetching user orders', { error: error.message, stack: error.stack, userId: req.user?.id });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async createOrder(req, res) {
        try {
            logger.info('Creating new order', { userId: req.user.id, fuelType: req.body.fuelType, quantity: req.body.quantity });
            const orderValue = {
                ...req.body,
                totalPrice: req.body.billSummary?.total || req.body.totalPrice // Ensure totalPrice is set
            };
            const order = await orderService.createOrder(orderValue, req.user.id);
            logger.info('Order created successfully', { userId: req.user.id, orderId: order._id });
            res.status(201).json(order);
        } catch (error) {
            logger.error('Error creating order', { error: error.message, stack: error.stack, userId: req.user?.id });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async createPetrolOrder(req, res) {
        req.body.fuelType = 'Petrol';
        return this.createOrder(req, res);
    }

    async createDieselOrder(req, res) {
        req.body.fuelType = 'Diesel';
        return this.createOrder(req, res);
    }

    async placeOrder(req, res) {
        try {
            logger.info('Placing new order', {
                userId: req.user.id,
                fuelType: req.body.fuelType,
                quantity: req.body.quantity,
                stationId: req.body.stationId
            });

            const order = await orderService.placeOrder(req.body, req.user.id);

            logger.info('Order placed successfully', {
                userId: req.user.id,
                orderId: order._id,
                status: order.status
            });

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                order
            });
        } catch (error) {
            logger.error('Error placing order', {
                error: error.message,
                stack: error.stack,
                userId: req.user?.id,
                code: error.code
            });
            res.status(error.status || 500).json({
                success: false,
                message: error.message,
                code: error.code || 'ORDER_PLACEMENT_ERROR'
            });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            logger.info('Updating order status', { orderId: req.params.orderId, userId: req.user.id, newStatus: req.body.status });
            const order = await orderService.updateOrderStatus(
                req.params.orderId,
                req.user.id,
                req.body
            );
            logger.info('Order status updated successfully', { orderId: req.params.orderId, status: order.status });
            res.json(order);
        } catch (error) {
            logger.error('Error updating order status', { error: error.message, stack: error.stack, orderId: req.params.orderId });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getOrderHistory(req, res) {
        try {
            logger.info('Fetching order history', { userId: req.user.id });
            const orders = await orderService.getOrderHistory(req.user.id);
            logger.info('Order history fetched successfully', { userId: req.user.id, count: orders.length });
            res.json(orders);
        } catch (error) {
            logger.error('Error fetching order history', { error: error.message, stack: error.stack, userId: req.user?.id });
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            logger.info('Fetching order by ID', { orderId: req.params.orderId, userId: req.user.id });
            const order = await orderService.getOrderById(req.params.orderId, req.user.id);
            logger.info('Order fetched successfully', { orderId: req.params.orderId });
            res.json(order);
        } catch (error) {
            logger.error('Error fetching order', { error: error.message, stack: error.stack, orderId: req.params.orderId });
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

export default new OrderController();

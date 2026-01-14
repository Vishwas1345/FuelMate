import Order from '../models/Order.js';

class OrderService {
    async getUserOrders(userId) {
        return await Order.find({ userId })
            .sort({ createdAt: -1 });
    }

    async createOrder(orderData, userId) {
        return await Order.create({
            ...orderData,
            userId,
        });
    }

    async updateOrderStatus(orderId, userId, updateData) {
        const { status, driver } = updateData;

        const order = await Order.findById(orderId);
        if (!order) {
            const error = new Error('Order not found');
            error.status = 404;
            error.code = 'ORDER_NOT_FOUND';
            throw error;
        }

        if (order.userId.toString() !== userId.toString()) {
            const error = new Error('Not authorized to update this order');
            error.status = 403;
            error.code = 'UNAUTHORIZED';
            throw error;
        }

        order.status = status;
        order.updatedAt = new Date();

        if (status === 'confirmed') {
            order.estimatedDelivery = new Date(Date.now() + 1000 * 60 * 45); // 45 minutes from now
        }

        if (status === 'in-transit' && driver) {
            order.driver = driver;
        }

        return await order.save();
    }

    async getOrderHistory(userId) {
        return await Order.find({
            userId,
            status: 'delivered'
        })
            .sort({ createdAt: -1 })
            .limit(10);
    }

    async getOrderById(orderId, userId) {
        const order = await Order.findById(orderId);

        if (!order) {
            const error = new Error('Order not found');
            error.status = 404;
            error.code = 'ORDER_NOT_FOUND';
            throw error;
        }

        if (order.userId.toString() !== userId.toString()) {
            const error = new Error('Not authorized to view this order');
            error.status = 403;
            error.code = 'UNAUTHORIZED';
            throw error;
        }

        return order;
    }
}

export default new OrderService();

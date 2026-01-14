import orderService from '../services/orderService.js';

class OrderController {
    async getUserOrders(req, res) {
        try {
            const orders = await orderService.getUserOrders(req.user.id);
            res.json(orders);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async createOrder(req, res) {
        try {
            const order = await orderService.createOrder(req.body, req.user.id);
            res.status(201).json(order);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const order = await orderService.updateOrderStatus(
                req.params.orderId,
                req.user.id,
                req.body
            );
            res.json(order);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getOrderHistory(req, res) {
        try {
            const orders = await orderService.getOrderHistory(req.user.id);
            res.json(orders);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.orderId, req.user.id);
            res.json(order);
        } catch (error) {
            res.status(error.status || 500).json({ message: error.message });
        }
    }
}

export default new OrderController();

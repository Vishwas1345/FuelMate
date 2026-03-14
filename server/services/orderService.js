import Order from '../models/Order.js';

class OrderService {
    async getUserOrders(userId, role) {
        console.log('Fetching orders for role:', role, 'userId:', userId);
        if (role === 'station') {
            const orders = await Order.find({ stationId: userId })
                .populate('userId', 'name email phone avatar')
                .sort({ createdAt: -1 })
                .lean();
            console.log(`Found ${orders.length} orders for station ${userId}`);
            if (orders.length > 0) {
                console.log('First order stationId:', orders[0].stationId);
                console.log('First order status:', orders[0].status);
            }
            return orders.map(order => ({
                ...order,
                customer: order.userId,
                id: order._id.toString(),
                _id: order._id.toString()
            }));
        }
        return await Order.find({ userId })
            .sort({ createdAt: -1 });
    }

    async createOrder(orderData, userId) {
        return await Order.create({
            ...orderData,
            userId,
        });
    }

    async placeOrder(orderData, userId) {
        // Validate required fields
        if (!orderData.fuelType || !orderData.quantity || !orderData.deliveryAddress || !orderData.paymentMethod) {
            const error = new Error('Missing required order fields: fuelType, quantity, deliveryAddress, and paymentMethod are required');
            error.status = 400;
            error.code = 'MISSING_FIELDS';
            throw error;
        }

        // Validate quantity
        const quantity = parseFloat(orderData.quantity);
        if (isNaN(quantity) || quantity < 1 || quantity > 20) {
            const error = new Error('Quantity must be between 1 and 20 liters');
            error.status = 400;
            error.code = 'INVALID_QUANTITY';
            throw error;
        }

        // Validate fuel type
        if (!['Petrol', 'Diesel'].includes(orderData.fuelType)) {
            const error = new Error('Invalid fuel type. Must be Petrol or Diesel');
            error.status = 400;
            error.code = 'INVALID_FUEL_TYPE';
            throw error;
        }

        // Validate payment method
        const validPaymentMethods = ['cash', 'card', 'upi', 'netbanking'];
        if (!validPaymentMethods.includes(orderData.paymentMethod)) {
            const error = new Error('Invalid payment method');
            error.status = 400;
            error.code = 'INVALID_PAYMENT_METHOD';
            throw error;
        }

        // Validate totalPrice
        if (!orderData.totalPrice || isNaN(parseFloat(orderData.totalPrice))) {
            const error = new Error('Total price is required and must be a valid number');
            error.status = 400;
            error.code = 'INVALID_TOTAL_PRICE';
            throw error;
        }

        // Validate selectedStation (required by model)
        if (!orderData.selectedStation) {
            const error = new Error('Selected station is required');
            error.status = 400;
            error.code = 'MISSING_STATION';
            throw error;
        }

        // Calculate estimated delivery time (30 minutes from now)
        const estimatedDelivery = new Date(Date.now() + 1000 * 60 * 30);

        console.log('Creating order with stationId:', orderData.stationId);

        // Create order with all validated data
        const order = await Order.create({
            userId,
            fuelType: orderData.fuelType,
            quantity: quantity,
            brand: orderData.brand || orderData.selectedStation,
            stationId: orderData.stationId || null,
            selectedStation: orderData.selectedStation,
            deliveryAddress: orderData.deliveryAddress,
            paymentMethod: orderData.paymentMethod,
            totalPrice: parseFloat(orderData.totalPrice),
            status: 'pending',
            estimatedDelivery,
        });

        return order;
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

        if (order.userId.toString() !== userId.toString() && (!order.stationId || order.stationId.toString() !== userId.toString())) {
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

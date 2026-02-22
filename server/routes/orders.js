import express from 'express';
import orderController from '../controllers/orderController.js';

const router = express.Router();

// Get all orders for a user
router.get('/', orderController.getUserOrders);

// Create a new order (generic)
router.post('/', orderController.createOrder);

// Separate endpoints for specific fuel types
router.post('/petrol', orderController.createPetrolOrder);
router.post('/diesel', orderController.createDieselOrder);

// Get order history (completed orders)
router.get('/history', orderController.getOrderHistory);

// Get a specific order
router.get('/:orderId', orderController.getOrderById);

// Update order status
router.patch('/:orderId/status', orderController.updateOrderStatus);

export default router; 
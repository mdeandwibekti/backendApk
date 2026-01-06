const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Urutan sangat penting: taruh rute statis (seperti /stats) DI ATAS rute dinamis (/:id)
router.get('/stats', orderController.getOrderStats);
router.post('/from-cart', orderController.createOrderFromCart);
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);

// Rute dengan parameter (dinamis)
router.get('/:id', orderController.getOrderById);
router.get('/user/:user_id', orderController.getOrderByUserId);
router.get('/number/:order_number', orderController.getOrderByNumber);
router.put('/status/:id', orderController.updateOrderStatus);
router.put('/:id', orderController.updateOrder);
router.patch('/cancel/:id', orderController.cancelOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
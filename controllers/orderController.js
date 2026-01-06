const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// --- HELPER FUNCTION ---
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// --- CREATE ORDER FROM CART ---
exports.createOrderFromCart = async (req, res) => {
    try {
        const { user_id, shipping_address, shipping_phone, notes } = req.body;
        if (!user_id || !shipping_address) {
            return res.status(400).json({ msg: "User ID dan alamat harus diisi!" });
        }

        const cartItems = await Cart.findAll({
            where: { user_id },
            include: [{ model: Product }]
        });

        if (cartItems.length === 0) return res.status(400).json({ msg: "Keranjang kosong!" });

        let total_price = 0;
        cartItems.forEach(item => {
            total_price += item.Product.price * item.quantity;
        });

        const newOrder = await Order.create({
            user_id,
            order_number: generateOrderNumber(),
            total_price,
            status: 'pending',
            shipping_address,
            shipping_phone
        });

        for (const item of cartItems) {
            await Transaction.create({
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.Product.price
            });
        }

        await Cart.destroy({ where: { user_id } });
        res.status(201).json({ msg: "Order berhasil dibuat", data: newOrder });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ALL ORDERS ---
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [User, Transaction]
        });
        res.json({ data: orders });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ORDER BY ID ---
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [Transaction]
        });
        if (!order) return res.status(404).json({ msg: "Order tidak ditemukan" });
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ORDER STATS ---
exports.getOrderStats = async (req, res) => {
    try {
        const count = await Order.count();
        res.json({ data: { total_orders: count } });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- DELETE ORDER ---
exports.deleteOrder = async (req, res) => {
    try {
        await Transaction.destroy({ where: { order_id: req.params.id } });
        await Order.destroy({ where: { id: req.params.id } });
        res.json({ msg: "Order dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Fungsi tambahan agar tidak error saat dipanggil di routes
exports.createOrder = async (req, res) => { res.json({msg: "Manual order logic here"}); };
exports.getOrderByUserId = async (req, res) => { res.json({msg: "User order logic here"}); };
exports.getOrderByNumber = async (req, res) => { res.json({msg: "Search by number logic here"}); };
exports.updateOrderStatus = async (req, res) => { res.json({msg: "Update status logic here"}); };
exports.updateOrder = async (req, res) => { res.json({msg: "Update order logic here"}); };
exports.cancelOrder = async (req, res) => { res.json({msg: "Cancel logic here"}); };
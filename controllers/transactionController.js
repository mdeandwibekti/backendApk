const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');

// --- HELPER FUNCTION ---
const generateTransactionNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `TRX-${timestamp}-${random}`;
};

// --- CREATE TRANSACTION ---
exports.createTransaction = async (req, res) => {
    try {
        const { user_id, order_id, amount, payment_method, notes } = req.body;

        // Validasi input
        if (!user_id || !order_id || !amount) {
            return res.status(400).json({ msg: "User ID, Order ID, dan Amount harus diisi!" });
        }

        // Cek user exist
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // Cek order exist
        const order = await Order.findByPk(order_id);
        if (!order) {
            return res.status(404).json({ msg: "Order tidak ditemukan" });
        }

        // Generate transaction number
        const transaction_number = generateTransactionNumber();

        const newTransaction = await Transaction.create({
            user_id,
            order_id,
            amount,
            payment_method: payment_method || 'bank_transfer',
            transaction_number,
            notes,
            status: 'pending'
        });

        res.status(201).json({
            msg: "Transaksi berhasil dibuat",
            data: newTransaction
        });

    } catch (error) {
        console.log("ERROR CREATE TRANSACTION:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ALL TRANSACTIONS ---
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Order,
                    attributes: ['id', 'total_price', 'status']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            msg: "Data transaksi berhasil diambil",
            count: transactions.length,
            data: transactions
        });

    } catch (error) {
        console.log("ERROR GET TRANSACTIONS:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET TRANSACTION BY ID ---
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'fullname']
                },
                {
                    model: Order,
                    attributes: ['id', 'total_price', 'status']
                }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
        }

        res.json({
            msg: "Data transaksi berhasil diambil",
            data: transaction
        });

    } catch (error) {
        console.log("ERROR GET TRANSACTION BY ID:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET TRANSACTION BY USER ID ---
exports.getTransactionByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;

        const transactions = await Transaction.findAll({
            where: { user_id },
            include: [
                {
                    model: Order,
                    attributes: ['id', 'total_price', 'status']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        if (transactions.length === 0) {
            return res.status(404).json({ msg: "Tidak ada transaksi untuk user ini" });
        }

        res.json({
            msg: "Data transaksi user berhasil diambil",
            count: transactions.length,
            data: transactions
        });

    } catch (error) {
        console.log("ERROR GET TRANSACTION BY USER ID:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET TRANSACTION BY TRANSACTION NUMBER ---
exports.getTransactionByNumber = async (req, res) => {
    try {
        const { transaction_number } = req.params;

        const transaction = await Transaction.findOne({
            where: { transaction_number },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'fullname']
                },
                {
                    model: Order,
                    attributes: ['id', 'total_price', 'status']
                }
            ]
        });

        if (!transaction) {
            return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
        }

        res.json({
            msg: "Data transaksi berhasil diambil",
            data: transaction
        });

    } catch (error) {
        console.log("ERROR GET TRANSACTION BY NUMBER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE TRANSACTION STATUS ---
exports.updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ msg: "Status harus diisi!" });
        }

        const transaction = await Transaction.findByPk(id);

        if (!transaction) {
            return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
        }

        // Jika status berubah menjadi success, catat waktu pembayaran
        let paid_at = transaction.paid_at;
        if (status === 'success' && !transaction.paid_at) {
            paid_at = new Date();
        }

        await transaction.update({
            status,
            paid_at
        });

        res.json({
            msg: "Status transaksi berhasil diupdate",
            data: transaction
        });

    } catch (error) {
        console.log("ERROR UPDATE TRANSACTION STATUS:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE TRANSACTION ---
exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, payment_method, notes } = req.body;

        const transaction = await Transaction.findByPk(id);

        if (!transaction) {
            return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
        }

        await transaction.update({
            amount: amount || transaction.amount,
            payment_method: payment_method || transaction.payment_method,
            notes: notes || transaction.notes
        });

        res.json({
            msg: "Transaksi berhasil diupdate",
            data: transaction
        });

    } catch (error) {
        console.log("ERROR UPDATE TRANSACTION:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- DELETE TRANSACTION ---
exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByPk(id);

        if (!transaction) {
            return res.status(404).json({ msg: "Transaksi tidak ditemukan" });
        }

        await transaction.destroy();

        res.json({
            msg: "Transaksi berhasil dihapus"
        });

    } catch (error) {
        console.log("ERROR DELETE TRANSACTION:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET TRANSACTION STATISTICS ---
exports.getTransactionStats = async (req, res) => {
    try {
        const total_transactions = await Transaction.count();
        const total_amount = await Transaction.sum('amount', {
            where: { status: 'success' }
        });
        const pending_count = await Transaction.count({
            where: { status: 'pending' }
        });
        const success_count = await Transaction.count({
            where: { status: 'success' }
        });
        const failed_count = await Transaction.count({
            where: { status: 'failed' }
        });

        res.json({
            msg: "Statistik transaksi berhasil diambil",
            data: {
                total_transactions,
                total_amount: total_amount || 0,
                pending_count,
                success_count,
                failed_count
            }
        });

    } catch (error) {
        console.log("ERROR GET TRANSACTION STATS:", error);
        res.status(500).json({ msg: error.message });
    }
};

const Product = require('../models/Product');
const User = require('../models/User');
const { Op } = require('sequelize');

// --- CREATE PRODUCT ---
exports.createProduct = async (req, res) => {
    try {
        const { name, price, stock, description, category } = req.body;

        // 🔥 Ambil seller_id dari JWT (Middleware verifyToken)
        const seller_id = req.user.id;

        const product = await Product.create({
            name,
            price,
            stock,
            description,
            category,
            seller_id
        });

        res.json({
            status: true,
            message: "Produk berhasil ditambahkan",
            data: product
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// --- GET ALL PRODUCTS ---
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { is_active: true },
            order: [['created_at', 'DESC']]
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- GET PRODUCT BY ID ---
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'fullname', 'phone']
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ msg: "Produk tidak ditemukan" });
        }

        res.json({
            msg: "Data produk berhasil diambil",
            data: product
        });

    } catch (error) {
        console.log("ERROR GET PRODUCT BY ID:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET PRODUCTS BY SELLER ID (Public View) ---
exports.getProductBySellerId = async (req, res) => {
    try {
        const { seller_id } = req.params;

        const seller = await User.findByPk(seller_id);
        if (!seller) {
            return res.status(404).json({ msg: "Seller tidak ditemukan" });
        }

        const products = await Product.findAll({
            where: { seller_id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            msg: "Data produk seller berhasil diambil",
            count: products.length,
            data: products
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- GET MY PRODUCTS (For Logged In Seller) ---
// Ini adalah perbaikan dari baris 340 yang tadinya error
exports.getMyProducts = async (req, res) => {
    try {
        const sellerId = req.user.id; // Diambil dari token

        const products = await Product.findAll({
            where: { seller_id: sellerId },
            order: [['created_at', 'DESC']]
        });

        res.json({
            status: true,
            message: "Daftar produk Anda berhasil diambil",
            data: products
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// --- GET PRODUCTS BY CATEGORY ---
exports.getProductByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const products = await Product.findAll({
            where: { category, is_active: true },
            order: [['created_at', 'DESC']]
        });

        res.json({
            msg: "Data produk kategori berhasil diambil",
            count: products.length,
            data: products
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- SEARCH PRODUCTS ---
exports.searchProducts = async (req, res) => {
    try {
        const { keyword } = req.params;

        const products = await Product.findAll({
            where: {
                is_active: true,
                [Op.or]: [
                    { name: { [Op.like]: `%${keyword}%` } },
                    { description: { [Op.like]: `%${keyword}%` } }
                ]
            },
            include: [{ model: User, attributes: ['id', 'username', 'fullname'] }],
            order: [['rating', 'DESC']]
        });

        res.json({
            msg: "Hasil pencarian produk",
            count: products.length,
            data: products
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE PRODUCT ---
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category, stock } = req.body;

        // 1. Cari produk berdasarkan ID
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan" });

        // 2. PROTEKSI: Cek apakah user yang login adalah pemilik produk ini
        // req.user.id didapat dari middleware verifyToken
        if (product.seller_id !== req.user.id) {
            return res.status(403).json({ 
                status: false,
                message: "Akses ditolak! Anda bukan pemilik produk ini." 
            });
        }

        // 3. LOGIKA FOTO: Ambil path file baru jika ada upload, jika tidak gunakan yang lama
        const imagePath = req.file ? `/uploads/${req.file.filename}` : product.image;

        // 4. Lakukan Update
        await product.update({
            name: name || product.name,
            price: price !== undefined ? parseInt(price) : product.price,
            description: description || product.description,
            category: category || product.category,
            image: imagePath, // Menggunakan path hasil proses multer atau path lama
            stock: stock !== undefined ? parseInt(stock) : product.stock
        });

        res.json({ 
            status: true,
            message: "Produk berhasil diupdate", 
            data: product 
        });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ status: false, message: error.message });
    }
};

// --- DEACTIVATE/ACTIVATE PRODUCT ---
exports.deactivateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan" });
        await product.update({ is_active: false });
        res.json({ msg: "Produk berhasil dinonaktifkan" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.activateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan" });
        await product.update({ is_active: true });
        res.json({ msg: "Produk berhasil diaktifkan" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- DELETE PRODUCT ---
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan" });
        await product.destroy();
        res.json({ msg: "Produk berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// --- GET PRODUCT STATISTICS ---
exports.getProductStats = async (req, res) => {
    try {
        const total_products = await Product.count();
        const total_active = await Product.count({ where: { is_active: true } });
        const total_stock = await Product.sum('stock') || 0;
        
        res.json({
            msg: "Statistik produk berhasil diambil",
            data: { total_products, total_active, total_stock }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');

// --- ADD TO CART ---
exports.addToCart = async (req, res) => {
    try {
        // user_id diambil dari middleware verifyToken (req.user)
        const user_id = req.user.id; 
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ msg: "Product ID dan Quantity harus diisi!" });
        }

        const product = await Product.findByPk(product_id);
        if (!product) return res.status(404).json({ msg: "Produk tidak ditemukan" });

        if (product.stock < quantity) {
            return res.status(400).json({ msg: `Stok tidak cukup. Tersedia: ${product.stock}` });
        }

        let cartItem = await Cart.findOne({ where: { user_id, product_id } });

        if (cartItem) {
            const newQuantity = cartItem.quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({ msg: "Stok tidak cukup untuk tambahan ini" });
            }
            cartItem.quantity = newQuantity;
            cartItem.subtotal = product.price * newQuantity;
            await cartItem.save();
            return res.json({ status: true, msg: "Keranjang diperbarui", data: cartItem });
        }

        const newCartItem = await Cart.create({
            user_id,
            product_id,
            quantity,
            subtotal: product.price * quantity
        });

        res.status(201).json({ status: true, msg: "Berhasil ditambah ke keranjang", data: newCartItem });

    } catch (error) {
        res.status(500).json({ status: false, msg: error.message });
    }
};

// --- GET CART BY USER ID ---
exports.getCartByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Cek user exist
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const cartItems = await Cart.findAll({
            where: { user_id },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'description', 'image', 'stock']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        if (cartItems.length === 0) {
            return res.json({
                msg: "Keranjang kosong",
                data: [],
                total_items: 0,
                total_price: 0
            });
        }

        // Hitung total
        let total_price = 0;
        cartItems.forEach(item => {
            total_price += item.subtotal || (item.product.price * item.quantity);
        });

        res.json({
            msg: "Data cart berhasil diambil",
            data: cartItems,
            total_items: cartItems.length,
            total_price
        });

    } catch (error) {
        console.log("ERROR GET CART:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET CART ITEM BY ID ---
exports.getCartItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const cartItem = await Cart.findByPk(id, {
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'description', 'image', 'stock']
                }
            ]
        });

        if (!cartItem) {
            return res.status(404).json({ msg: "Item cart tidak ditemukan" });
        }

        res.json({
            msg: "Data cart item berhasil diambil",
            data: cartItem
        });

    } catch (error) {
        console.log("ERROR GET CART ITEM:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE CART ITEM QUANTITY ---
exports.updateCartQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ msg: "Quantity harus minimal 1!" });
        }

        const cartItem = await Cart.findByPk(id, {
            include: [
                {
                    model: Product,
                    attributes: ['id', 'price', 'stock']
                }
            ]
        });

        if (!cartItem) {
            return res.status(404).json({ msg: "Item cart tidak ditemukan" });
        }

        // Cek stock
        if (cartItem.product.stock < quantity) {
            return res.status(400).json({ msg: `Stock tidak cukup. Tersedia: ${cartItem.product.stock}` });
        }

        // Update quantity dan subtotal
        cartItem.quantity = quantity;
        cartItem.subtotal = cartItem.product.price * quantity;
        await cartItem.save();

        res.json({
            msg: "Quantity cart berhasil diupdate",
            data: cartItem
        });

    } catch (error) {
        console.log("ERROR UPDATE CART QUANTITY:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- REMOVE ITEM FROM CART ---
exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;

        const cartItem = await Cart.findByPk(id);

        if (!cartItem) {
            return res.status(404).json({ msg: "Item cart tidak ditemukan" });
        }

        await cartItem.destroy();

        res.json({
            msg: "Produk berhasil dihapus dari cart"
        });

    } catch (error) {
        console.log("ERROR REMOVE FROM CART:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- CLEAR CART (HAPUS SEMUA ITEM) ---
exports.clearCart = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Cek user exist
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const deletedCount = await Cart.destroy({ where: { user_id } });

        res.json({
            msg: "Keranjang berhasil dikosongkan",
            deleted_items: deletedCount
        });

    } catch (error) {
        console.log("ERROR CLEAR CART:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE CART ITEM (QUANTITY & SUBTOTAL) ---
exports.updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ msg: "Quantity harus minimal 1!" });
        }

        const cartItem = await Cart.findByPk(id, {
            include: [
                {
                    model: Product,
                    attributes: ['id', 'price', 'stock']
                }
            ]
        });

        if (!cartItem) {
            return res.status(404).json({ msg: "Item cart tidak ditemukan" });
        }

        // Cek stock
        if (cartItem.product.stock < quantity) {
            return res.status(400).json({ msg: `Stock tidak cukup. Tersedia: ${cartItem.product.stock}` });
        }

        await cartItem.update({
            quantity,
            subtotal: cartItem.product.price * quantity
        });

        res.json({
            msg: "Item cart berhasil diupdate",
            data: cartItem
        });

    } catch (error) {
        console.log("ERROR UPDATE CART ITEM:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET CART SUMMARY ---
exports.getCartSummary = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Cek user exist
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        const cartItems = await Cart.findAll({
            where: { user_id },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price']
                }
            ]
        });

        if (cartItems.length === 0) {
            return res.json({
                msg: "Keranjang kosong",
                data: {
                    total_items: 0,
                    total_quantity: 0,
                    total_price: 0
                }
            });
        }

        let total_price = 0;
        let total_quantity = 0;

        cartItems.forEach(item => {
            total_quantity += item.quantity;
            total_price += item.subtotal || (item.product.price * item.quantity);
        });

        res.json({
            msg: "Ringkasan cart berhasil diambil",
            data: {
                total_items: cartItems.length,
                total_quantity,
                total_price
            }
        });

    } catch (error) {
        console.log("ERROR GET CART SUMMARY:", error);
        res.status(500).json({ msg: error.message });
    }
};

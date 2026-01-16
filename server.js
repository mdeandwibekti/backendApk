const express = require('express');
const multer = require('multer');
const cors = require('cors');
const db = require('./config/database');
const path = require('path');
require('dotenv').config();

// --- IMPOR MODEL ---
const User = require('./models/User');
const Product = require('./models/Product'); // Diubah dari ProductItem menjadi Product
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');

// ... sisa kode server ...

// --- IMPOR ROUTES ---
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// --- CEK KONEKSI DATABASE ---
(async () => {
    try {
        await db.authenticate();
        console.log('Database connected to shoppee...');
        await db.sync(); 
    } catch (error) {
        console.error('Connection error:', error);
    }
})();

// ================= ROUTES =================

// Gunakan User Routes
app.use('/api/users', userRoutes);

// Gunakan Product Routes
app.use('/api/products', productRoutes);

// Gunakan Cart Routes
app.use('/api/cart', cartRoutes);

// Gunakan Order Routes
app.use('/api/orders', orderRoutes);

// Gunakan Transaction Routes
app.use('/api/transactions', transactionRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});


app.use((err, req, res, next) => {
  console.error('Error:', err); // tampilkan error di terminal
  res.status(500).json({ message: 'Internal server error', error: err.message });
});
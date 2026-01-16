const express = require('express');
const multer = require('multer');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/authMiddleware'); // 🔥 INI WAJIB
const { createProduct, getAllProducts } = require('../controllers/productController');
const { verifyToken } = require('../middlewares/verifyToken');


const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, 'prod-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// --- CREATE PRODUCT (SELLER SAJA) ---
router.post('/', auth, productController.createProduct);

// --- GET ALL PRODUCTS ---
router.get('/', productController.getAllProducts);

// --- GET PRODUCT BY ID ---
router.get('/:id', productController.getProductById);

// --- GET PRODUCTS BY SELLER ---
router.get('/seller/:seller_id', productController.getProductBySellerId);

// --- UPDATE PRODUCT ---
router.put('/:id', auth, productController.updateProduct);

// --- DELETE PRODUCT ---
router.delete('/:id', auth, productController.deleteProduct);

router.post('/', upload.single('image'), createProduct);

router.post('/', verifyToken, upload.single('image'), productController.createProduct);

router.post('/', verifyToken, upload.single('image'), createProduct);

router.get('/', getAllProducts);

module.exports = router;

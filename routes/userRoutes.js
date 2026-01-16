const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware'); // TANPA {}


// --- PUBLIC ROUTES ---
router.post('/register', userController.register);
router.post('/login', userController.login);

// --- PRIVATE ROUTES (Bisa ditambah middleware auth nanti) ---
// Get all users
router.get('/', auth, userController.getAllUsers);
// Get user by id
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, userController.updateUser);
router.post('/:id/change-password', auth, userController.changePassword);
router.delete('/:id', auth, userController.deleteUser);
router.patch('/:id/deactivate', auth, userController.deactivateUser);
router.patch('/:id/activate', auth, userController.activateUser);

module.exports = router;

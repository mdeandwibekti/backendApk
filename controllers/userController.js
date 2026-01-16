const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// --- REGISTER USER ---
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    });

    res.json({
      status: true,
      message: 'Register berhasil',
      user
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      msg: error.message
    });
  }
};

// --- LOGIN USER ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    // ✅ FIX 1: CEK USER AKTIF
    if (user.is_active === false) {
      return res.status(401).json({ message: "Akun dinonaktifkan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // ✅ FIX 2: VALIDASI ROLE
    if (!user.role) {
      return res.status(401).json({ message: "Role user tidak valid" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      status: true,
      message: "Login berhasil",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET ALL USERS (Admin Only) ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        res.json({
            msg: "Data users berhasil diambil",
            data: users
        });

    } catch (error) {
        console.log("ERROR GET USERS:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET USER BY ID ---
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        res.json({
            msg: "Data user berhasil diambil",
            data: user
        });

    } catch (error) {
        console.log("ERROR GET USER BY ID:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE USER ---
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, fullname, phone, address } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // Update data user
        await user.update({
            email: email || user.email,
            fullname: fullname || user.fullname,
            phone: phone || user.phone,
            address: address || user.address
        });

        const responseData = user.toJSON();
        delete responseData.password;

        res.json({
            msg: "User berhasil diupdate",
            data: responseData
        });

    } catch (error) {
        console.log("ERROR UPDATE USER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- CHANGE PASSWORD ---
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ msg: "Password lama dan baru harus diisi!" });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // Cek password lama
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Password lama tidak sesuai" });
        }

        // Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({ password: hashedPassword });

        res.json({
            msg: "Password berhasil diubah"
        });

    } catch (error) {
        console.log("ERROR CHANGE PASSWORD:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- DELETE USER ---
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        await user.destroy();

        res.json({
            msg: "User berhasil dihapus"
        });

    } catch (error) {
        console.log("ERROR DELETE USER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- DEACTIVATE USER (Soft Delete) ---
exports.deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        await user.update({ is_active: false });

        res.json({
            msg: "User berhasil dinonaktifkan"
        });

    } catch (error) {
        console.log("ERROR DEACTIVATE USER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- ACTIVATE USER ---
exports.activateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        await user.update({ is_active: true });

        res.json({
            msg: "User berhasil diaktifkan"
        });

    } catch (error) {
        console.log("ERROR ACTIVATE USER:", error);
        res.status(500).json({ msg: error.message });
    }
};

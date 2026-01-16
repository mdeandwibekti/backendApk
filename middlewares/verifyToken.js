const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        // 1. Mengambil header Authorization
        const authHeader = req.headers.authorization;

        // 2. Cek apakah header ada
        if (!authHeader) {
            return res.status(401).json({ 
                status: false,
                message: "Akses ditolak. Token tidak ditemukan." 
            });
        }

        // 3. Memisahkan "Bearer" dan <token>
        // Format yang benar: "Bearer eyJhbGciOiJIUzI1Ni..."
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ 
                status: false,
                message: "Format token tidak valid. Gunakan: Bearer <token>" 
            });
        }

        const token = parts[1];

        // 4. Verifikasi Token menggunakan JWT_SECRET dari file .env
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    status: false,
                    message: "Token tidak valid atau sudah kedaluwarsa.",
                    error: err.message
                });
            }

            // 5. Simpan data user yang didecode (id, email, dll) ke objek request
            // Ini agar controller bisa mengambil seller_id melalui req.user.id
            req.user = decoded;
            
            // 6. Lanjut ke fungsi berikutnya (Controller)
            next();
        });

    } catch (error) {
        return res.status(500).json({ 
            status: false,
            message: "Terjadi kesalahan pada verifikasi token server.",
            error: error.message
        });
    }
};

// Ekspor sebagai objek agar bisa diimport dengan kurung kurawal { verifyToken }
module.exports = { verifyToken };
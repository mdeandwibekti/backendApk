const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ 
                status: false,
                message: "Token tidak ditemukan" 
            });
        }

        // Format: "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ 
                status: false,
                message: "Format token tidak valid. Gunakan: Bearer <token>" 
            });
        }

        const token = parts[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    status: false,
                    message: "Token tidak valid atau sudah expired",
                    error: err.message
                });
            }

            req.user = decoded;
            next();
        });

    } catch (error) {
        return res.status(500).json({ 
            status: false,
            message: "Error verifying token",
            error: error.message
        });
    }
};

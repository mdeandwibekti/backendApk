const { Sequelize } = require('sequelize');
require('dotenv').config();

// Gunakan environment variables dari .env
const db = new Sequelize(
    process.env.DB_NAME || 'shopee',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'Deandwib12345*',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        port: parseInt(process.env.DB_PORT) || 3308,
        logging: false // Set ke true jika ingin lihat SQL queries
    }
);

module.exports = db;
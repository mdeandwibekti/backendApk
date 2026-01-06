const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Product = db.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150), // Sesuai panjang di SRS
        allowNull: false
    },
    price: {
        type: DataTypes.STRING, // SRS meminta Varchar untuk Price
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Nama tabel User di database
            key: 'id'
        }
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'update_at' // Sesuai penamaan di SRS
});

module.exports = Product;
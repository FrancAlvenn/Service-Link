// models/Image.js
import { DataTypes } from 'sequelize';
import sequelize from '../database.js';

const ImageModel = sequelize.define('Image', {
    image_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'images',
    timestamps: true,
});

export default ImageModel;

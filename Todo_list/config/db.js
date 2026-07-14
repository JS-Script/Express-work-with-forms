const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Для локальной MongoDB (если установлена на компьютере)
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/todo_list');
        
        console.log(`MongoDB подключена: ${conn.connection.host}`);
        console.log(`База данных: ${conn.connection.name}`);
    } catch (error) {
        console.error(`Ошибка подключения к MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
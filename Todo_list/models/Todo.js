const mongoose = require('mongoose');

// Схема задачи
const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Название обязательно'],
        trim: true,
        minlength: [1, 'Название не может быть пустым'],
        maxlength: [100, 'Название не должно превышать 100 символов']
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Создаем модель (коллекция в MongoDB будет называться "todos")
const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Todo = require('../models/Todo');

// GET все задачи
router.get('/', async (req, res, next) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json({ success: true, data: todos });
    } catch (error) {
        next(error);
    }
});

// POST создать задачу с валидацией
router.post('/',
    body('title')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Название обязательно')
        .isLength({ max: 100 })
        .withMessage('Название не должно превышать 100 символов'),
    async (req, res, next) => {
        try {
            console.log('📥 POST запрос:', req.body);
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { title } = req.body;
            const newTodo = new Todo({
                title: title.trim(),
                completed: false
            });

            await newTodo.save();
            console.log('✅ Задача создана:', newTodo);
            
            res.status(201).json({ success: true, data: newTodo });
        } catch (error) {
            console.error('❌ Ошибка в POST:', error);
            next(error);
        }
    }
);

// PUT обновить задачу
router.put('/:id',
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Название не может быть пустым'),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, completed } = req.body;

            const todo = await Todo.findById(id);
            if (!todo) {
                return res.status(404).json({
                    success: false,
                    message: 'Задача не найдена'
                });
            }

            todo.title = title || todo.title;
            todo.completed = completed !== undefined ? completed : todo.completed;
            await todo.save();

            res.json({ success: true, data: todo });
        } catch (error) {
            if (error.kind === 'ObjectId') {
                return res.status(400).json({
                    success: false,
                    message: 'Неверный формат ID'
                });
            }
            console.error('❌ Ошибка в PUT:', error);
            next(error);
        }
    }
);

// DELETE удалить задачу
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Задача не найдена'
            });
        }

        res.json({
            success: true,
            message: 'Задача удалена',
            data: todo
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат ID'
            });
        }
        console.error('❌ Ошибка в DELETE:', error);
        next(error);
    }
});

module.exports = { router };
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

let todos = [
    {id: 1, title: 'Выполнить дз', completed: false}, 
    {id: 2, title: 'Погулять', completed: false}, 
    {id: 3, title: 'Сходить в магазин', completed: true}
];
let nextId = 4;

// GET все задачи
router.get('/', (req, res) => {
    res.json({ success: true, data: todos });
});

// POST создать задачу с валидацией
router.post('/', 
    body('title')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Название обязательно')
        .isLength({ max: 100 })
        .withMessage('Название не должно превышать 100 символов'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        const { title } = req.body;
        const newTodo = {
            id: nextId++,
            title: title.trim(),
            completed: false
        };
        
        todos.push(newTodo);
        res.status(201).json({ success: true, data: newTodo });
    }
);

// PUT обновить задачу с валидацией
router.put('/:id',
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Название не может быть пустым'),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }
        
        const id = parseInt(req.params.id);
        const { title, completed } = req.body;
        const todoIndex = todos.findIndex(t => t.id === id);
        
        if (todoIndex === -1) {
            return res.status(404).json({ success: false, message: 'Задача не найдена' });
        }
        
        todos[todoIndex] = {
            ...todos[todoIndex],
            title: title || todos[todoIndex].title,
            completed: completed !== undefined ? completed : todos[todoIndex].completed
        };
        
        res.json({ success: true, data: todos[todoIndex] });
    }
);


router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(t => t.id === id);
    
    if (todoIndex === -1) {
        return res.status(404).json({ success: false, message: 'Задача не найдена' });
    }
    
    const deletedTodo = todos[todoIndex];
    todos.splice(todoIndex, 1);
    res.json({ success: true, message: 'Задача удалена', data: deletedTodo });
});


module.exports = { 
    router, 
    getTodos: () => todos 
};
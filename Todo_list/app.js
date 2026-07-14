require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('./config/db'); 

const port = process.env.PORT || 3000;

// Импортируем модель и роутер
const Todo = require('./models/Todo');
const { router: todoRouter } = require('./routes/todo');

// Подключаемся к MongoDB
connectDB(); 
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://0463663_db_user:9OIeeq2JfS39YLG9@todo-list.6uvfspi.mongodb.net"

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/scripts', express.static('scripts'));

// Используем роутер для API
app.use('/api/todos', todoRouter);

// Главная страница - получаем данные из БД
app.get('/', async (req, res, next) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.render('index', { todos });
    } catch (error) {
        next(error);
    }
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('❌ Ошибка:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

app.listen(port, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${port}`);
});
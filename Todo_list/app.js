const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const { router: todoRouter, getTodos } = require('./routes/todo');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api/todos', todoRouter);


app.get('/', (req, res) => {
    const todos = getTodos(); 
    res.render('index', { todos });
});

// script.js
app.get('/script.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        function createTodoElement(todo) {
            const li = document.createElement('li');
            li.dataset.id = todo.id;
            li.innerHTML = \`
                <span class="todo-text \${todo.completed ? 'completed' : ''}">\${todo.title}</span>
                <input type="checkbox" \${todo.completed ? 'checked' : ''} class="todo-checkbox" data-id="\${todo.id}">
                <button class="delete-btn" data-id="\${todo.id}">Удалить</button>
            \`;
            return li;
        }

        document.getElementById('addForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('titleInput');
            const title = input.value.trim();
            if (!title) return;
            
            try {
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const ul = document.getElementById('todoList');
                    const emptyMsg = ul.querySelector('p');
                    if (emptyMsg) emptyMsg.remove();
                    ul.appendChild(createTodoElement(result.data));
                    input.value = '';
                    input.focus();
                } else {
                    const error = await response.json();
                    alert('Ошибка: ' + (error.errors ? error.errors[0].msg : error.message));
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при добавлении');
            }
        });

        document.getElementById('todoList').addEventListener('change', async (e) => {
            if (e.target.classList.contains('todo-checkbox')) {
                const id = e.target.dataset.id;
                const completed = e.target.checked;
                const li = e.target.closest('li');
                const textSpan = li.querySelector('.todo-text');
                
                try {
                    const response = await fetch(\`/api/todos/\${id}\`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            title: textSpan.textContent, 
                            completed: completed 
                        })
                    });
                    
                    if (response.ok) {
                        if (completed) {
                            textSpan.classList.add('completed');
                        } else {
                            textSpan.classList.remove('completed');
                        }
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                }
            }
        });

        document.getElementById('todoList').addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                if (!confirm('Удалить задачу?')) return;
                const id = e.target.dataset.id;
                
                try {
                    const response = await fetch(\`/api/todos/\${id}\`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        const li = e.target.closest('li');
                        li.remove();
                        const ul = document.getElementById('todoList');
                        if (ul.children.length === 0) {
                            const p = document.createElement('p');
                            p.textContent = 'Нет задач';
                            ul.appendChild(p);
                        }
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                }
            }
        });
    `);
});

app.listen(port, () => {
    console.log(`Сервер запущен: http://localhost:${port}`);
});
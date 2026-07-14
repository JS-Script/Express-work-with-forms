console.log('main.js загружен');

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.dataset.id = todo._id;
    li.innerHTML = `
        <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.title}</span>
        <input type="checkbox" ${todo.completed ? 'checked' : ''} class="todo-checkbox" data-id="${todo._id}">
        <button class="delete-btn" data-id="${todo._id}">Удалить</button>
    `;
    return li;
}

// Добавление задачи
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Форма отправлена');
    
    const input = document.getElementById('titleInput');
    const title = input.value.trim();
    console.log('Название:', title);
    
    if (!title) {
        console.log('Пустое название');
        return;
    }
    
    try {
        console.log('Отправка запроса...');
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        
        console.log('Статус ответа:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Задача создана:', result.data);
            
            const ul = document.getElementById('todoList');
            const emptyMsg = ul.querySelector('p');
            if (emptyMsg) emptyMsg.remove();
            ul.appendChild(createTodoElement(result.data));
            input.value = '';
            input.focus();
        } else {
            const error = await response.json();
            console.error('Ошибка сервера:', error);
            alert('Ошибка: ' + (error.errors ? error.errors[0].msg : error.message));
        }
    } catch (error) {
        console.error('Ошибка при добавлении:', error);
        alert('Произошла ошибка при добавлении');
    }
});

// Обновление задачи (чекбокс)
document.getElementById('todoList').addEventListener('change', async (e) => {
    if (e.target.classList.contains('todo-checkbox')) {
        const id = e.target.dataset.id;
        const completed = e.target.checked;
        const li = e.target.closest('li');
        const textSpan = li.querySelector('.todo-text');
        
        try {
            console.log(`Обновление задачи ${id}:`, { completed });
            const response = await fetch(`/api/todos/${id}`, {
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
                console.log('Задача обновлена');
            } else {
                const error = await response.json();
                alert('Ошибка: ' + (error.message || 'Не удалось обновить'));
                e.target.checked = !completed;
            }
        } catch (error) {
            console.error('Ошибка при обновлении:', error);
            alert('Произошла ошибка при обновлении');
            e.target.checked = !completed;
        }
    }
});

// Удаление задачи
document.getElementById('todoList').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        if (!confirm('Удалить задачу?')) return;
        const id = e.target.dataset.id;
        const li = e.target.closest('li');
        
        try {
            console.log(`Удаление задачи ${id}`);
            const response = await fetch(`/api/todos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                li.remove();
                const ul = document.getElementById('todoList');
                if (ul.children.length === 0) {
                    const p = document.createElement('p');
                    p.textContent = 'Нет задач';
                    ul.appendChild(p);
                }
                console.log('Задача удалена');
            } else {
                const error = await response.json();
                alert('Ошибка: ' + (error.message || 'Не удалось удалить'));
            }
        } catch (error) {
            console.error('Ошибка при удалении:', error);
            alert('Произошла ошибка при удалении');
        }
    }
});
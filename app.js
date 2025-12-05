const form = document.getElementById("userForm");
const tbody = document.getElementById("tableBody");

// Получение пользователей из localStorage
function loadUsers() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  return users;
}

// Сохранение пользователей в localStorage
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Рендер таблицы
function render() {
  const users = loadUsers();
  tbody.innerHTML = "";
  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>
        <button onclick="editUser(${u.id})">Изменить</button>
        <button onclick="deleteUserUI(${u.id})">Удалить</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Добавление или обновление пользователя
form.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  let users = loadUsers();

  if (id) {
    // Обновление
    users = users.map(u => u.id == id ? { id: u.id, name, email } : u);
  } else {
    // Добавление нового
    const newId = users.length ? users[users.length - 1].id + 1 : 1;
    users.push({ id: newId, name, email });
  }

  saveUsers(users);
  form.reset();
  render();
});

// Редактирование пользователя
function editUser(id) {
  const users = loadUsers();
  const user = users.find(u => u.id === id);
  document.getElementById("userId").value = user.id;
  document.getElementById("name").value = user.name;
  document.getElementById("email").value = user.email;
}

// Удаление пользователя
function deleteUserUI(id) {
  let users = loadUsers();
  users = users.filter(u => u.id !== id);
  saveUsers(users);
  render();
}

// Инициализация таблицы
render();

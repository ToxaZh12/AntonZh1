import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://pmacinsqgvpglhcqfcnx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWNpbnNxZ3ZwZ2xoY3FmY254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI2NjEsImV4cCI6MjA3OTgwODY2MX0.wAwq1m4zqX42WOiwjzl3khstPLoZUjaq5bP3BTaamrE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const LOCAL_STORAGE_KEY = "users";

// Загрузка пользователей с Supabase или localStorage
async function loadUsers() {
  try {
    const { data, error } = await supabase.from("users").select("*").order("id");
    if (error) throw error;
    if (data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn("Supabase недоступен, используем локальные данные.", err);
  }
  const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
  return localData ? JSON.parse(localData) : [];
}

// Сохраняем пользователей локально
function saveLocal(users) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
}

// Добавление пользователя
async function addUser(user) {
  try {
    const { error, data } = await supabase.from("users").insert(user).select();
    if (error) throw error;
    const users = await loadUsers();
    users.push(...data);
    saveLocal(users);
  } catch (err) {
    console.warn("Сохраняем локально:", err);
    const users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    const newUser = { ...user, id: Date.now() }; // временный id
    users.push(newUser);
    saveLocal(users);
  }
}

// Обновление пользователя
async function updateUser(id, updated) {
  try {
    const { error } = await supabase.from("users").update(updated).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("Обновляем локально:", err);
  }
  const users = await loadUsers();
  const idx = users.findIndex(u => u.id == id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updated };
    saveLocal(users);
  }
}

// Удаление пользователя
async function deleteUser(id) {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.warn("Удаляем локально:", err);
  }
  const users = await loadUsers();
  const filtered = users.filter(u => u.id != id);
  saveLocal(filtered);
}

// DOM элементы
const form = document.getElementById("userForm");
const tbody = document.getElementById("tableBody");

// Отрисовка таблицы
async function render() {
  const users = await loadUsers();
  tbody.innerHTML = "";
  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>
        <button onclick="editUser('${u.id}')">Изменить</button>
        <button onclick="deleteUserUI('${u.id}')">Удалить</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Обработчик формы
form.addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  if (id) await updateUser(Number(id), { name, email });
  else await addUser({ name, email });

  form.reset();
  await render();
});

// Редактирование пользователя
async function editUser(id) {
  const users = await loadUsers();
  const u = users.find(x => x.id == id);
  if (!u) return;
  document.getElementById("userId").value = u.id;
  document.getElementById("name").value = u.name;
  document.getElementById("email").value = u.email;
}

// Удаление пользователя через UI
async function deleteUserUI(id) {
  await deleteUser(id);
  await render();
}

// Делаем функции глобальными для onclick
window.editUser = editUser;
window.deleteUserUI = deleteUserUI;

// Начальная отрисовка
render();

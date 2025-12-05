import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://pmacinsqgvpglhcqfcnx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWNpbnNxZ3ZwZ2xoY3FmY254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI2NjEsImV4cCI6MjA3OTgwODY2MX0.wAwq1m4zqX42WOiwjzl3khstPLoZUjaq5bP3BTaamrE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOCAL_STORAGE_KEY = "users";

async function loadUsers() {
  // Сначала пробуем загрузить из Supabase
  try {
    const { data, error } = await supabase.from("users").select("*").order("id");
    if (error) throw error;
    if (data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.error("Supabase error:", err);
  }

  // Если Supabase недоступен, используем локальные данные
  const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
  return localData ? JSON.parse(localData) : [];
}

async function addUser(user) {
  try {
    const { error, data } = await supabase.from("users").insert(user).select();
    if (error) throw error;

    // Сохраняем в localStorage
    const users = await loadUsers();
    users.push(...data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error(err);
    // Добавляем локально, если сервер не доступен
    const users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    const newUser = { ...user, id: Date.now() }; // временный id
    users.push(newUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
  }
}

async function updateUser(id, updated) {
  try {
    const { error } = await supabase.from("users").update(updated).eq("id", id);
    if (error) throw error;

    const users = await loadUsers();
    const idx = users.findIndex(u => u.id == id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
    }
  } catch (err) {
    console.error(err);
    const users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    const idx = users.findIndex(u => u.id == id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
    }
  }
}

async function deleteUser(id) {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;

    const users = await loadUsers();
    const filtered = users.filter(u => u.id != id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error(err);
    const users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    const filtered = users.filter(u => u.id != id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  }
}

const form = document.getElementById("userForm");
const tbody = document.getElementById("tableBody");

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

async function editUser(id) {
  const users = await loadUsers();
  const u = users.find(x => x.id == id);
  if (!u) return;
  document.getElementById("userId").value = u.id;
  document.getElementById("name").value = u.name;
  document.getElementById("email").value = u.email;
}

async function deleteUserUI(id) {
  await deleteUser(id);
  await render();
}

// Делаем функции доступными глобально, чтобы кнопки с onclick работали
window.editUser = editUser;
window.deleteUserUI = deleteUserUI;

render();

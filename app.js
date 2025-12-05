import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://pmacinsqgvpglhcqfcnx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWNpbnNxZ3ZwZ2xoY3FmY254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI2NjEsImV4cCI6MjA3OTgwODY2MX0.wAwq1m4zqX42WOiwjzl3khstPLoZUjaq5bP3BTaamrE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("userForm");
const tbody = document.getElementById("tableBody");

// ───── загрузка таблицы ─────
async function loadUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) console.error(error);
  return data || [];
}

async function addUser(user) {
  return await supabase.from("users").insert(user);
}

async function updateUser(id, user) {
  return await supabase.from("users").update(user).eq("id", id);
}

async function deleteUser(id) {
  return await supabase.from("users").delete().eq("id", id);
}

async function render() {
  const users = await loadUsers();
  tbody.innerHTML = "";

  users.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>
        <button onclick="window.editUser(${u.id})">Изменить</button>
        <button onclick="window.removeUser(${u.id})">Удалить</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editUser = async (id) => {
  const users = await loadUsers();
  const u = users.find((x) => x.id === id);
  document.getElementById("userId").value = u.id;
  document.getElementById("name").value = u.name;
  document.getElementById("email").value = u.email;
};

window.removeUser = async (id) => {
  await deleteUser(id);
  render();
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("userId").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  if (id) await updateUser(id, { name, email });
  else await addUser({ name, email });

  form.reset();
  render();
});

// старт
render();

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://pmacinsqgvpglhcqfcnx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWNpbnNxZ3ZwZ2xoY3FmY254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI2NjEsImV4cCI6MjA3OTgwODY2MX0.wAwq1m4zqX42WOiwjzl3khstPLoZUjaq5bP3BTaamrE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadUsers() {
  const { data, error } = await supabase.from("users").select("*").order("id");
  if (error) console.error(error);
  return data || [];
}

async function addUser(user) {
  const { error } = await supabase.from("users").insert(user);
  if (error) console.error(error);
}

async function updateUser(id, updated) {
  const { error } = await supabase.from("users").update(updated).eq("id", id);
  if (error) console.error(error);
}

async function deleteUser(id) {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) console.error(error);
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
  document.getElementById("userId").value = u.id;
  document.getElementById("name").value = u.name;
  document.getElementById("email").value = u.email;
}

async function deleteUserUI(id) {
  await deleteUser(id);
  await render();
}

render();

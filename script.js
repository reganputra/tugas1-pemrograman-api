const API_URL = "https://reqres.in/api/users";
const usersContainer = document.getElementById("users");
let usersList = []; // menyimpan list dari GET agar bisa dimanipulasi

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

async function getUsers() {
    try {
        const data = await fetchData(API_URL);
        usersList = data.data;
        renderUsers();
    } catch (error) {
        console.error("Gagal mengambil data:", error);
    }
}

function renderUsers() {
    usersContainer.innerHTML = "";
    usersList.forEach(user => {
        const userElement = document.createElement("div");
        userElement.classList.add("user");
        userElement.innerHTML = `
            <img src="${user.avatar}" alt="Avatar" width="50">
            <h3>${user.first_name} ${user.last_name}</h3>
            <p>Email: ${user.email}</p>
            <button class="edit" onclick="updateUser(${user.id})">Edit</button>
            <button class="delete" onclick="deleteUser(${user.id})">Hapus</button>
        `;
        usersContainer.appendChild(userElement);
    });
}

async function addUser() {
    const name = document.getElementById("name").value;
    const job = document.getElementById("job").value;

    if (!name || !job) {
        alert("Nama dan pekerjaan tidak boleh kosong!");
        return;
    }

    try {
        const data = await fetchData(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, job })
        });

        const newUser = {
            id: usersList.length + 1,
            first_name: data.name,
            last_name: "",
            email: "newuser@example.com",
            avatar: "https://via.placeholder.com/50"
        };
        usersList.push(newUser);
        renderUsers();
        alert("User berhasil ditambahkan!");
    } catch (error) {
        console.error("Gagal menambah user:", error);
    }
}

async function updateUser(userId) {
    const newName = prompt("Masukkan nama baru:");
    const newJob = prompt("Masukkan pekerjaan baru:");

    if (!newName || !newJob) {
        alert("Nama dan pekerjaan tidak boleh kosong!");
        return;
    }

    try {
        const data = await fetchData(`${API_URL}/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName, job: newJob })
        });

        const user = usersList.find(u => u.id === userId);
        if (user) {
            user.first_name = data.name;
            user.last_name = "(Updated)";
        }
        renderUsers();
        alert("User berhasil diupdate!");
    } catch (error) {
        console.error("Gagal mengupdate user:", error);
    }
}

async function deleteUser(userId) {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    try {
        const response = await fetch(`${API_URL}/${userId}`, { method: "DELETE" });
        if (response.ok) {
            usersList = usersList.filter(user => user.id !== userId);
            renderUsers();
            alert("User berhasil dihapus!");
        }
    } catch (error) {
        console.error("Gagal menghapus user:", error);
    }
}

getUsers();
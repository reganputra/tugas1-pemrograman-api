const API_URL = "https://reqres.in/api/users";
const AGIFY_URL = "https://api.agify.io/?name=";
const NATIONALIZE_URL = "https://api.nationalize.io/?name=";
const usersContainer = document.getElementById("users");
let usersList = [];

async function getUsers() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        usersList = data.data;
        await getAdditionalInfoForUsers();
        alert("✅ Data berhasil dimuat!");
    } catch (error) {
        console.error("Gagal mengambil data:", error);
    }
}

async function getAdditionalInfoForUsers() {
    const requests = usersList.map(async user => {
        try {
            const [ageData, nationData] = await Promise.all([
                fetch(`${AGIFY_URL}${user.first_name}`).then(res => res.json()),
                fetch(`${NATIONALIZE_URL}${user.first_name}`).then(res => res.json())
            ]);
            user.age = ageData.age || "Tidak diketahui";
            user.nationality = getTopNationality(nationData.country);
        } catch (error) {
            console.error(`Gagal mendapatkan info tambahan untuk ${user.first_name}:`, error);
        }
    });

    await Promise.all(requests);
    renderUsers();
}

function getTopNationality(countries) {
    if (!countries || countries.length === 0) return "Tidak diketahui";
    return countries.sort((a, b) => b.probability - a.probability)[0].country_id;
}

function renderUsers() {
    usersContainer.innerHTML = "";
    usersList.forEach(user => {
        const userElement = document.createElement("div");
        userElement.classList.add("col-md-4");

        userElement.innerHTML = `
            <div class="card user-card shadow-sm">
                <img src="${user.avatar}" class="card-img-top rounded-circle mx-auto d-block mt-3" style="width: 80px;">
                <div class="card-body text-center">
                    <h5 class="card-title">${user.first_name} ${user.last_name}</h5>
                    <p class="card-text">Email: ${user.email}</p>
                    <p class="card-text"><strong>Umur:</strong> ${user.age || "Loading..."}</p>
                    <p class="card-text"><strong>Kewarganegaraan:</strong> ${user.nationality || "Loading..."}</p>
                    <button class="btn btn-primary btn-sm me-2" onclick="updateUser(${user.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Hapus</button>
                </div>
            </div>
        `;
        usersContainer.appendChild(userElement);
    });
}

async function addUser() {
    const name = document.getElementById("name").value;
    const job = document.getElementById("job").value;

    if (!name || !job) {
        alert("⚠ Nama dan pekerjaan tidak boleh kosong!");
        return;
    }

    try {
        const [ageData, nationData] = await Promise.all([
            fetch(AGIFY_URL + name).then(res => res.json()),
            fetch(NATIONALIZE_URL + name).then(res => res.json())
        ]);
        const estimatedAge = ageData.age || "Tidak diketahui";
        const nationality = getTopNationality(nationData.country);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, job })
        });
        const data = await response.json();
        const newUser = {
            id: usersList.length + 1,
            first_name: data.name,
            last_name: "(Baru)",
            email: "newuser@example.com",
            avatar: "https://via.placeholder.com/50",
            age: estimatedAge,
            nationality: nationality
        };
        usersList.push(newUser);
        renderUsers();
        alert(`✅ User ${data.name} berhasil ditambahkan!`);
    } catch (error) {
        console.error("Gagal menambah user:", error);
    }
}

async function updateUser(userId) {
    const newName = prompt("Masukkan nama baru:");
    const newJob = prompt("Masukkan pekerjaan baru:");

    if (!newName || !newJob) {
        alert("⚠ Nama dan pekerjaan tidak boleh kosong!");
        return;
    }

    try {
        const [ageData, nationData] = await Promise.all([
            fetch(AGIFY_URL + newName).then(res => res.json()),
            fetch(NATIONALIZE_URL + newName).then(res => res.json())
        ]);
        const estimatedAge = ageData.age || "Tidak diketahui";
        const nationality = getTopNationality(nationData.country);

        const response = await fetch(`${API_URL}/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName, job: newJob })
        });
        const data = await response.json();
        const user = usersList.find(u => u.id === userId);
        if (user) {
            user.first_name = data.name;
            user.last_name = "(Updated)";
            user.age = estimatedAge;
            user.nationality = nationality;
        }
        renderUsers();
        alert(`✅ User ${data.name} berhasil diperbarui!`);
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
            alert("✅ User berhasil dihapus!");
        }
    } catch (error) {
        console.error("Gagal menghapus user:", error);
    }
}

getUsers();
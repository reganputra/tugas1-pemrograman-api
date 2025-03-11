const API_KEY = "1853a880b0bb4265a7a131d904b69f8b"
const NEWS_API_URL = `https://newsapi.org/v2/everything?q=tesla&from=2025-02-11&sortBy=publishedAt&apiKey=${API_KEY}`;
const newsContainer = document.getElementById("news-container");

async function getNews() {
    try {
        const response = await fetch(NEWS_API_URL);
        const data = await response.json();
        if (data.status === "ok") {
            renderNews(data.articles);
        } else {
            newsContainer.innerHTML = `<p class="text-danger">Gagal memuat berita</p>`;
        }
    } catch (error) {
        console.error("Gagal mengambil berita:", error);
        newsContainer.innerHTML = `<p class="text-danger">Terjadi kesalahan saat mengambil berita</p>`;
    }
}

function renderNews(articles) {
    newsContainer.innerHTML = "";
    articles.forEach(article => {
        const newsElement = document.createElement("div");
        newsElement.classList.add("col-md-4", "mb-4");

        newsElement.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${article.urlToImage || 'https://via.placeholder.com/400'}" class="card-img-top" alt="News Image">
                <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text">${article.description || "Tidak ada deskripsi."}</p>
                    <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm">Baca Selengkapnya</a>
                </div>
            </div>
        `;
        newsContainer.appendChild(newsElement);
    });
}

getNews();
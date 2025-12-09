const API_URL = 'http://localhost:3000/movies';
const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = [];

// Render movies safely (fixes quotes + string IDs)
function renderMovies(moviesToDisplay) {
    movieListDiv.innerHTML = '';

    if (moviesToDisplay.length === 0) {
        movieListDiv.innerHTML = '<p>No movies found matching your criteria.</p>';
        return;
    }

    moviesToDisplay.forEach(movie => {
        const div = document.createElement('div');
        div.className = 'movie-item';
        div.innerHTML = `
            <p><strong>${movie.title}</strong> (${movie.year}) - ${movie.genre}</p>
            <button onclick="editMoviePrompt(${movie.id}, 
                '${movie.title.replace(/'/g, "\\'")}', 
                ${movie.year}, 
                '${movie.genre.replace(/'/g, "\\'")}')">
                Edit
            </button>
            <button onclick="deleteMovie(${movie.id})">Delete</button>
        `;
        movieListDiv.appendChild(div);
    });
}

// Fetch all movies
function fetchMovies() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            allMovies = data;
            renderMovies(allMovies);
        })
        .catch(err => console.error('Fetch error:', err));
}

fetchMovies(); // Initial load

// Live search
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(term) ||
        movie.genre.toLowerCase().includes(term)
    );
    renderMovies(filtered);
});

// Add new movie
form.addEventListener('submit', e => {
    e.preventDefault();

    const newMovie = {
        title: document.getElementById('title').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        year: parseInt(document.getElementById('year').value)
    };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
    })
    .then(res => {
        if (!res.ok) throw new Error('Add failed');
        form.reset();
        fetchMovies(); // This refreshes everything correctly
    })
    .catch(err => console.error(err));
});

// EDIT – works with titles containing ' or "
function editMoviePrompt(id, currentTitle, currentYear, currentGenre) {
    const newTitle = prompt('Enter new Title:', currentTitle);
    if (newTitle === null) return;

    const newYearStr = prompt('Enter new Year:', currentYear);
    if (newYearStr === null) return;
    const newYear = parseInt(newYearStr);
    if (isNaN(newYear)) return alert('Year must be a number');

    const newGenre = prompt('Enter new Genre:', currentGenre);
    if (newGenre === null) return;

    const updated = {
        title: newTitle.trim(),
        year: newYear,
        genre: newGenre.trim()
    };

    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
    })
    .then(res => res.ok ? fetchMovies() : alert('Update failed'))
    .catch(() => alert('Network error'));
}

// DELETE – works for both old and newly added movies
function deleteMovie(movieId) {
    // json-server sometimes returns id as string → convert to number
    const id = Number(movieId);

    if (!confirm('Delete this movie permanently?')) return;

    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) {
                fetchMovies(); // refresh list
            } else {
                alert('Could not delete movie');
            }
        })
        .catch(() => alert('Network error – is json-server running?'));
}
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const API_KEY = '0006eb2f491636adfe817b4a61e40780';
const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    fetchMovies('avengers');
  }, []);

  const fetchMovies = async (query) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setMovies(data.results);
      } else {
        setMovies([]);
        setError('No movies found');
      }
    } catch (err) {
      setError('Failed to fetch movies');
      setMovies([]);
    }
    setLoading(false);
  };

  const fetchMovieDetails = async (id) => {
    setLoading(true);
    setError('');
    try {
      const [movieRes, videoRes] = await Promise.all([
        fetch(`${API_URL}/movie/${id}?api_key=${API_KEY}`),
        fetch(`${API_URL}/movie/${id}/videos?api_key=${API_KEY}`)
      ]);

      const movieData = await movieRes.json();
      const videoData = await videoRes.json();

      const trailer = videoData.results.find(
        (vid) => vid.type === 'Trailer' && vid.site === 'YouTube'
      );

      setSelectedMovie({
        ...movieData,
        trailerKey: trailer?.key || null,
      });
    } catch (err) {
      setError('Failed to fetch movie details');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      fetchMovies(search.trim());
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Theme Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="px-2 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-center">🎬 Movie App</h1>
        <form onSubmit={handleSearch} className="flex justify-center w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies..."
            className={`px-4 py-2 rounded-l border focus:outline-none w-64 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded font-semibold ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            <FaSearch />
          </button>
        </form>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-400">{error}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className={`rounded shadow p-2 flex flex-col items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <img
                src={movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}
                alt={movie.title}
                className="w-full h-64 object-cover rounded mb-2 cursor-pointer transition-transform hover:scale-105"
                onClick={() => fetchMovieDetails(movie.id)}
              />
              <div className="text-center">
                <h2 className="text-lg font-semibold">{movie.title}</h2>
                <p className="text-sm text-gray-400">{movie.release_date?.split('-')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className={`bg-white text-black rounded-lg shadow-lg p-6 w-[90%] max-w-2xl relative`}>
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-2 right-2 text-lg font-bold text-gray-600 hover:text-red-600"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedMovie.title}</h2>

            {selectedMovie.trailerKey ? (
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${selectedMovie.trailerKey}`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded mb-4"
              />
            ) : (
              <img
                src={selectedMovie.poster_path ? `${IMAGE_URL}${selectedMovie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}
                alt={selectedMovie.title}
                className="w-full h-80 object-cover mb-4 rounded"
              />
            )}

            <p><strong>Release Date:</strong> {selectedMovie.release_date}</p>
            <p><strong>Rating:</strong> {selectedMovie.vote_average}/10</p>
            <p className="mt-2"><strong>Overview:</strong> {selectedMovie.overview}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

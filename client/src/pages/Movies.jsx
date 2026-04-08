import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentAPI, subscriptionsAPI } from '../services/api';
import { HiFilm, HiSearch, HiStar, HiPlay, HiLockClosed, HiFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Movies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, search]);

  const fetchData = async () => {
    try {
      const [genresRes, subRes] = await Promise.all([
        contentAPI.getGenres(),
        subscriptionsAPI.getActive(),
      ]);
      setGenres(genresRes.data);
      setActiveSub(subRes.data.subscription);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGenre) params.genre = selectedGenre;
      if (search) params.search = search;
      const res = await contentAPI.getMovies(params);
      setMovies(res.data);
    } catch (error) {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (movie) => {
    if (!activeSub) return false;
    return activeSub.plan_id >= movie.plan_required;
  };

  return (
    <div className="content-page">
      <div className="container">
        <div className="content-header">
          <h1><HiFilm /> <span className="gradient-text">Movies</span></h1>
          <p>Explore our vast collection of movies</p>
        </div>

        {/* Filters */}
        <div className="content-filters">
          <div className="search-bar">
            <HiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="genre-filters">
            <button
              className={`filter-chip ${selectedGenre === '' ? 'active' : ''}`}
              onClick={() => setSelectedGenre('')}
            >
              <HiFilter /> All
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                className={`filter-chip ${selectedGenre === genre ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="loading-screen inline">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className={`movie-card-large ${!canAccess(movie) ? 'locked' : ''}`}
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="movie-poster">
                  <img src={movie.thumbnail_url} alt={movie.title} loading="lazy" />
                  <div className="movie-overlay">
                    {canAccess(movie) ? (
                      <button className="play-btn" onClick={(e) => { e.stopPropagation(); navigate(`/watch/movie/${movie.id}`); }}>
                        <HiPlay />
                      </button>
                    ) : (
                      <div className="lock-overlay">
                        <HiLockClosed />
                        <span>Requires {movie.plan_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="movie-rating">
                    <HiStar /> {movie.rating}
                  </div>
                  {movie.is_featured && <div className="featured-badge">⭐ Featured</div>}
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-meta">
                    {movie.genre} • {movie.release_year} • {movie.duration_minutes}min
                  </p>
                  <p className="movie-desc">{movie.description}</p>
                  <div className="movie-plan-tag">{movie.plan_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {movies.length === 0 && !loading && (
          <div className="empty-state">
            <HiFilm />
            <h3>No movies found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <div className="modal-backdrop" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content movie-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMovie(null)}>✕</button>
            <div className="modal-poster">
              <img src={selectedMovie.thumbnail_url} alt={selectedMovie.title} />
            </div>
            <div className="modal-details">
              <h2>{selectedMovie.title}</h2>
              <div className="modal-meta">
                <span className="modal-rating"><HiStar /> {selectedMovie.rating}</span>
                <span>{selectedMovie.genre}</span>
                <span>{selectedMovie.release_year}</span>
                <span>{selectedMovie.duration_minutes} min</span>
              </div>
              <p className="modal-description">{selectedMovie.description}</p>
              <div className="modal-plan">
                <span>Required Plan: <strong>{selectedMovie.plan_name}</strong></span>
              </div>
              {canAccess(selectedMovie) ? (
                <button className="btn btn-primary btn-lg" onClick={() => navigate(`/watch/movie/${selectedMovie.id}`)}>
                  <HiPlay /> Watch Now
                </button>
              ) : (
                <button className="btn btn-outline btn-lg" onClick={() => window.location.href = '/plans'}>
                  <HiLockClosed /> Upgrade to {selectedMovie.plan_name}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;

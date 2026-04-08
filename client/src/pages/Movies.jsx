import { motion, AnimatePresence } from 'framer-motion';

const Movies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

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
    <div className="content-page theme-movies">
      <div className="container">
        <motion.div 
          className="content-header"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1><HiFilm /> <span className="gradient-text">Movies</span></h1>
          <p>Explore our vast collection of movies</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="content-filters"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
        </motion.div>

        {/* Movies Grid */}
        {loading ? (
          <div className="loading-screen inline">
            <div className="loader"></div>
          </div>
        ) : (
          <motion.div 
            className="movies-grid"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <AnimatePresence>
              {movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  className={`movie-card-large ${!canAccess(movie) ? 'locked' : ''}`}
                  onClick={() => setSelectedMovie(movie)}
                  variants={itemVariants}
                  layout
                  whileHover={{ scale: 1.02, y: -5 }}
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
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {movies.length === 0 && !loading && (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <HiFilm />
            <h3>No movies found</h3>
            <p>Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </div>

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div 
            className="modal-backdrop" 
            onClick={() => setSelectedMovie(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content movie-modal" 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Movies;

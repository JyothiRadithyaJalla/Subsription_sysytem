import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionsAPI, contentAPI } from '../services/api';
import { HiFilm, HiDesktopComputer, HiCalendar, HiClock, HiStar, HiCreditCard, HiPlay } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSub, setActiveSub] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredChannels, setFeaturedChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, moviesRes, channelsRes] = await Promise.all([
        subscriptionsAPI.getActive(),
        contentAPI.getMovies({ featured: 'true' }),
        contentAPI.getChannels({ featured: 'true' }),
      ]);
      setActiveSub(subRes.data.subscription);
      setHasSubscription(subRes.data.active);
      setFeaturedMovies(moviesRes.data.slice(0, 6));
      setFeaturedChannels(channelsRes.data.slice(0, 6));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!activeSub) return 0;
    const end = new Date(activeSub.end_date);
    const now = new Date();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  };

  const getProgress = () => {
    if (!activeSub) return 0;
    const start = new Date(activeSub.start_date);
    const end = new Date(activeSub.end_date);
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page theme-dashboard">
      <div className="container">
        {/* Welcome Section */}
        <motion.div 
          className="dashboard-welcome"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="welcome-text">
            <h1>Welcome back, <span className="gradient-text">{user?.name}</span> 👋</h1>
            <p>Here's what's happening with your StreamFlix account</p>
          </div>
        </motion.div>

        {/* Subscription Status */}
        <motion.div 
          className="dashboard-grid"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="sub-status-card" variants={itemVariants}>
            {hasSubscription ? (
              <>
                <div className="sub-status-header">
                  <div className="sub-plan-badge">
                    <HiStar /> {activeSub.plan_name}
                  </div>
                  <span className="sub-status active">Active</span>
                </div>
                <div className="sub-details">
                  <div className="sub-detail-item">
                    <HiCalendar />
                    <div>
                      <small>Start Date</small>
                      <span>{new Date(activeSub.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="sub-detail-item">
                    <HiClock />
                    <div>
                      <small>Expires</small>
                      <span>{new Date(activeSub.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="sub-progress">
                  <div className="progress-header">
                    <span>Subscription Progress</span>
                    <span>{getDaysRemaining()} days remaining</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress()}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                    ></motion.div>
                  </div>
                </div>
                <div className="sub-features">
                  <h4>Your Plan Includes:</h4>
                  <div className="feature-tags">
                    {activeSub.features && (Array.isArray(activeSub.features) ? activeSub.features : JSON.parse(activeSub.features)).map((f, i) => (
                      <span key={i} className="feature-tag">✓ {f}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-subscription">
                <div className="no-sub-icon">🎬</div>
                <h3>No Active Subscription</h3>
                <p>Subscribe to a plan to unlock unlimited movies and channels</p>
                <Link to="/plans" className="btn btn-primary">
                  <HiCreditCard /> Choose a Plan
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <div className="quick-stats">
            {[
              { icon: <HiFilm />, color: '#667eea', val: `${featuredMovies.length}+`, label: "Featured Movies" },
              { icon: <HiDesktopComputer />, color: '#f093fb', val: `${featuredChannels.length}+`, label: "Featured Channels" },
              { icon: <HiClock />, color: '#4facfe', val: getDaysRemaining(), label: "Days Remaining" }
            ].map((s, i) => (
              <motion.div 
                className="stat-card" 
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.03, x: 5 }}
                style={{ '--accent': s.color }}
              >
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-info">
                  <span className="stat-value">{s.val}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Movies */}
        <motion.section 
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-header-inline">
            <h2><HiFilm /> Featured Movies</h2>
            <Link to="/movies" className="view-all-link">View All →</Link>
          </div>
          <div className="content-scroll">
            {featuredMovies.map((movie, i) => (
              <motion.div 
                key={movie.id} 
                className="movie-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="movie-poster">
                  <img src={movie.thumbnail_url} alt={movie.title} loading="lazy" />
                  <div className="movie-overlay">
                    <button className="play-btn" onClick={() => navigate(`/watch/movie/${movie.id}`)}>
                      <HiPlay />
                    </button>
                  </div>
                  <div className="movie-rating">
                    <HiStar /> {movie.rating}
                  </div>
                  <div className="movie-plan-tag">{movie.plan_name}</div>
                </div>
                <div className="movie-info">
                  <h4>{movie.title}</h4>
                  <p>{movie.genre} • {movie.release_year}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Featured Channels */}
        <motion.section 
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="section-header-inline">
            <h2><HiDesktopComputer /> Featured Channels</h2>
            <Link to="/channels" className="view-all-link">View All →</Link>
          </div>
          <div className="content-scroll">
            {featuredChannels.map((channel, i) => (
              <motion.div 
                key={channel.id} 
                className="channel-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="channel-logo">
                  <img src={channel.logo_url} alt={channel.name} loading="lazy" />
                  {channel.is_live && <span className="live-badge">● LIVE</span>}
                </div>
                <div className="channel-info">
                  <h4>{channel.name}</h4>
                  <p>{channel.category}</p>
                  <span className="channel-plan">{channel.plan_name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;

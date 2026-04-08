import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiFilm, HiStar, HiPlay, HiShieldCheck, HiLightningBolt } from 'react-icons/hi';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}></div>
            ))}
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <HiLightningBolt /> #1 Streaming Platform
          </div>
          <h1 className="hero-title">
            Unlimited <span className="gradient-text">Movies</span> &<br />
            <span className="gradient-text">TV Channels</span> Streaming
          </h1>
          <p className="hero-subtitle">
            Stream thousands of movies and live TV channels. One subscription, endless entertainment. Cancel anytime.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <HiPlay /> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Free Trial
                </Link>
                <Link to="/plans" className="btn btn-glass btn-lg">
                  View Plans
                </Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">15K+</span>
              <span className="stat-label">Movies</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Live Channels</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">4K</span>
              <span className="stat-label">Ultra HD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose <span className="gradient-text">StreamFlix</span>?</h2>
            <p>The ultimate entertainment experience at your fingertips</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <HiFilm />
              </div>
              <h3>Massive Library</h3>
              <p>Access thousands of movies across every genre, from blockbusters to indie gems updated weekly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                <HiPlay />
              </div>
              <h3>Live TV Channels</h3>
              <p>Watch 100+ live channels including sports, news, entertainment, and kids content in real-time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                <HiStar />
              </div>
              <h3>4K Ultra HD</h3>
              <p>Experience stunning visual quality with 4K Ultra HD streaming on premium plans.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                <HiShieldCheck />
              </div>
              <h3>No Lock-in</h3>
              <p>Flexible subscription plans with no contracts. Cancel anytime, no questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Start Streaming?</h2>
            <p>Join millions of viewers and start watching today. Plans start at just ₹199/month.</p>
            <Link to={user ? '/plans' : '/register'} className="btn btn-primary btn-lg">
              {user ? 'Explore Plans' : 'Get Started Now'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <HiFilm className="brand-icon" />
              <span>StreamFlix</span>
            </div>
            <p className="footer-text">© 2026 StreamFlix. All rights reserved. Built with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

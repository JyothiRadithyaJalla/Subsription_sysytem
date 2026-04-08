import { motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

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
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="hero-badge" variants={itemVariants}>
            <HiLightningBolt /> #1 Streaming Platform
          </motion.div>
          <motion.h1 className="hero-title" variants={itemVariants}>
            Unlimited <span className="gradient-text">Movies</span> &<br />
            <span className="gradient-text">TV Channels</span> Streaming
          </motion.h1>
          <motion.p className="hero-subtitle" variants={itemVariants}>
            Stream thousands of movies and live TV channels. One subscription, endless entertainment. Cancel anytime.
          </motion.p>
          <motion.div className="hero-actions" variants={itemVariants}>
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
          </motion.div>
          <motion.div className="hero-stats" variants={itemVariants}>
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
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Why Choose <span className="gradient-text">StreamFlix</span>?</h2>
            <p>The ultimate entertainment experience at your fingertips</p>
          </motion.div>
          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { icon: <HiFilm />, title: "Massive Library", desc: "Access thousands of movies across every genre, from blockbusters to indie gems updated weekly.", grad: "linear-gradient(135deg, #667eea, #764ba2)" },
              { icon: <HiPlay />, title: "Live TV Channels", desc: "Watch 100+ live channels including sports, news, entertainment, and kids content in real-time.", grad: "linear-gradient(135deg, #f093fb, #f5576c)" },
              { icon: <HiStar />, title: "4K Ultra HD", desc: "Experience stunning visual quality with 4K Ultra HD streaming on premium plans.", grad: "linear-gradient(135deg, #4facfe, #00f2fe)" },
              { icon: <HiShieldCheck />, title: "No Lock-in", desc: "Flexible subscription plans with no contracts. Cancel anytime, no questions asked.", grad: "linear-gradient(135deg, #43e97b, #38f9d7)" }
            ].map((f, i) => (
              <motion.div className="feature-card" variants={itemVariants} key={i} whileHover={{ y: -10 }}>
                <div className="feature-icon" style={{ background: f.grad }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>Ready to Start Streaming?</h2>
            <p>Join millions of viewers and start watching today. Plans start at just ₹199/month.</p>
            <Link to={user ? '/plans' : '/register'} className="btn btn-primary btn-lg">
              {user ? 'Explore Plans' : 'Get Started Now'}
            </Link>
          </motion.div>
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

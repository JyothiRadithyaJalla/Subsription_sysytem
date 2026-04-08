const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  // Connect without database first to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  });

  // Create database
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
  );
  await connection.end();

  // Reconnect with database selected
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  const connection2 = db;

  // Users table
  await connection2.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      avatar_url VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Plans table
  await connection2.execute(`
    CREATE TABLE IF NOT EXISTS plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      duration_days INT NOT NULL,
      description TEXT,
      features JSON,
      max_screens INT DEFAULT 1,
      video_quality VARCHAR(20) DEFAULT 'HD',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Subscriptions table
  await connection2.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      plan_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
    )
  `);

  // Movies table
  await connection2.execute(`
    CREATE TABLE IF NOT EXISTS movies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      genre VARCHAR(100),
      description TEXT,
      thumbnail_url VARCHAR(500),
      rating DECIMAL(3, 1) DEFAULT 0,
      release_year INT,
      duration_minutes INT,
      plan_required INT DEFAULT 1,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_required) REFERENCES plans(id)
    )
  `);

  // TV Channels table
  await connection2.execute(`
    CREATE TABLE IF NOT EXISTS channels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      logo_url VARCHAR(500),
      category VARCHAR(50),
      plan_required INT DEFAULT 1,
      is_live BOOLEAN DEFAULT TRUE,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_required) REFERENCES plans(id)
    )
  `);

  // Seed default plans
  const [existingPlans] = await connection2.execute('SELECT COUNT(*) as count FROM plans');
  if (existingPlans[0].count === 0) {
    await connection2.execute(`
      INSERT INTO plans (name, price, duration_days, description, features, max_screens, video_quality) VALUES
      ('Basic', 199.00, 30, 'Access to basic movies and channels with SD quality', '["SD Quality", "1 Screen", "Limited Movies", "5 Channels", "Mobile Only"]', 1, 'SD'),
      ('Standard', 499.00, 30, 'Full HD movies and channels on 2 screens', '["Full HD Quality", "2 Screens", "All Movies", "50+ Channels", "TV & Mobile", "Download Available"]', 2, 'Full HD'),
      ('Premium', 799.00, 30, 'Ultra HD 4K with all content on 4 screens', '["4K Ultra HD", "4 Screens", "All Movies + Exclusives", "100+ Channels", "All Devices", "Downloads", "Early Access", "No Ads"]', 4, '4K Ultra HD')
    `);
  }

  // Seed movies
  const [existingMovies] = await connection2.execute('SELECT COUNT(*) as count FROM movies');
  if (existingMovies[0].count === 0) {
    await connection2.execute(`
      INSERT INTO movies (title, genre, description, thumbnail_url, rating, release_year, duration_minutes, plan_required, is_featured) VALUES
      ('The Dark Horizon', 'Sci-Fi', 'A thrilling journey across galaxies to save humanity from an ancient threat.', 'https://picsum.photos/seed/movie1/400/600', 8.5, 2025, 148, 1, TRUE),
      ('Midnight Echo', 'Thriller', 'A detective uncovers a conspiracy that echoes through time itself.', 'https://picsum.photos/seed/movie2/400/600', 7.8, 2025, 132, 1, FALSE),
      ('Ocean Dreams', 'Drama', 'A marine biologist discovers a hidden world beneath the waves.', 'https://picsum.photos/seed/movie3/400/600', 8.2, 2024, 120, 1, TRUE),
      ('Neon Knights', 'Action', 'In a cyberpunk future, a group of rebels fight against corporate tyranny.', 'https://picsum.photos/seed/movie4/400/600', 8.7, 2025, 155, 2, TRUE),
      ('The Last Garden', 'Romance', 'Two strangers find love while restoring a forgotten garden.', 'https://picsum.photos/seed/movie5/400/600', 7.5, 2024, 110, 1, FALSE),
      ('Shadow Protocol', 'Action', 'Elite agents race against time to prevent a global catastrophe.', 'https://picsum.photos/seed/movie6/400/600', 8.0, 2025, 140, 2, FALSE),
      ('Quantum Break', 'Sci-Fi', 'When a quantum experiment goes wrong, reality begins to fracture.', 'https://picsum.photos/seed/movie7/400/600', 8.9, 2025, 165, 3, TRUE),
      ('Whispers in the Wind', 'Horror', 'A family moves to a remote village with dark secrets.', 'https://picsum.photos/seed/movie8/400/600', 7.3, 2024, 98, 1, FALSE),
      ('Golden Age', 'History', 'The untold story of an empire rise and fall.', 'https://picsum.photos/seed/movie9/400/600', 8.1, 2025, 175, 2, FALSE),
      ('Pixel Perfect', 'Animation', 'A digital character discovers they are living inside a video game.', 'https://picsum.photos/seed/movie10/400/600', 8.4, 2025, 95, 1, TRUE),
      ('The Eternal Flame', 'Fantasy', 'A young mage embarks on a quest to reignite the eternal flame.', 'https://picsum.photos/seed/movie11/400/600', 8.6, 2025, 142, 3, TRUE),
      ('City of Stars', 'Musical', 'Aspiring artists navigate the vibrant music scene of a neon-lit city.', 'https://picsum.photos/seed/movie12/400/600', 7.9, 2024, 128, 2, FALSE),
      ('Arctic Pulse', 'Adventure', 'Scientists discover a pulsating anomaly beneath the Arctic ice.', 'https://picsum.photos/seed/movie13/400/600', 8.3, 2025, 136, 3, FALSE),
      ('Laugh Track', 'Comedy', 'A washed-up comedian gets one last shot at the big time.', 'https://picsum.photos/seed/movie14/400/600', 7.6, 2024, 105, 1, FALSE),
      ('Binary Sunset', 'Sci-Fi', 'Colonists on a binary star system face impossible choices.', 'https://picsum.photos/seed/movie15/400/600', 8.8, 3, 152, 3, TRUE)
    `);
  }

  // Seed channels
  const [existingChannels] = await connection2.execute('SELECT COUNT(*) as count FROM channels');
  if (existingChannels[0].count === 0) {
    await connection2.execute(`
      INSERT INTO channels (name, description, logo_url, category, plan_required, is_live, is_featured) VALUES
      ('StreamFlix Movies', 'Non-stop blockbuster movies 24/7', 'https://picsum.photos/seed/ch1/200/200', 'Movies', 1, TRUE, TRUE),
      ('Action Zone', 'High-octane action films and series', 'https://picsum.photos/seed/ch2/200/200', 'Action', 1, TRUE, FALSE),
      ('Comedy Central', 'Best comedy shows and stand-up specials', 'https://picsum.photos/seed/ch3/200/200', 'Comedy', 1, TRUE, FALSE),
      ('Sci-Fi Universe', 'Explore the cosmos with sci-fi classics', 'https://picsum.photos/seed/ch4/200/200', 'Sci-Fi', 2, TRUE, TRUE),
      ('Drama Plus', 'Gripping drama series and films', 'https://picsum.photos/seed/ch5/200/200', 'Drama', 1, TRUE, FALSE),
      ('Kids World', 'Safe and fun content for children', 'https://picsum.photos/seed/ch6/200/200', 'Kids', 1, TRUE, TRUE),
      ('Sports Live', 'Live sports coverage from around the world', 'https://picsum.photos/seed/ch7/200/200', 'Sports', 2, TRUE, TRUE),
      ('News 24', 'Breaking news and in-depth analysis', 'https://picsum.photos/seed/ch8/200/200', 'News', 1, TRUE, FALSE),
      ('Music Hits', 'Top music videos and concerts', 'https://picsum.photos/seed/ch9/200/200', 'Music', 1, TRUE, FALSE),
      ('Documentary Hub', 'Award-winning documentaries', 'https://picsum.photos/seed/ch10/200/200', 'Documentary', 2, TRUE, FALSE),
      ('Horror Night', 'Spine-chilling horror content', 'https://picsum.photos/seed/ch11/200/200', 'Horror', 2, TRUE, FALSE),
      ('Anime World', 'Best anime from Japan and beyond', 'https://picsum.photos/seed/ch12/200/200', 'Anime', 2, TRUE, TRUE),
      ('Premium Cinema', 'Exclusive premium movie releases', 'https://picsum.photos/seed/ch13/200/200', 'Premium', 3, TRUE, TRUE),
      ('Live Events', 'Concerts, festivals, and live shows', 'https://picsum.photos/seed/ch14/200/200', 'Events', 3, TRUE, FALSE),
      ('4K Ultra', 'Everything in stunning 4K quality', 'https://picsum.photos/seed/ch15/200/200', 'Premium', 3, TRUE, FALSE)
    `);
  }

  // Create admin user (password: admin123)
  const [existingAdmin] = await connection2.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
  if (existingAdmin[0].count === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection2.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@streamflix.com', hashedPassword, 'admin']
    );
  }

  await connection2.end();
  console.log('✅ Database initialized successfully');
};

module.exports = initDatabase;

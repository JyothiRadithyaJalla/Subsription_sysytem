const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPlans() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  await db.query(`
    INSERT INTO plans (name, price, duration_days, description, features, max_screens, video_quality) VALUES 
    ('Mobile Only', 99.00, 30, 'Watch on your phone or tablet', '["SD Quality", "1 Mobile Screen", "Limited Movies"]', 1, 'SD'),
    ('Family', 1299.00, 30, 'Full feature access for the whole family', '["4K Ultra HD", "6 Screens", "All Movies", "Family Profiles"]', 6, '4K Ultra HD')
  `);
  
  console.log('Successfully added more plans!');
  db.end();
}

addPlans();

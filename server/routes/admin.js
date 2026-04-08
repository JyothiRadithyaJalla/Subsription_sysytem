const express = require('express');
const pool = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/admin/stats - Get dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [activeSubs] = await pool.execute("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active' AND end_date >= CURDATE()");
    const [totalRevenue] = await pool.execute(
      "SELECT COALESCE(SUM(p.price), 0) as total FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.status != 'cancelled'"
    );
    const [totalMovies] = await pool.execute('SELECT COUNT(*) as count FROM movies');
    const [totalChannels] = await pool.execute('SELECT COUNT(*) as count FROM channels');

    res.json({
      totalUsers: totalUsers[0].count,
      activeSubscriptions: activeSubs[0].count,
      totalRevenue: totalRevenue[0].total,
      totalMovies: totalMovies[0].count,
      totalChannels: totalChannels[0].count,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/admin/users - Get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
       s.id as sub_id, s.status as sub_status, s.start_date, s.end_date,
       p.name as plan_name
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active' AND s.end_date >= CURDATE()
       LEFT JOIN plans p ON s.plan_id = p.id
       ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/admin/subscriptions - Get all subscriptions
router.get('/subscriptions', protect, adminOnly, async (req, res) => {
  try {
    const [subs] = await pool.execute(
      `SELECT s.*, u.name as user_name, u.email as user_email, p.name as plan_name, p.price
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       JOIN plans p ON s.plan_id = p.id
       ORDER BY s.created_at DESC`
    );
    res.json(subs);
  } catch (error) {
    console.error('Admin get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

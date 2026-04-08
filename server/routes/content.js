const express = require('express');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/content/movies - Get all movies
router.get('/movies', async (req, res) => {
  try {
    const { genre, featured, search } = req.query;
    let query = 'SELECT m.*, p.name as plan_name FROM movies m JOIN plans p ON m.plan_required = p.id';
    const params = [];
    const conditions = [];

    if (genre) {
      conditions.push('m.genre = ?');
      params.push(genre);
    }

    if (featured === 'true') {
      conditions.push('m.is_featured = TRUE');
    }

    if (search) {
      conditions.push('(m.title LIKE ? OR m.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY m.is_featured DESC, m.rating DESC';

    const [movies] = await pool.execute(query, params);
    res.json(movies);
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ message: 'Server error fetching movies' });
  }
});

// @route GET /api/content/channels - Get all channels
router.get('/channels', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = 'SELECT c.*, p.name as plan_name FROM channels c JOIN plans p ON c.plan_required = p.id';
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }

    if (featured === 'true') {
      conditions.push('c.is_featured = TRUE');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.is_featured DESC, c.name ASC';

    const [channels] = await pool.execute(query, params);
    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ message: 'Server error fetching channels' });
  }
});

// @route GET /api/content/genres - Get distinct genres
router.get('/genres', async (req, res) => {
  try {
    const [genres] = await pool.execute('SELECT DISTINCT genre FROM movies ORDER BY genre');
    res.json(genres.map((g) => g.genre));
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/content/categories - Get distinct channel categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT DISTINCT category FROM channels ORDER BY category');
    res.json(categories.map((c) => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

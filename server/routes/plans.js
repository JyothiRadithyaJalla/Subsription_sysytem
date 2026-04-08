const express = require('express');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/plans
router.get('/', async (req, res) => {
  try {
    const [plans] = await pool.execute('SELECT * FROM plans WHERE is_active = TRUE ORDER BY price ASC');
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error fetching plans' });
  }
});

// @route GET /api/plans/:id
router.get('/:id', async (req, res) => {
  try {
    const [plans] = await pool.execute('SELECT * FROM plans WHERE id = ?', [req.params.id]);
    if (plans.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plans[0]);
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

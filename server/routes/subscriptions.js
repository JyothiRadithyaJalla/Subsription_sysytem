const express = require('express');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/subscriptions - Create a new subscription
router.post('/', protect, async (req, res) => {
  try {
    const { plan_id } = req.body;
    const user_id = req.user.id;

    if (!plan_id) {
      return res.status(400).json({ message: 'Please select a plan' });
    }

    // Check if plan exists
    const [plans] = await pool.execute('SELECT * FROM plans WHERE id = ? AND is_active = TRUE', [plan_id]);
    if (plans.length === 0) {
      return res.status(404).json({ message: 'Plan not found or inactive' });
    }

    const plan = plans[0];

    // Check for active/overlapping subscriptions (one active subscription per user)
    const [activeSubs] = await pool.execute(
      "SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' AND end_date >= CURDATE()",
      [user_id]
    );

    if (activeSubs.length > 0) {
      return res.status(400).json({
        message: 'You already have an active subscription. Please wait for it to expire or cancel it first.',
        active_subscription: activeSubs[0],
      });
    }

    // Calculate dates
    const start_date = new Date();
    const end_date = new Date();
    end_date.setDate(end_date.getDate() + plan.duration_days);

    const startStr = start_date.toISOString().split('T')[0];
    const endStr = end_date.toISOString().split('T')[0];

    // Double-check no overlapping subscriptions (prevent race conditions)
    const [overlap] = await pool.execute(
      `SELECT * FROM subscriptions 
       WHERE user_id = ? 
       AND status = 'active'
       AND start_date <= ? 
       AND end_date >= ?`,
      [user_id, endStr, startStr]
    );

    if (overlap.length > 0) {
      return res.status(400).json({
        message: 'Overlapping subscription detected. Cannot create a new subscription.',
      });
    }

    // Create subscription
    const [result] = await pool.execute(
      'INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, plan_id, startStr, endStr, 'active']
    );

    // Return created subscription with plan details
    const [newSub] = await pool.execute(
      `SELECT s.*, p.name as plan_name, p.price, p.features, p.max_screens, p.video_quality 
       FROM subscriptions s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Subscription created successfully!',
      subscription: newSub[0],
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error creating subscription' });
  }
});

// @route GET /api/subscriptions/active - Get user's active subscription
router.get('/active', protect, async (req, res) => {
  try {
    const [subs] = await pool.execute(
      `SELECT s.*, p.name as plan_name, p.price, p.features, p.max_screens, p.video_quality, p.duration_days
       FROM subscriptions s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.user_id = ? AND s.status = 'active' AND s.end_date >= CURDATE()
       ORDER BY s.created_at DESC 
       LIMIT 1`,
      [req.user.id]
    );

    if (subs.length === 0) {
      return res.json({ active: false, subscription: null });
    }

    res.json({ active: true, subscription: subs[0] });
  } catch (error) {
    console.error('Get active subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/subscriptions/history - Get user's subscription history
router.get('/history', protect, async (req, res) => {
  try {
    const [subs] = await pool.execute(
      `SELECT s.*, p.name as plan_name, p.price, p.features 
       FROM subscriptions s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.user_id = ? 
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    res.json(subs);
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route DELETE /api/subscriptions/:id - Cancel a subscription
router.delete('/:id', protect, async (req, res) => {
  try {
    const [subs] = await pool.execute(
      'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (subs.length === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subs[0].status !== 'active') {
      return res.status(400).json({ message: 'Subscription is already cancelled or expired' });
    }

    await pool.execute(
      "UPDATE subscriptions SET status = 'cancelled' WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error cancelling subscription' });
  }
});

module.exports = router;

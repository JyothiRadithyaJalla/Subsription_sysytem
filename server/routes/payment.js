const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @route POST /api/payment/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Amount is in rupees, convert to paise for Razorpay
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    // Note: If using dummy keys, this will fail. We allow a demo bypass.
    if ((process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey') === 'rzp_test_dummykey') {
      return res.json({
        id: `demo_order_${Date.now()}`,
        amount: options.amount,
        currency: "INR",
        isDemo: true
      });
    }

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating razorpay order' });
  }
});

// @route POST /api/payment/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id, isDemo } = req.body;

    if (!isDemo) {
      const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpay_signature) {
        return res.status(400).json({ message: 'Transaction not legit!' });
      }
    }

    // Payment is successful! We will now create the subscription!
    // This replicates the logic from subscriptions.post('/')
    const user_id = req.user.id;

    // Check plan and overlaps
    const [plans] = await pool.execute('SELECT * FROM plans WHERE id = ?', [plan_id]);
    if (plans.length === 0) return res.status(404).json({ message: 'Plan not found' });
    const plan = plans[0];

    const [activeSubs] = await pool.execute(
      "SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' AND end_date >= CURDATE()",
      [user_id]
    );

    if (activeSubs.length > 0) {
      return res.status(400).json({ message: 'You already have an active subscription.' });
    }

    const start_date = new Date();
    const end_date = new Date();
    end_date.setDate(end_date.getDate() + plan.duration_days);

    const startStr = start_date.toISOString().split('T')[0];
    const endStr = end_date.toISOString().split('T')[0];

    await pool.execute(
      'INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, plan_id, startStr, endStr, 'active']
    );

    res.json({ message: 'Payment verified and subscription activated successfully!', success: true });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

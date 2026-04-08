import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { plansAPI, subscriptionsAPI, paymentAPI } from '../services/api';
import { HiCheck, HiStar, HiLightningBolt, HiShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Plans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetchData();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes] = await Promise.all([
        plansAPI.getAll(),
      ]);
      setPlans(plansRes.data);

      if (user) {
        const subRes = await subscriptionsAPI.getActive();
        setActiveSub(subRes.data.subscription);
      }
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      toast('Please login to subscribe', { icon: '🔒' });
      navigate('/login');
      return;
    }

    if (activeSub) {
      toast.error('You already have an active subscription. Cancel it first.');
      return;
    }

    setSubscribing(planId);
    try {
      const plan = plans.find(p => p.id === planId);
      
      // 1. Get Order ID from backend
      const { data: orderData } = await paymentAPI.createOrder({ amount: plan.price });

      if (orderData.isDemo) {
        // Fallback for demo testing when keys are missing
        toast.loading('Processing demo payment...');
        setTimeout(async () => {
          toast.dismiss();
          await paymentAPI.verifyPayment({ 
            plan_id: planId, 
            isDemo: true 
          });
          toast.success('Demo Payment Verified & Subscribed! 🎉');
          navigate('/dashboard');
        }, 1500);
        return;
      }

      // 2. Open Razorpay Widget
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StreamFlix",
        description: `Subscription to ${plan.name} Plan`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            await paymentAPI.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: planId
            });
            toast.success('Payment Verified & Subscribed! 🎉');
            navigate('/dashboard');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#667eea" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      // Keep loading state until payment finishes or fails
      if (!window.Razorpay) setSubscribing(null);
    }
  };

  const planIcons = [<HiStar />, <HiLightningBolt />, <HiShieldCheck />, <HiStar />, <HiLightningBolt />];
  const planColors = ['var(--plan-basic)', 'var(--plan-standard)', 'var(--plan-premium)', 'var(--plan-basic)', 'var(--plan-premium)'];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="plans-page theme-plans">
      <div className="container">
        <div className="section-header centered">
          <h1>Choose Your <span className="gradient-text">Perfect Plan</span></h1>
          <p>Unlock unlimited entertainment with our flexible subscription plans</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            const isCurrentPlan = activeSub && activeSub.plan_id === plan.id;
            const features = Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);

            return (
              <div
                key={plan.id}
                className={`plan-card ${isPopular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                style={{ '--plan-color': planColors[index % planColors.length] || 'var(--plan-basic)' }}
              >
                {isPopular && <div className="popular-badge">Most Popular</div>}
                {isCurrentPlan && <div className="current-badge">Current Plan</div>}

                <div className="plan-header">
                  <div className="plan-icon">{planIcons[index % planIcons.length]}</div>
                  <h2 className="plan-name">{plan.name}</h2>
                  <p className="plan-desc">{plan.description}</p>
                </div>

                <div className="plan-price">
                  <span className="currency">₹</span>
                  <span className="amount">{Math.floor(plan.price)}</span>
                  <span className="period">/{plan.duration_days} days</span>
                </div>

                <div className="plan-specs">
                  <div className="spec-item">
                    <span className="spec-label">Screens</span>
                    <span className="spec-value">{plan.max_screens}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Quality</span>
                    <span className="spec-value">{plan.video_quality}</span>
                  </div>
                </div>

                <ul className="plan-features">
                  {features.map((feature, i) => (
                    <li key={i}>
                      <HiCheck className="check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`btn btn-full ${isPopular ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || subscribing === plan.id}
                >
                  {subscribing === plan.id
                    ? 'Subscribing...'
                    : isCurrentPlan
                    ? 'Current Plan'
                    : `Choose ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Plans;

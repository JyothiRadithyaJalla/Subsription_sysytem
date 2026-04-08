import { useState, useEffect } from 'react';
import { subscriptionsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { HiCollection, HiCalendar, HiCreditCard, HiTrash, HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MySubscriptions = () => {
  const [activeSub, setActiveSub] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activeRes, historyRes] = await Promise.all([
        subscriptionsAPI.getActive(),
        subscriptionsAPI.getHistory(),
      ]);
      setActiveSub(activeRes.data.subscription);
      setHistory(historyRes.data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }
    setCancelling(true);
    try {
      await subscriptionsAPI.cancel(id);
      toast.success('Subscription cancelled successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <HiCheckCircle className="status-icon active" />;
      case 'cancelled':
        return <HiXCircle className="status-icon cancelled" />;
      case 'expired':
        return <HiClock className="status-icon expired" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="subscriptions-page theme-subscriptions">
      <div className="container">
        <div className="content-header">
          <h1><HiCollection /> <span className="gradient-text">My Subscriptions</span></h1>
          <p>Manage your subscription and view history</p>
        </div>

        {/* Active Subscription */}
        {activeSub ? (
          <div className="active-sub-card">
            <div className="active-sub-header">
              <div>
                <span className="plan-label">Current Plan</span>
                <h2>{activeSub.plan_name}</h2>
              </div>
              <span className="status-badge active">Active</span>
            </div>
            <div className="active-sub-details">
              <div className="detail-row">
                <HiCalendar />
                <span>Started: {new Date(activeSub.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="detail-row">
                <HiClock />
                <span>Expires: {new Date(activeSub.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="detail-row">
                <HiCreditCard />
                <span>Price: ₹{activeSub.price}</span>
              </div>
            </div>
            <div className="active-sub-features">
              {activeSub.features && (Array.isArray(activeSub.features) ? activeSub.features : JSON.parse(activeSub.features)).map((f, i) => (
                <span key={i} className="feature-tag">✓ {f}</span>
              ))}
            </div>
            <button
              className="btn btn-danger"
              onClick={() => handleCancel(activeSub.id)}
              disabled={cancelling}
            >
              <HiTrash /> {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          </div>
        ) : (
          <div className="no-subscription-banner">
            <div className="no-sub-content">
              <h3>No Active Subscription</h3>
              <p>Start streaming your favorite movies and channels today</p>
              <Link to="/plans" className="btn btn-primary">
                <HiCreditCard /> Browse Plans
              </Link>
            </div>
          </div>
        )}

        {/* Subscription History */}
        <div className="history-section">
          <h2>Subscription History</h2>
          {history.length === 0 ? (
            <div className="empty-state small">
              <p>No subscription history yet</p>
            </div>
          ) : (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((sub) => (
                    <tr key={sub.id}>
                      <td><strong>{sub.plan_name}</strong></td>
                      <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                      <td>{new Date(sub.end_date).toLocaleDateString()}</td>
                      <td>₹{sub.price}</td>
                      <td>
                        <span className={`status-badge ${sub.status}`}>
                          {getStatusIcon(sub.status)} {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubscriptions;

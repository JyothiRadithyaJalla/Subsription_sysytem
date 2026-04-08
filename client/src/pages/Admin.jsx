import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { HiUserGroup, HiCreditCard, HiCash, HiFilm, HiDesktopComputer, HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, subsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getSubscriptions(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setSubscriptions(subsRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <HiCheckCircle className="status-icon active" />;
      case 'cancelled': return <HiXCircle className="status-icon cancelled" />;
      case 'expired': return <HiClock className="status-icon expired" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="content-header">
          <h1>⚡ <span className="gradient-text">Admin Dashboard</span></h1>
          <p>Manage users, subscriptions, and content</p>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats">
          <div className="admin-stat-card" style={{ '--accent': '#667eea' }}>
            <div className="admin-stat-icon"><HiUserGroup /></div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{stats?.totalUsers || 0}</span>
              <span className="admin-stat-label">Total Users</span>
            </div>
          </div>
          <div className="admin-stat-card" style={{ '--accent': '#4facfe' }}>
            <div className="admin-stat-icon"><HiCreditCard /></div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{stats?.activeSubscriptions || 0}</span>
              <span className="admin-stat-label">Active Subs</span>
            </div>
          </div>
          <div className="admin-stat-card" style={{ '--accent': '#43e97b' }}>
            <div className="admin-stat-icon"><HiCash /></div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">₹{stats?.totalRevenue || 0}</span>
              <span className="admin-stat-label">Revenue</span>
            </div>
          </div>
          <div className="admin-stat-card" style={{ '--accent': '#f093fb' }}>
            <div className="admin-stat-icon"><HiFilm /></div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{stats?.totalMovies || 0}</span>
              <span className="admin-stat-label">Movies</span>
            </div>
          </div>
          <div className="admin-stat-card" style={{ '--accent': '#f5576c' }}>
            <div className="admin-stat-icon"><HiDesktopComputer /></div>
            <div className="admin-stat-info">
              <span className="admin-stat-value">{stats?.totalChannels || 0}</span>
              <span className="admin-stat-label">Channels</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            Subscriptions ({subscriptions.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Current Plan</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={`${u.id}-${u.sub_id}`}>
                    <td>#{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.plan_name || <span className="text-muted">None</span>}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>
                      <div>
                        <strong>{s.user_name}</strong>
                        <br />
                        <small>{s.user_email}</small>
                      </div>
                    </td>
                    <td>{s.plan_name}</td>
                    <td>{new Date(s.start_date).toLocaleDateString()}</td>
                    <td>{new Date(s.end_date).toLocaleDateString()}</td>
                    <td>₹{s.price}</td>
                    <td>
                      <span className={`status-badge ${s.status}`}>
                        {getStatusIcon(s.status)} {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="admin-overview">
            <div className="overview-card">
              <h3>System Overview</h3>
              <p>StreamFlix Admin Panel provides a dashboard to manage users, subscriptions, and content. Use the tabs above to navigate between sections.</p>
              <div className="overview-highlights">
                <div className="highlight-item">
                  <span className="highlight-number">{stats?.totalUsers || 0}</span>
                  <span>registered users on the platform</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-number">{stats?.activeSubscriptions || 0}</span>
                  <span>currently active subscriptions</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-number">₹{stats?.totalRevenue || 0}</span>
                  <span>total revenue generated</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiFilm, HiMenu, HiX, HiUser, HiLogout, HiViewGrid, HiCreditCard, HiCollection, HiDesktopComputer } from 'react-icons/hi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <HiFilm className="brand-icon" />
          <span className="brand-text">StreamFlix</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>
                <HiViewGrid /> Dashboard
              </Link>
              <Link to="/movies" className="nav-link" onClick={() => setMobileOpen(false)}>
                <HiFilm /> Movies
              </Link>
              <Link to="/channels" className="nav-link" onClick={() => setMobileOpen(false)}>
                <HiDesktopComputer /> Channels
              </Link>
              <Link to="/plans" className="nav-link" onClick={() => setMobileOpen(false)}>
                <HiCreditCard /> Plans
              </Link>
              <Link to="/my-subscriptions" className="nav-link" onClick={() => setMobileOpen(false)}>
                <HiCollection /> My Subscriptions
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link nav-admin" onClick={() => setMobileOpen(false)}>
                  ⚡ Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/plans" className="nav-link" onClick={() => setMobileOpen(false)}>Plans</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="profile-menu">
              <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="profile-name">{user.name}</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown" onClick={() => setProfileOpen(false)}>
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    <span className="role-badge">{user.role}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/dashboard" className="dropdown-item"><HiUser /> Profile</Link>
                  <Link to="/my-subscriptions" className="dropdown-item"><HiCollection /> Subscriptions</Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <HiLogout /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

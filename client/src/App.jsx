import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import Movies from './pages/Movies';
import Channels from './pages/Channels';
import MySubscriptions from './pages/MySubscriptions';
import Admin from './pages/Admin';
import Watch from './pages/Watch';
import './index.css';

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Remove existing theme classes
    document.body.className = '';
    
    // Determine new theme class based on path
    const path = location.pathname;
    if (path.includes('/movies')) document.body.classList.add('theme-movies-bg');
    else if (path.includes('/channels')) document.body.classList.add('theme-channels-bg');
    else if (path.includes('/plans')) document.body.classList.add('theme-plans-bg');
    else if (path.includes('/dashboard')) document.body.classList.add('theme-dashboard-bg');
    else if (path.includes('/admin')) document.body.classList.add('theme-admin-bg');
    else if (path.includes('/my-subscriptions')) document.body.classList.add('theme-subscriptions-bg');
    else document.body.classList.add('theme-home-bg');
  }, [location]);

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/plans" element={<Plans />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <Movies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channels"
            element={
              <ProtectedRoute>
                <Channels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/:type/:id"
            element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-subscriptions"
            element={
              <ProtectedRoute>
                <MySubscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#e8e8e8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: { primary: '#43e97b', secondary: '#1a1a2e' },
            },
            error: {
              iconTheme: { primary: '#f5576c', secondary: '#1a1a2e' },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

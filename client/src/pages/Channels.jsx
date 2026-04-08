import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentAPI, subscriptionsAPI } from '../services/api';
import { HiDesktopComputer, HiSearch, HiPlay, HiLockClosed, HiFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Channels = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [catsRes, subRes] = await Promise.all([
        contentAPI.getCategories(),
        subscriptionsAPI.getActive(),
      ]);
      setCategories(catsRes.data);
      setActiveSub(subRes.data.subscription);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      const res = await contentAPI.getChannels(params);
      setChannels(res.data);
    } catch (error) {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (channel) => {
    if (!activeSub) return false;
    return activeSub.plan_id >= channel.plan_required;
  };

  return (
    <div className="content-page theme-channels">
      <div className="container">
        <div className="content-header">
          <h1><HiDesktopComputer /> <span className="gradient-text">TV Channels</span></h1>
          <p>Watch live TV channels from around the world</p>
        </div>

        {/* Category Filters */}
        <div className="content-filters">
          <div className="genre-filters">
            <button
              className={`filter-chip ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              <HiFilter /> All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Channels Grid */}
        {loading ? (
          <div className="loading-screen inline">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="channels-grid">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`channel-card-large ${!canAccess(channel) ? 'locked' : ''}`}
              >
                <div className="channel-card-top">
                  <div className="channel-logo-large">
                    <img src={channel.logo_url} alt={channel.name} loading="lazy" />
                  </div>
                  {channel.is_live && <span className="live-badge pulse">● LIVE</span>}
                  {channel.is_featured && <span className="featured-badge-sm">Featured</span>}
                </div>
                <div className="channel-card-body">
                  <h3>{channel.name}</h3>
                  <p className="channel-desc">{channel.description}</p>
                  <div className="channel-footer">
                    <span className="channel-category">{channel.category}</span>
                    <span className="channel-plan-badge">{channel.plan_name}</span>
                  </div>
                  {canAccess(channel) ? (
                    <button className="btn btn-primary btn-sm btn-full" onClick={() => navigate(`/watch/channel/${channel.id}`)}>
                      <HiPlay /> Watch Now
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-sm btn-full" onClick={() => window.location.href = '/plans'}>
                      <HiLockClosed /> Upgrade to Watch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {channels.length === 0 && !loading && (
          <div className="empty-state">
            <HiDesktopComputer />
            <h3>No channels found</h3>
            <p>Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channels;

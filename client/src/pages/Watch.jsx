import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
// Dummy video source for demo purposes
const DUMMY_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

const Watch = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the media metadata from API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [type, id]);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="watch-page">
      <div className="watch-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <HiArrowLeft /> Back to Browse
        </button>
        <h2>Now Playing: {type === 'movie' ? 'Movie' : 'Live Channel'} #{id}</h2>
      </div>
      
      <div className="video-container">
        {loading ? (
          <div className="loading-screen" style={{ height: '70vh' }}>
            <div className="loader"></div>
            <p>Loading Media...</p>
          </div>
        ) : (
          <video 
            controls 
            autoPlay 
            className="video-player"
            poster="https://picsum.photos/seed/video/1920/1080"
          >
            <source src={DUMMY_VIDEO_URL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="container" style={{ marginTop: '2rem' }}>
        <h3>Description</h3>
        <p>This is a simulated video playback demo for StreamFlix. You are currently streaming high-quality content securely through your authenticated active subscription.</p>
      </div>

      <style>{`
        .watch-page {
          background: #0f0f13;
          min-height: 100vh;
          color: #ffffff;
        }
        .watch-header {
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(0,0,0,0.8);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .back-btn {
          background: transparent;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .video-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          aspect-ratio: 16/9;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .video-player {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
};

export default Watch;

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles.css';
import AddChild from "../components/AddChild";
import ChildCard from "../components/ChildCard";
import ChildDetail from "../components/ChildDetail";
import ActivityList from "../components/ActivityList";
import NotificationBell from "../components/NotificationBell/NotificationBell";
import ChatButton from "../components/ChatButton/ChatButton";

const ParentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedChildForActivities, setSelectedChildForActivities] = useState(null);
  const [filter, setFilter] = useState('all');

  // fetch children on load
  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChildren(res.data.data || []);
      // Auto-select first child if available
      if (res.data.data && res.data.data.length > 0 && !selectedChildForActivities) {
        setSelectedChildForActivities(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleChildAdded = (newChild) => {
    setChildren((prev) => [...prev, newChild]);
    setShowAddChild(false);
    setSelectedChildForActivities(newChild);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5cfcf 0%, #dbbfbf 100%)' }}>
        <div className="loading-spinner"></div>
      </div>
    );

  return (
    <div className="app-container" style={{ background: 'linear-gradient(135deg, #f5cfcf 0%, #dbbfbf 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 className="gwendolyn-bold">🏡 SmartDaycare</h1>
            <p>Welcome, {user?.name} | Parent Dashboard</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <NotificationBell parentId={user?._id || user?.id} />
            <ChatButton userId={user?._id || user?.id} userRole="parent" />
            <button
              onClick={() => navigate('/notifications')}
              className="nav-btn"
            >
              🔔 Notifications
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="nav-btn"
            >
              💬 Chat
            </button>
            <button
              onClick={logout}
              className="nav-btn"
              style={{ background: '#ef4444' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Children Section */}
      <div className="form-container" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2>👨‍👩‍👧 My Children ({children.length})</h2>
          <button
            onClick={() => setShowAddChild(true)}
            className="btn btn-primary"
          >
            ➕ Register New Child
          </button>
        </div>

        {children.length === 0 ? (
          <div className="empty-state">
            <p>No children registered yet. Register your first child to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {children.map((child) => (
              <div
                key={child._id}
                className="summary-card"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => setSelectedChildForActivities(child)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3>{child.name}</h3>
                <p>Age: {child.age} years</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Click to view activities</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Viewing Section - Only show if a child is selected */}
      {selectedChildForActivities && (
        <>
          <div className="summary-card">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <h2>📊 Today's Summary for {selectedChildForActivities.name}</h2>
                <p>Get an overview of your child's day</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/reports/daily/${selectedChildForActivities._id}`)}
                  className="btn btn-primary"
                >
                  📄 View Daily Report
                </button>
                <button
                  onClick={() => setSelectedChildForActivities(null)}
                  className="btn"
                >
                  Close
                </button>
              </div>
            </div>
            <SummarySection childId={selectedChildForActivities._id} />
          </div>

          <div className="activities-container">
            <h2>📋 Daily Activities for {selectedChildForActivities.name}</h2>

            <div className="filter-container">
              {['all', 'meal', 'nap', 'activity', 'update'].map(type => (
                <button
                  key={type}
                  className={`filter-btn ${filter === type ? 'active' : ''}`}
                  onClick={() => setFilter(type)}
                >
                  {type === 'all' ? 'All Activities' :
                   type === 'meal' ? '🍽️ Meals' :
                   type === 'nap' ? '😴 Naps' :
                   type === 'activity' ? '🎨 Activities' : '📝 Updates'}
                </button>
              ))}
            </div>

            <ActivityList
              type="parent"
              childId={selectedChildForActivities._id}
              filter={filter}
            />
          </div>
        </>
      )}

      {/* MODALS */}
      {showAddChild && (
        <AddChild
          onClose={() => setShowAddChild(false)}
          onChildAdded={handleChildAdded}
        />
      )}

      {selectedChild && (
        <ChildDetail
          child={selectedChild}
          onClose={() => setSelectedChild(null)}
          onUpdate={(updated) =>
            setChildren((prev) =>
              prev.map((c) => (c._id === updated._id ? updated : c))
            )
          }
        />
      )}
    </div>
  );
};

// Summary Section Component
const SummarySection = ({ childId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, [childId]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/activities/summary/${childId}`);
      const data = response.data;
      
      if (data.success) {
        setSummary(data.data);
      } else {
        setError('Failed to fetch summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setError('Failed to load summary. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-summary">
        <div className="loading-spinner"></div>
        <p>Loading today's summary...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-summary">
        <p>{error}</p>
        <button onClick={fetchSummary} className="btn btn-primary">
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div>
          <h3 style={{ color: '#4a5568', fontSize: '1rem', marginBottom: '5px' }}>
            📅 {today}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Live updates every 30 seconds
          </p>
        </div>
        <button onClick={fetchSummary} className="btn">
          🔄 Refresh
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-item" style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white'
        }}>
          <div className="summary-value" style={{ fontSize: '2.8rem' }}>
            {summary?.total || 0}
          </div>
          <div className="summary-label">Today's Activities</div>
        </div>
        
        <div className="summary-item" style={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white'
        }}>
          <div className="summary-value" style={{ fontSize: '2.8rem' }}>
            {summary?.meals || 0}
          </div>
          <div className="summary-label">🍽️ Meals</div>
        </div>
        
        <div className="summary-item" style={{ 
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white'
        }}>
          <div className="summary-value" style={{ fontSize: '2.8rem' }}>
            {summary?.naps || 0}
          </div>
          <div className="summary-label">😴 Naps</div>
        </div>
        
        <div className="summary-item" style={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white'
        }}>
          <div className="summary-value" style={{ fontSize: '2.8rem' }}>
            {summary?.photos || 0}
          </div>
          <div className="summary-label">📸 Photos</div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;

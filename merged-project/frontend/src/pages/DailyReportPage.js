import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import '../styles.css';

const DailyReportPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await API.get(`/reports/daily/${childId}`, {
        params: { date: selectedDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.error || 'Failed to load daily report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, selectedDate]);


  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="app-container" style={{ padding: '40px 20px' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <p>Loading daily report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ padding: '40px 20px' }}>
        <div className="form-container">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="app-container" style={{ padding: '40px 20px' }}>
        <div className="form-container">
          <p>No report available for this date.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '20px' }}>
      <div className="header">
        <h1>📊 Daily Report</h1>
        <p>{report.child.name}'s Daily Activity Report</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ fontWeight: '600' }}>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-control"
            style={{ width: 'auto', display: 'inline-block' }}
          />
          <button className="btn btn-primary" onClick={fetchReport}>
            Load Report
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="form-container">
        <h2 style={{ marginBottom: '20px' }}>
          {formatDate(report.date)} - {report.child.name}
        </h2>

        {/* Attendance Summary */}
        {report.attendance && (
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
            <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>📅 Attendance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Check-In:</strong> {report.attendance.checkedIn ? '✅ Yes' : '❌ No'}
                {report.attendance.checkInTime && (
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Time: {formatTime(report.attendance.checkInTime)}
                  </div>
                )}
              </div>
              <div>
                <strong>Check-Out:</strong> {report.attendance.checkedOut ? '✅ Yes' : '❌ No'}
                {report.attendance.checkOutTime && (
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Time: {formatTime(report.attendance.checkOutTime)}
                  </div>
                )}
              </div>
            </div>
            {report.attendance.extraServices && report.attendance.extraServices.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <strong>Extra Services:</strong> {report.attendance.extraServices.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Summary Cards */}
        <div className="summary-grid" style={{ marginBottom: '30px' }}>
          <div className="summary-item">
            <div className="summary-value">{report.summary.totalActivities}</div>
            <div className="summary-label">Total Activities</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{report.summary.meals.total}</div>
            <div className="summary-label">Meals</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{report.summary.naps.count}</div>
            <div className="summary-label">Naps</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{report.summary.photos}</div>
            <div className="summary-label">Photos</div>
          </div>
        </div>

        {/* Meal Details */}
        {report.activities.meals.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>🍽️ Meals</h3>
            {report.activities.meals.map((meal) => (
              <div key={meal.id} className="activity-card">
                <div className="activity-card-header">
                  <span className="activity-type type-meal">{meal.mealType || 'Meal'}</span>
                  <span className="activity-time">{formatTime(meal.time)}</span>
                </div>
                <div className="activity-title">{meal.title}</div>
                <div className="activity-description">{meal.description}</div>
                {meal.foodItems && meal.foodItems.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Food Items:</strong> {meal.foodItems.join(', ')}
                  </div>
                )}
                {meal.quantity && (
                  <div style={{ marginTop: '5px' }}>
                    <strong>Quantity:</strong> {meal.quantity}
                  </div>
                )}
                {meal.photos && meal.photos.length > 0 && (
                  <div className="photos-container">
                    {meal.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${photo}`}
                        alt={`Meal activity ${idx + 1}`}
                        className="photo-thumbnail"
                      />
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                  Logged by: {meal.staffName}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nap Details */}
        {report.activities.naps.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>😴 Naps</h3>
            {report.activities.naps.map((nap) => (
              <div key={nap.id} className="activity-card">
                <div className="activity-card-header">
                  <span className="activity-type type-nap">Nap</span>
                  <span className="activity-time">{formatTime(nap.time)}</span>
                </div>
                <div className="activity-title">{nap.title}</div>
                <div className="activity-description">{nap.description}</div>
                {nap.duration && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Duration:</strong> {nap.duration} minutes
                  </div>
                )}
                {nap.mood && (
                  <div style={{ marginTop: '5px' }}>
                    <strong>Mood:</strong> {nap.mood}
                  </div>
                )}
                {nap.photos && nap.photos.length > 0 && (
                  <div className="photos-container">
                    {nap.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${photo}`}
                        alt={`Nap activity ${idx + 1}`}
                        className="photo-thumbnail"
                      />
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                  Logged by: {nap.staffName}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Details */}
        {report.activities.activities.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>🎨 Activities</h3>
            {report.activities.activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-card-header">
                  <span className="activity-type type-activity">{activity.activityType || 'Activity'}</span>
                  <span className="activity-time">{formatTime(activity.time)}</span>
                </div>
                <div className="activity-title">{activity.title}</div>
                <div className="activity-description">{activity.description}</div>
                {activity.photos && activity.photos.length > 0 && (
                  <div className="photos-container">
                    {activity.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${photo}`}
                        alt={`Activity log ${idx + 1}`}
                        className="photo-thumbnail"
                      />
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                  Logged by: {activity.staffName}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Updates */}
        {report.activities.updates.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>📝 Updates</h3>
            {report.activities.updates.map((update) => (
              <div key={update.id} className="activity-card">
                <div className="activity-card-header">
                  <span className="activity-type type-update">Update</span>
                  <span className="activity-time">{formatTime(update.time)}</span>
                </div>
                <div className="activity-title">{update.title}</div>
                <div className="activity-description">{update.description}</div>
                {update.photos && update.photos.length > 0 && (
                  <div className="photos-container">
                    {update.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${photo}`}
                        alt={`Update log ${idx + 1}`}
                        className="photo-thumbnail"
                      />
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                  Logged by: {update.staffName}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Gallery */}
        {report.photos && report.photos.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>📸 Photo Gallery</h3>
            <div className="photos-container" style={{ flexWrap: 'wrap' }}>
              {report.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={`http://localhost:5000${photo.url}`}
                  alt={`Daily activity ${idx + 1}`}
                  className="photo-thumbnail"
                  style={{ width: '120px', height: '120px' }}
                />
              ))}
            </div>
          </div>
        )}

        {report.summary.totalActivities === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No activities recorded for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReportPage;

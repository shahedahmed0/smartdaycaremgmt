import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../utils/api';
import '../styles.css';

const AttendanceManager = ({ childId, childName, onUpdate }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({
    isCheckedIn: false,
    isCheckedOut: false
  });
  const [checkOutData, setCheckOutData] = useState({
    extraServiceCharge: 0,
    meals: []
  });

  useEffect(() => {
    if (childId) {
      fetchAttendanceStatus();
    }
  }, [childId]);

  const fetchAttendanceStatus = async () => {
    try {
      const res = await API.get(`/attendance/status/${childId}`);
      setAttendanceStatus(res.data.data);
    } catch (err) {
      console.error('Failed to fetch attendance status:', err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await API.post('/attendance/check-in', { childId });
      setStatus({
        type: 'success',
        msg: `${childName} checked in successfully! ✅`
      });
      await fetchAttendanceStatus();
      if (onUpdate) onUpdate();
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to check in child'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await API.post('/attendance/check-out', {
        childId,
        extraServiceCharge: checkOutData.extraServiceCharge || 0,
        meals: checkOutData.meals
      });
      setStatus({
        type: 'success',
        msg: `${childName} checked out successfully! ✅`
      });
      setCheckOutData({ extraServiceCharge: 0, meals: [] });
      await fetchAttendanceStatus();
      if (onUpdate) onUpdate();
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to check out child'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMeal = (meal) => {
    setCheckOutData(prev => ({
      ...prev,
      meals: prev.meals.includes(meal)
        ? prev.meals.filter(m => m !== meal)
        : [...prev.meals, meal]
    }));
  };

  if (!childId) {
    return (
      <div className="form-container">
        <p>Please select a child to manage attendance</p>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ marginBottom: '20px' }}>
      <h2>📅 Attendance Management - {childName}</h2>
      
      {status && (
        <div
          className={`status-message ${status.type === 'success' ? 'success' : 'error'}`}
          style={{
            padding: '15px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '600',
            background: status.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: status.type === 'success' ? '#065f46' : '#991b1b',
            border: `2px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`
          }}
        >
          {status.msg}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '20px',
          background: attendanceStatus.isCheckedIn ? '#d1fae5' : '#fee2e2',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>
            Check-In Status
          </h3>
          <p style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: attendanceStatus.isCheckedIn ? '#065f46' : '#991b1b'
          }}>
            {attendanceStatus.isCheckedIn ? '✅ Checked In' : '❌ Not Checked In'}
          </p>
        </div>

        <div style={{
          padding: '20px',
          background: attendanceStatus.isCheckedOut ? '#d1fae5' : '#fee2e2',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>
            Check-Out Status
          </h3>
          <p style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: attendanceStatus.isCheckedOut ? '#065f46' : '#991b1b'
          }}>
            {attendanceStatus.isCheckedOut ? '✅ Checked Out' : '❌ Not Checked Out'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {!attendanceStatus.isCheckedIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: '1', minWidth: '150px' }}
          >
            {loading ? 'Checking In...' : '✅ Check In'}
          </button>
        )}

        {attendanceStatus.isCheckedIn && !attendanceStatus.isCheckedOut && (
          <>
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: '1', minWidth: '150px', background: '#ef4444' }}
            >
              {loading ? 'Checking Out...' : '🚪 Check Out'}
            </button>
          </>
        )}
      </div>

      {attendanceStatus.isCheckedIn && !attendanceStatus.isCheckedOut && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Check-Out Details (Optional)</h3>
          
          <div className="form-group">
            <label>Extra Service Charges (৳)</label>
            <input
              type="number"
              min="0"
              value={checkOutData.extraServiceCharge}
              onChange={(e) => setCheckOutData(prev => ({
                ...prev,
                extraServiceCharge: parseFloat(e.target.value) || 0
              }))}
              className="form-control"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Meals Served</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['breakfast', 'lunch', 'snack', 'dinner'].map(meal => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => toggleMeal(meal)}
                  className={`btn ${checkOutData.meals.includes(meal) ? 'btn-primary' : ''}`}
                  style={{
                    background: checkOutData.meals.includes(meal) ? '#a18a8a' : '#e2e8f0',
                    color: checkOutData.meals.includes(meal) ? 'white' : '#4a5568',
                    padding: '8px 16px',
                    fontSize: '0.9rem'
                  }}
                >
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;

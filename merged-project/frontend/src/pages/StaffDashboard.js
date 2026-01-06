import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles.css';
import {
  AcademicCapIcon,
  HeartIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import ActivityForm from "../components/ActivityForm";
import ActivityList from "../components/ActivityList";
import EmergencyAlert from "../components/EmergencyAlert/EmergencyAlert";
import PickupReminder from "../components/PickupReminder/PickupReminder";
import ChatButton from "../components/ChatButton/ChatButton";
import AttendanceManager from "../components/AttendanceManager";

const StaffDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedChild, setSelectedChild] = useState(null);
  const [assignedChildren, setAssignedChildren] = useState([]);

  // Get staff role
  const staffRole = user?.staffRole?.toLowerCase();

  // Fetch assigned children
  useEffect(() => {
    if (user?._id || user?.id) {
      fetchAssignedChildren();
    }
  }, [user]);

  const fetchAssignedChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      // Use the dedicated endpoint for staff to get assigned children
      const res = await API.get("/children/assigned", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assigned = res.data.data || [];
      setAssignedChildren(assigned);
      if (assigned.length > 0 && !selectedChild) {
        setSelectedChild(assigned[0]);
      } else if (assigned.length === 0) {
        setSelectedChild(null);
      }
    } catch (err) {
      console.error("Could not fetch assigned children:", err);
      setAssignedChildren([]);
      setSelectedChild(null);
    }
  };

  const handleActivityCreated = () => {
    setRefreshKey(prev => prev + 1);
    setStatus({
      type: "success",
      msg: "Activity created successfully! ✅",
    });
    setTimeout(() => setStatus(null), 4000);
  };

  // Define activity options per role
  const activityOptions = {
    caregiver: [
      "Feeding",
      "Diaper Change",
      "Nap Supervision",
      "Playtime",
      "Comforting Child",
      "Bathroom Assistance",
      "Health Check",
      "Outdoor Play",
    ],
    teacher: [
      "Story Time",
      "Art & Craft Session",
      "Circle Time",
      "Learning Activity",
      "Music & Movement",
      "Group Game",
      "Reading Session",
      "Educational Play",
    ],
    cook: [
      "Breakfast Preparation",
      "Lunch Cooking",
      "Snack Preparation",
      "Dinner Preparation",
      "Kitchen Cleaning",
      "Food Serving",
      "Menu Planning",
      "Inventory Check",
    ],
  };

  const activities = activityOptions[staffRole] || [];

  // Handle starting an activity
  const startActivity = async (activityName) => {
    setStatus(null);

    let endpoint = "";
    let payloadKey = "";

    if (staffRole === "cook") {
      endpoint = "/staff-activities/cooking";
      payloadKey = "cookingtype";
    } else if (staffRole === "caregiver") {
      endpoint = "/staff-activities/caregiving";
      payloadKey = "caregivingtype";
    } else if (staffRole === "teacher") {
      endpoint = "/staff-activities/teaching";
      payloadKey = "teachingtype";
    } else {
      setStatus({ type: "error", msg: "Invalid staff role." });
      return;
    }

    try {
      await API.post(endpoint, {
        staffId: user._id,
        [payloadKey]: activityName,
      });

      setStatus({
        type: "success",
        msg: `"${activityName}" logged successfully! ✅`,
      });

      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      console.error("Activity log failed:", err);
      setStatus({
        type: "error",
        msg:
          err.response?.data?.message ||
          "Failed to log activity. Please try again.",
      });
    }
  };

  // Icon mapping
  const getRoleIcon = () => {
    if (staffRole === "cook") return <AcademicCapIcon className="h-8 w-8" />;
    if (staffRole === "caregiver") return <HeartIcon className="h-8 w-8" />;
    if (staffRole === "teacher") return <BookOpenIcon className="h-8 w-8" />;
    return <ClipboardDocumentListIcon className="h-8 w-8" />;
  };

  const getRoleColor = () => {
    if (staffRole === "cook") return "text-amber-600";
    if (staffRole === "caregiver") return "text-pink-600";
    if (staffRole === "teacher") return "text-indigo-600";
    return "text-blue-600";
  };

  return (
    <div className="app-container" style={{ background: 'linear-gradient(135deg, #f5cfcf 0%, #dbbfbf 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 className="gwendolyn-bold">🏡 SmartDaycare - Staff Portal</h1>
            <p>Welcome, {user?.name} | {user?.staffRole}</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <ChatButton userId={user?._id || user?.id} userRole="staff" />
            <button
              onClick={() => navigate('/staff/profile')}
              className="nav-btn"
            >
              👤 My Profile
            </button>
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

      {/* Status Message */}
      {status && (
        <div
          className={`status-message ${status.type === "success" ? "success" : "error"}`}
          style={{
            padding: '15px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '600',
            background: status.type === "success" ? '#d1fae5' : '#fee2e2',
            color: status.type === "success" ? '#065f46' : '#991b1b',
            border: `2px solid ${status.type === "success" ? '#10b981' : '#ef4444'}`
          }}
        >
          {status.msg}
        </div>
      )}

      {/* Child Selection */}
      {assignedChildren.length > 0 && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h2>👶 Select Child</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
            {assignedChildren.map((child) => (
              <button
                key={child._id}
                className={`btn ${selectedChild?._id === child._id ? 'active' : ''}`}
                onClick={() => setSelectedChild(child)}
              >
                {child.name} (Age: {child.age})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Management */}
      {selectedChild && (
        <AttendanceManager
          childId={selectedChild._id}
          childName={selectedChild.name}
          onUpdate={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {/* Activity Creation Form */}
      {selectedChild && (
        <div className="form-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px', 
            flexWrap: 'wrap', 
            gap: '10px' 
          }}>
            <div>
              <h2>📝 Create Activity Log</h2>
              <p className="mb-4">Staff: {user?.name} | Child: {selectedChild.name}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedChild && (
                <>
                  <PickupReminder childId={selectedChild._id} />
                  <EmergencyAlert staffId={user?._id || user?.id} childId={selectedChild._id} />
                </>
              )}
            </div>
          </div>
          <ActivityForm
            staffId={user?._id || user?.id}
            childId={selectedChild._id}
            onActivityCreated={handleActivityCreated}
          />
        </div>
      )}

      {/* Quick Activity Buttons */}
      {selectedChild && activities.length > 0 && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h2>⚡ Quick Activity Log</h2>
          <p style={{ marginBottom: '20px', color: '#6b7280' }}>
            Click any button below to quickly log an activity
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {activities.map((activity) => (
              <button
                key={activity}
                onClick={() => startActivity(activity)}
                className="btn btn-primary"
                style={{ padding: '15px', fontSize: '1rem' }}
              >
                <ClockIcon style={{ display: 'inline-block', marginRight: '8px', width: '20px', height: '20px' }} />
                {activity}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity History */}
      {selectedChild && (
        <div className="activities-container">
          <h2>📋 Activity History</h2>
          <p>Your recent posts and updates for {selectedChild.name}</p>
          <ActivityList
            key={refreshKey}
            type="staff"
            staffId={user?._id || user?.id}
          />
        </div>
      )}

      {!selectedChild && assignedChildren.length === 0 && (
        <div className="form-container">
          <div className="empty-state">
            <p>No children assigned to you yet. Please contact an administrator.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;

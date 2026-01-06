import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ParentDashboard from './pages/ParentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import BillingDashboard from './pages/BillingDashboard';
import DailyReportPage from './pages/DailyReportPage';
import StaffProfilePage from './pages/StaffProfilePage';
import './App.css';
import './styles.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

const HomeRedirect = () => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'staff') return <Navigate to="/staff" />;
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Additional Features */}
          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={['parent', 'staff', 'admin']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute allowedRoles={['parent', 'staff', 'admin']}>
              <ChatPage />
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BillingDashboard />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BillingDashboard />
            </ProtectedRoute>
          } />

          <Route path="/reports/daily/:childId" element={
            <ProtectedRoute allowedRoles={['parent', 'staff']}>
              <DailyReportPage />
            </ProtectedRoute>
          } />

          <Route path="/staff/profile" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

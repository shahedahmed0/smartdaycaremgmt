import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import '../styles.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to role dashboard
    if (!loading && user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "staff") navigate("/staff");
      else navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const role = result.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff");
      else navigate("/dashboard"); // parent
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f5cfcf 0%, #dbbfbf 100%)', padding: '40px 20px' }}>
      <div className="form-container" style={{ maxWidth: '450px', width: '100%', margin: '0 auto' }}>
        <div className="text-center mb-8">
          <h1 className="gwendolyn-bold" style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#2d3748' }}>🏡 Smart Daycare</h1>
          <p style={{ color: '#4a5568', fontSize: '1.1rem', fontWeight: '300' }}>Management & Parent Monitoring</p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="••••••••"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: '#4a5568' }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

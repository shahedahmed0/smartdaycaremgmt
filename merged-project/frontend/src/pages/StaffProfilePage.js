import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import '../styles.css';

const StaffProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    qualifications: [],
    certifications: [],
    experience: '',
    joiningDate: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [newQualification, setNewQualification] = useState('');
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    if (user && user.role === 'staff') {
      fetchProfile();
    } else if (user && user.role !== 'staff') {
      navigate('/staff');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await API.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = res.data.data;
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        qualifications: profileData.qualifications || [],
        certifications: profileData.certifications || [],
        experience: profileData.experience || '',
        joiningDate: profileData.joiningDate 
          ? new Date(profileData.joiningDate).toISOString().split('T')[0] 
          : '',
        emergencyContact: profileData.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        }
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);

      await API.post('/users/profile/photo', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Profile photo updated successfully!');
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      const res = await API.put('/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ padding: '40px 20px' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="app-container" style={{ padding: '40px 20px' }}>
        <div className="form-container">
          <div className="error-message">Profile not found</div>
          <button className="btn btn-primary" onClick={() => navigate('/staff')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '20px' }}>
      <div className="header">
        <h1>👤 My Profile</h1>
        <p>View and manage your staff profile information</p>
        <div style={{ marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/staff')}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ marginBottom: '20px' }}>
          {success}
        </div>
      )}

      <div className="form-container">
        {!editing ? (
          <>
            {/* View Mode */}
            <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', alignItems: 'flex-start' }}>
              <div>
                {profile.profilePhoto ? (
                  <img
                    src={`http://localhost:5000${profile.profilePhoto}`}
                    alt="Profile"
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #a18a8a'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      background: '#dbbfbf',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      border: '3px solid #a18a8a'
                    }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ marginTop: '15px' }}>
                  <label className="btn btn-primary" style={{ cursor: 'pointer', marginBottom: '0' }}>
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ marginBottom: '20px' }}>{profile.name}</h2>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Role:</strong> {profile.staffRole || 'Staff'}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Email:</strong> {profile.email}
                </div>
                {profile.phone && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Phone:</strong> {profile.phone}
                  </div>
                )}
                {profile.address && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Address:</strong> {profile.address}
                  </div>
                )}
                {profile.experience !== undefined && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Experience:</strong> {profile.experience} years
                  </div>
                )}
                {profile.joiningDate && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Joining Date:</strong>{' '}
                    {new Date(profile.joiningDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '10px' }}>Bio</h3>
                <p style={{ lineHeight: '1.6', color: '#4a5568' }}>{profile.bio}</p>
              </div>
            )}

            {profile.qualifications && profile.qualifications.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '10px' }}>Qualifications</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {profile.qualifications.map((qual, idx) => (
                    <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                      • {qual}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profile.certifications && profile.certifications.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '10px' }}>Certifications</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {profile.certifications.map((cert, idx) => (
                    <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                      • {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profile.emergencyContact && profile.emergencyContact.name && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '10px' }}>Emergency Contact</h3>
                <div>
                  <strong>Name:</strong> {profile.emergencyContact.name}
                </div>
                {profile.emergencyContact.phone && (
                  <div>
                    <strong>Phone:</strong> {profile.emergencyContact.phone}
                  </div>
                )}
                {profile.emergencyContact.relationship && (
                  <div>
                    <strong>Relationship:</strong> {profile.emergencyContact.relationship}
                  </div>
                )}
              </div>
            )}

            {profile.childList && profile.childList.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '10px' }}>Assigned Children ({profile.childList.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {profile.childList.map((child) => (
                    <div key={child._id} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontWeight: '600' }}>{child.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>Age: {child.age}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button className="btn btn-primary" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <form onSubmit={handleSubmit}>
              <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-control textarea"
                  rows="4"
                  maxLength="500"
                  placeholder="Tell us about yourself..."
                />
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                  {formData.bio.length}/500 characters
                </div>
              </div>

              <div className="form-group">
                <label>Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Qualifications</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    className="form-control"
                    placeholder="Add qualification"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQualification();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddQualification}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {formData.qualifications.map((qual, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '5px 15px',
                        background: '#dbbfbf',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      {qual}
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          color: '#ef4444'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Certifications</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    className="form-control"
                    placeholder="Add certification"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCertification();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddCertification}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {formData.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '5px 15px',
                        background: '#dbbfbf',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          color: '#ef4444'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Emergency Contact</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Name"
                  />
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Phone"
                  />
                </div>
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Relationship"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffProfilePage;

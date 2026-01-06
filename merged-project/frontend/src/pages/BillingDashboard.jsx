import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/billingApi';
import '../styles.css';

const BillingDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const fetchInvoices = async () => {
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterYear) params.year = filterYear;
      if (filterMonth) params.month = filterMonth;
      
      const res = await api.get('/billing/invoices', { params });
      setInvoices(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching invoices:', err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Failed to load invoices. Please check if the backend is running.');
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/summary');
      setAnalytics(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Failed to load analytics. Please check if the backend is running.');
      }
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchInvoices(), fetchAnalytics()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterYear, filterMonth]);

  const handleGenerateInvoices = async () => {
    try {
      setGenLoading(true);
      setError('');
      setSuccess('');
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      await api.post(`/billing/generate/${year}/${month}`);
      setSuccess(`Invoices generated successfully for ${month}/${year}!`);
      await fetchInvoices();
      await fetchAnalytics();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error generating invoices:', err);
      setError(err.response?.data?.message || 'Failed to generate invoices.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      setError('');
      await api.patch(`/billing/invoices/${id}/pay`);
      setSuccess('Invoice marked as paid successfully!');
      await fetchInvoices();
      await fetchAnalytics();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err.response?.data?.message || 'Failed to update payment status.');
    }
  };

  const handleViewInvoice = (invoiceId) => {
    // Could open a modal or navigate to invoice detail page
    window.open(`/api/billing/invoices/${invoiceId}`, '_blank');
  };

  // Calculate analytics
  const avgPerInvoice =
    analytics && analytics.revenue.invoiceCount > 0
      ? analytics.revenue.totalRevenueThisMonth / analytics.revenue.invoiceCount
      : 0;

  const avgPerChild =
    analytics && analytics.totalChildren > 0
      ? analytics.revenue.totalRevenueThisMonth / analytics.totalChildren
      : 0;

  const avgChildrenPerStaff =
    analytics && analytics.staffWorkload && analytics.staffWorkload.length > 0
      ? (
          analytics.staffWorkload.reduce(
            (sum, s) => sum + (s.childrenAssignedCount || 0),
            0
          ) / analytics.staffWorkload.length
        ).toFixed(1)
      : 0;

  // Generate year options (current year and past 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  if (!user || user.role !== 'admin') {
    return (
      <div className="app-container" style={{ padding: '40px 20px' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <p>Access denied. Admin access required.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin')}>
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ background: 'linear-gradient(135deg, #f5cfcf 0%, #dbbfbf 100%)', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 className="gwendolyn-bold">💰 Billing & Analytics Dashboard</h1>
            <p>Manage invoices and view comprehensive analytics</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin')}>
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>

      {/* Status Messages */}
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

      {/* Action Bar */}
      <div className="form-container" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Quick Actions</h2>
          <button
            onClick={handleGenerateInvoices}
            className="btn btn-primary"
            disabled={genLoading || loading}
          >
            {genLoading ? 'Generating...' : '📄 Generate Invoices for Current Month'}
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Year:</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="form-control"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Month:</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={loadAll}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="summary-grid" style={{ marginBottom: '30px' }}>
          {/* Revenue Card */}
          <div className="summary-item" style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div className="summary-value" style={{ fontSize: '2.5rem', color: 'white' }}>
              ৳ {analytics.revenue.totalRevenueThisMonth.toFixed(0)}
            </div>
            <div className="summary-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Revenue (This Month)
            </div>
            <div style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.9 }}>
              <div>Invoices: {analytics.revenue.invoiceCount}</div>
              <div>Paid: {analytics.revenue.paidCount} | Unpaid: {analytics.revenue.unpaidCount}</div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                <div>Avg per invoice: ৳ {avgPerInvoice.toFixed(0)}</div>
                <div>Avg per child: ৳ {avgPerChild.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="summary-item" style={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div className="summary-value" style={{ fontSize: '2.5rem', color: 'white' }}>
              {analytics.totalChildren}
            </div>
            <div className="summary-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Total Children
            </div>
            <div style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.9 }}>
              <div>Avg attendance/week: {analytics.averageAttendancePerWeek.toFixed(1)}</div>
              <div>Busiest hour: {analytics.busiestHour !== null ? `${analytics.busiestHour}:00` : 'N/A'}</div>
            </div>
          </div>

          {/* Staff & Meals Card */}
          <div className="summary-item" style={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div className="summary-value" style={{ fontSize: '2.5rem', color: 'white' }}>
              {analytics.totalStaff}
            </div>
            <div className="summary-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Total Staff
            </div>
            <div style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.9 }}>
              <div>Avg children per staff: {avgChildrenPerStaff}</div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                Meals: {analytics.mealConsumptionStats.map(m => `${m.meal}: ${m.count}`).join(', ') || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Occupancy Table */}
      {analytics && analytics.occupancy && analytics.occupancy.length > 0 && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>📅 Daily Occupancy (Current Month)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#c89b9b', color: '#2d3748' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Present</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Occupancy Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.occupancy.map((row) => (
                  <tr key={row.date} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{row.date}</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{row.present}</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                      {(row.occupancyRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Workload Table */}
      {analytics && analytics.staffWorkload && analytics.staffWorkload.length > 0 && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>👥 Staff Workload</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#c89b9b', color: '#2d3748' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Children Assigned</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Weekly Hours</th>
                </tr>
              </thead>
              <tbody>
                {analytics.staffWorkload.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{s.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', textTransform: 'capitalize' }}>{s.role}</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{s.childrenAssignedCount}</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{s.weeklyHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="form-container">
        <h2 style={{ marginBottom: '20px' }}>📋 Invoices</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No invoices found for the selected filters.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
              Click "Generate Invoices for Current Month" to create invoices.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#c89b9b', color: '#2d3748' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Child</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Month/Year</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Days</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Base/Day</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Extra</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #a18a8a' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                      {inv.child?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                      {inv.month}/{inv.year}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{inv.daysPresent}</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>৳ {inv.baseRatePerDay}</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>৳ {inv.extraCharges}</td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0', fontWeight: '600' }}>
                      ৳ {inv.totalAmount}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: inv.status === 'paid' ? '#d1fae5' : '#fef3c7',
                          color: inv.status === 'paid' ? '#065f46' : '#92400e'
                        }}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>
                      {inv.status === 'unpaid' && (
                        <button
                          onClick={() => handleMarkPaid(inv._id)}
                          className="btn btn-primary"
                          style={{ padding: '6px 15px', fontSize: '0.9rem' }}
                        >
                          Mark Paid
                        </button>
                      )}
                      {inv.status === 'paid' && (
                        <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓ Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingDashboard;

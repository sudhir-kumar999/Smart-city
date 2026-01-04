import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../App.css';

const ComplaintList = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);

      const response = await api.get(`/complaints?${params.toString()}`);
      if (response.data.success) {
        setComplaints(response.data.data.complaints);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    if (!['admin', 'officer'].includes(user?.role)) {
      setError('You do not have permission to update complaint status');
      return;
    }

    try {
      const response = await api.patch(`/complaints/${complaintId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        fetchComplaints(); // Refresh list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'in-progress':
        return '#007bff';
      case 'resolved':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Complaints</h1>
        <Link to="/complaints/register" className="btn btn-primary">
          Register New Complaint
        </Link>
      </div>

      {/* Filters */}
      {(user?.role === 'admin' || user?.role === 'officer') && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">Filters</div>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="">All</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="sanitation">Sanitation</option>
                <option value="traffic">Traffic</option>
                <option value="safety">Safety</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {complaints.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>No complaints found.</p>
        </div>
      ) : (
        complaints.map((complaint) => (
          <div key={complaint._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ marginBottom: '10px' }}>{complaint.title}</h3>
                <p style={{ color: '#666', marginBottom: '10px' }}>{complaint.description}</p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '14px', color: '#666' }}>
                  <span><strong>Category:</strong> {complaint.category}</span>
                  <span><strong>Created:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  {complaint.location?.address && (
                    <span><strong>Location:</strong> {complaint.location.address}</span>
                  )}
                </div>
              </div>
              <span
                style={{
                  padding: '5px 15px',
                  borderRadius: '20px',
                  backgroundColor: getStatusColor(complaint.status),
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {complaint.status.toUpperCase()}
              </span>
            </div>

            {complaint.image && (
              <div style={{ marginBottom: '15px' }}>
                <img
                  src={complaint.image}
                  alt="Complaint"
                  style={{ maxWidth: '300px', borderRadius: '5px' }}
                />
              </div>
            )}

            {/* Status Update (Admin/Officer only) */}
            {(user?.role === 'admin' || user?.role === 'officer') && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <label style={{ marginRight: '10px' }}>Update Status:</label>
                <select
                  value={complaint.status}
                  onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                  style={{ padding: '5px 10px', marginRight: '10px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            )}

            {/* Resolution Notes */}
            {complaint.resolutionNotes && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <strong>Resolution Notes:</strong> {complaint.resolutionNotes}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ComplaintList;


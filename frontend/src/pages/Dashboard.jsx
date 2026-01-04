import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="card">
        <div className="card-header">Welcome, {user?.name}!</div>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <Link to="/complaints/register" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-header">Register Complaint</div>
          <p>Submit a new complaint about city issues</p>
        </Link>

        <Link to="/complaints" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-header">View Complaints</div>
          <p>View all your complaints and their status</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;


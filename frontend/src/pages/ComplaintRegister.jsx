import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../App.css';

const ComplaintRegister = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    location: {
      latitude: '',
      longitude: '',
      address: ''
    },
    image: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'latitude' || name === 'longitude' || name === 'address') {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64 for simplicity (in production, upload to cloud storage)
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              ...formData.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          setError('Unable to retrieve your location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    if (!formData.location.latitude || !formData.location.longitude) {
      setError('Location is required. Please use "Get Current Location" or enter coordinates.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/complaints', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: {
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude),
          address: formData.location.address || ''
        },
        image: formData.image
      });

      if (response.data.success) {
        setSuccess('Complaint registered successfully!');
        setTimeout(() => {
          navigate('/complaints');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Register Complaint</h1>

      <div className="card">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Detailed description of the complaint"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="infrastructure">Infrastructure</option>
              <option value="sanitation">Sanitation</option>
              <option value="traffic">Traffic</option>
              <option value="safety">Safety</option>
              <option value="utilities">Utilities</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn btn-secondary"
              style={{ marginBottom: '10px' }}
            >
              Get Current Location
            </button>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.location.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              required
              style={{ marginBottom: '10px' }}
            />
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.location.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              required
              style={{ marginBottom: '10px' }}
            />
            <input
              type="text"
              name="address"
              value={formData.location.address}
              onChange={handleChange}
              placeholder="Address (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image (Optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/complaints')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintRegister;


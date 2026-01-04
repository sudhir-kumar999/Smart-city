import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (!pendingEmail) {
      navigate('/login');
    } else {
      setEmail(pendingEmail);
    }
  }, [navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOTP(email, otpString);
      if (response.success) {
        localStorage.removeItem('pendingEmail');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0').focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Two-Factor Authentication
      </h2>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
        Enter the 6-digit code sent to your email
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                width: '50px',
                height: '60px',
                fontSize: '24px',
                textAlign: 'center',
                border: '2px solid #ddd',
                borderRadius: '5px'
              }}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;


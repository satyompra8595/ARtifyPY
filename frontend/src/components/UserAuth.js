import React, { useState } from 'react';
import { loginUser, registerUser } from '../utils/api';

const UserAuth = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      let response;
      if (isLogin) response = await loginUser(formData.email, formData.password);
      else response = await registerUser(formData.name, formData.email, formData.password);
      if (response.success) {
        localStorage.setItem('token', response.data.access_token);
        onLogin(response.data.user);
      } else setError(response.error || 'Authentication failed');
    } catch (err) { setError('An error occurred. Please try again.'); } finally { setLoading(false); }
  };
  return (
    <div className="auth-modal">
      <div className="auth-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && <div className="form-group"><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required/></div>}
          <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required/></div>
          <div className="form-group"><label>Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"/></div>
          {error && <div style={{color:'red',textAlign:'center'}}>{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}</button>
        </form>
      </div>
    </div>
  );
};

export default UserAuth;

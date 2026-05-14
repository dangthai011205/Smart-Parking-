import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './LoginPage.css';

export default function LoginPage({ setIsLoggedIn, setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: email, password, role })
      });

      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(true);
        setUser(data.user);
        navigate(data.user.role === 'admin' && role === 'admin' ? '/administration' : '/dashboard');
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-topbar">
        <div className="login-topbar-links">
          <a href="#">Help</a>
          <a href="#">Home</a>
        </div>
      </div>

      <div className="login-body">
        <div className="login-left">
          <h1 className="login-heading">WELCOME BACK!</h1>

          <form onSubmit={handleLogin} className="login-form">
            <label>Email</label>
            <input
              type="email"
              placeholder="email@parking.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <label>Login as</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">User</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" className="login-btn">Sign In</button>
          </form>

          <p className="login-note">Account is provided by admin. Registration may be limited.</p>
          <div className="register-link">
            Don't have an account? <a href="/register">Register here</a>
          </div>
        </div>

        <div className="login-right">
          <div className="login-image-overlay">
            <span>Smart Parking System</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return alert('Passwords do not match!');
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password,
          name,
          email
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Register successful!');
        navigate('/login');
      } else {
        alert('Register failed: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div className="register-page">
      <div className="register-topbar">
        <div className="register-topbar-links">
          <a href="#">Help</a>
          <a href="/login">Sign In</a>
        </div>
      </div>

      <div className="register-body">
        <div className="register-card">
          <h1>Create Account</h1>
          <p>Join Smart Parking System</p>

          <form onSubmit={handleRegister}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label>Email</label>
            <input
              type="email"
              placeholder="email@parking.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="+84 000 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit">Create Account</button>
          </form>

          <div className="signin-link">
            Already have an account? <a href="/login">Sign in here</a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

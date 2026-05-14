import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ user }) {
  const isAdmin = user?.role === 'admin';
  const menu = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    ...(isAdmin ? [{ name: 'Parking Access', icon: '🚗', path: '/parking-access' }] : []),
    { name: 'Monitoring', icon: '📹', path: '/monitoring' },
    { name: 'Guidance & Payment', icon: '💵', path: '/guidance-payment' },
    ...(isAdmin ? [{ name: 'Administration', icon: '⚙️', path: '/administration' }] : []),
  ];

  const handleLogout = () => {
    // TODO: set isLoggedIn = false hoặc context
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div>
        <h2>Smart Parking</h2>
        <ul>
          {menu.map((item, idx) => (
            <li key={idx}>
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        ⬅️ Logout
      </button>
    </div>
  );
}
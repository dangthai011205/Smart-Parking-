import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './TopNav.css';

export default function TopNav({ user }) {
  const isAdmin = user?.role === 'admin';
  const location = useLocation();

  const menu = [
    { name: 'Dashboard', path: '/dashboard' },
    ...(isAdmin ? [{ name: 'Parking Access', path: '/parking-access' }] : []),
    { name: 'Monitoring', path: '/monitoring' },
    { name: 'Payment', path: '/guidance-payment' },
    ...(isAdmin ? [{ name: 'Administration', path: '/administration' }] : []),
  ];

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <nav className="topnav">
      <div className="topnav-brand">Smart Parking</div>

      <ul className="topnav-menu">
        {menu.map((item, idx) => (
          <li key={idx}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="topnav-user">
        <div className="topnav-avatar">{user?.name?.charAt(0) || 'U'}</div>
        <span className="topnav-username">{user?.name || 'User'}</span>
        <button className="topnav-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

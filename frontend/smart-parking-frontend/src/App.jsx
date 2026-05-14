import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ParkingAccessPage from './pages/ParkingAccessPage';
import ParkingMonitoringPage from './pages/ParkingMonitoringPage';
import GuidancePaymentPage from './pages/GuidancePaymentPage';
import AdministrationPage from './pages/AdministrationPage';

function App() {
  // State kiểm tra login, có thể sau này đổi thành context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  return (
    <Router>
      <Routes>
        {/* Redirect nếu đã login */}
        <Route path="/" element={isLoggedIn ? <Navigate to={user?.role === 'admin' ? '/administration' : '/dashboard'} /> : <LoginPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={isLoggedIn ? <DashboardPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/parking-access" element={isLoggedIn && user?.role === 'admin' ? <ParkingAccessPage user={user}/> : <Navigate to="/dashboard" />} />
        <Route path="/monitoring" element={isLoggedIn ? <ParkingMonitoringPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/guidance-payment" element={isLoggedIn ? <GuidancePaymentPage user={user} /> : <Navigate to="/login" />} />
        <Route
          path="/administration"
          element={isLoggedIn && user?.role === 'admin' ? <AdministrationPage user={user} /> : <Navigate to="/dashboard" />}
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
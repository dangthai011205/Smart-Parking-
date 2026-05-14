import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import OverviewCard from '../components/OverviewCard';
import RecentActivity from '../components/RecentActivity';

export default function DashboardPage({ user }) {
  const [dashboardData, setDashboardData] = useState({
    totalSlots: 0,
    occupied: 0,
    available: 0,
    revenue: 0,
    recentActivity: [],
    zones: []
  });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard');
        const data = await res.json();
        if(data.success){
          setDashboardData({
            totalSlots: data.data.totalSlots,
            occupied: data.data.occupied,
            available: data.data.available,
            revenue: data.data.revenue,
            recentActivity: data.data.recentActivity,
            zones: data.data.zones
          });
        }
      } catch(err) {
        console.error('Error fetching dashboard:', err);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-container">
      <TopNav user={user} />

      <div className="dashboard-main">
        <h2>Dashboard Overview</h2>

        <div className="overview-cards">
          <OverviewCard title="Total Slots" value={dashboardData.totalSlots} color="blue" icon="🚗" />
          <OverviewCard title="Occupied" value={dashboardData.occupied} color="orange" icon="📊" />
          <OverviewCard title="Available" value={dashboardData.available} color="green" icon="🅿️" />
          <OverviewCard title="Today's Revenue" value={`$${dashboardData.revenue}`} color="purple" icon="💵" />
        </div>

        <div className="dashboard-lower">
          <RecentActivity tickets={dashboardData.recentActivity} />

          <div className="zone-status-container">
            <h3>Zone Status</h3>
            {dashboardData.zones.filter(z => z.name !== 'C').map((zone, idx) => {
              const percent = Math.round((zone.occupied / zone.total) * 100);
              return (
                <div key={idx} className="zone-card">
                  <div className="zone-header">
                    <span className="zone-name">{zone.name}</span>
                    <span className="zone-ratio">{zone.occupied}/{zone.total}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="zone-footer">
                    <span>Occupied: {zone.occupied}</span>
                    <span>Available: {zone.total - zone.occupied}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

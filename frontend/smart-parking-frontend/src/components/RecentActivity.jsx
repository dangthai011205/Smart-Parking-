import React from 'react';
import './RecentActivity.css';

export default function RecentActivity({ tickets = [] }) {
  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <ul>
        {tickets.map((t, idx) => (
          <li key={idx}>
            <span className="vehicle">{t.vehicleNumber}</span>
            <span className="zone">{t.zone}</span>
            <span className={`status ${t.status === 'Active' ? 'entry' : 'exit'}`}>{t.status}</span>
            <span className="slot">{t.slotId ? `Slot ${t.slotId}` : 'Pending'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
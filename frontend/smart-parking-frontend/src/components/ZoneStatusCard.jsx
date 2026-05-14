import React from 'react';
import './ZoneStatusCard.css';

export default function ZoneStatusCard({ zone }) {
  const percent = (zone.available / zone.total) * 100;
  return (
    <div className="zone-status-card">
      <h4>{zone.name}</h4>
      <p>Available: {zone.available} slots</p>
      <p>Total: {zone.total} slots</p>
      <p>Distance: {zone.distance}m</p>
      <div className="progress-bg">
        <div className="progress-bar" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
import React from 'react';
import './ZoneStatus.css';

export default function ZoneStatus({ zones = [] }) {
  return (
    <div className="zone-status">
      <h3>Zone Status</h3>
      {zones.map((zone, idx) => {
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
  );
}
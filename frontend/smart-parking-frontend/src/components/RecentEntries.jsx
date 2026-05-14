import React from 'react';
import './RecentEntries.css';

export default function RecentEntries({ tickets, exitState=false, onExit }) {
  return (
    <div className={`recent-entries ${exitState ? 'exit-state' : ''}`}>
      <h3>{exitState ? 'Exit State' : 'Recent Entries'}</h3>
      <ul>
        {tickets.map(t => (
          <li key={t.id}>
            <div className="left">
              <div className="plate">{t.vehicleNumber}</div>
              <div className="details">{t.vehicleType} • {t.zone} • {t.slotId ? `Slot ${t.slotId}` : 'Pending'}</div>
            </div>
            <div className="right">
              {exitState ? (
                <button className="exit-btn" onClick={()=>onExit(t.id)}>Exit</button>
              ) : (
                <span className="status">{t.status}</span>
              )}
              <span className="time">{t.enterTime ? new Date(t.enterTime).toLocaleTimeString() : ''}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
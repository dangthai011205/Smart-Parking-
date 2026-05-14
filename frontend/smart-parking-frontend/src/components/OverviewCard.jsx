import React from 'react';
import './OverviewCard.css';

export default function OverviewCard({ title, value, subtitle, color, icon }) {
  return (
    <div className={`overview-card ${color}`}>
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="card-value">{value}</p>
      <p className="card-subtitle">{subtitle}</p>
    </div>
  );
}
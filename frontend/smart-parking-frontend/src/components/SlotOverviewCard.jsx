import React from 'react';

export default function SlotOverviewCard({ title, value, color='blue' }) {
  const colors = { blue:'#2a5cf9', red:'#e74c3c', green:'#3ac47d' };
  return (
    <div className="slot-overview-card">
      <h4>{title}</h4>
      <p style={{color: colors[color], fontWeight:600, fontSize:'1.3rem'}}>{value}</p>
    </div>
  );
}
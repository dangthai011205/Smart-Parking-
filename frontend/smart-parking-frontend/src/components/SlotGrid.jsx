import React from 'react';
import './SlotGrid.css';

export default function SlotGrid({ slots }) {
  return (
    <div className="slot-grid">
      {slots.map(slot => (
        <div
          key={slot.id}
          className="slot-box"
          style={{backgroundColor: slot.status === 'Occupied' ? '#e74c3c' : '#3ac47d'}}
        >
          {String(slot.id).padStart(2,'0')}
        </div>
      ))}
    </div>
  );
}
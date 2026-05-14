import React from 'react';

export default function ZoneTabs({ activeZone, setActiveZone }) {
  return (
    <div className="zone-tabs">
      {['A','B'].map(z => (
        <button
          key={z}
          className={activeZone===z ? 'active' : ''}
          onClick={() => setActiveZone(z)}
        >Zone {z}</button>
      ))}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import './ParkingDirectionMap.css';

export default function ParkingDirectionMap({ zones }) {
  const [nearestSlot, setNearestSlot] = useState(null);
  const [nearestZone, setNearestZone] = useState(null);

  useEffect(() => {
    if (!zones || zones.length === 0) return;

    // Find nearest zone (lowest distance) that has available slots
    const available = [...zones]
      .filter(z => z.available > 0)
      .sort((a, b) => a.distance - b.distance);

    if (available.length === 0) {
      setNearestZone(null);
      setNearestSlot(null);
      return;
    }

    const target = available[0];
    setNearestZone(target);

    // Fetch first available slot in that zone
    fetch(`http://localhost:5000/api/parking/slots?zone=${target.name}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const first = data.slots.find(s => s.status === 'Available');
          setNearestSlot(first || null);
        }
      })
      .catch(console.error);
  }, [zones]);

  const getDirectionText = (zone) => {
    if (!zone) return null;
    const steps = {
      A: 'From entrance → Go straight 50m → Zone A on your right',
      B: 'From entrance → Go straight 50m past Zone A → Continue 70m → Zone B on your right',
    };
    return steps[zone.name] || '';
  };

  return (
    <div className="direction-map-wrapper">
      <h3 className="direction-map-title">Nearest Parking Guide</h3>

      <div className="direction-map-body">
        {/* Left: visual corridor map */}
        <div className="corridor-map">
          <div className="entrance-box">
            <span className="entrance-icon">🚗</span>
            <span>Entrance</span>
          </div>

          <div className="corridor-line" />

          {zones.map((zone, idx) => (
            <React.Fragment key={zone.name}>
              <div className={`zone-node ${nearestZone?.name === zone.name ? 'zone-node--target' : ''} ${zone.available === 0 ? 'zone-node--full' : ''}`}>
                <div className="zone-node-label">Zone {zone.name}</div>
                <div className="zone-node-dist">{zone.distance}m</div>
                <div className="zone-node-avail">
                  {zone.available > 0 ? `✅ ${zone.available} available` : '🔴 Full'}
                </div>
                {nearestZone?.name === zone.name && (
                  <div className="zone-node-badge">← NEAREST</div>
                )}
              </div>
              {idx < zones.length - 1 && <div className="corridor-line" />}
            </React.Fragment>
          ))}
        </div>

        {/* Right: direction text */}
        <div className="direction-text-panel">
          {nearestZone ? (
            <>
              <div className="direction-recommended">
                <span className="dir-icon">📍</span>
                <div>
                  <div className="dir-heading">Nearest available spot</div>
                  <div className="dir-zone">Zone {nearestZone.name} — {nearestZone.distance}m away</div>
                  {nearestSlot && (
                    <div className="dir-slot">
                      Slot: <strong>{nearestZone.name}-{String(nearestSlot.id).padStart(2, '0')}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="direction-steps">
                <div className="dir-steps-heading">Directions:</div>
                {getDirectionText(nearestZone).split('→').map((step, i, arr) => (
                  <div key={i} className="dir-step">
                    <span className="dir-step-num">{i + 1}</span>
                    <span>{step.trim()}</span>
                    {i < arr.length - 1 && <span className="dir-arrow"> ↓</span>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="direction-full">
              <span>⚠️</span>
              <p>All parking zones are currently full.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

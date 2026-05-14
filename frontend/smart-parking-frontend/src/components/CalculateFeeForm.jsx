import React, { useState } from 'react';
import './CalculateFeeForm.css';

export default function CalculateFeeForm({ refreshData }) {
  const [licensePlate, setLicensePlate] = useState('');
  const [fee, setFee] = useState(0);

  const handleCalculate = async () => {
    if (!licensePlate) return alert('Enter License Plate!');
    try {
      const res = await fetch('http://localhost:5000/api/guidance/calculate-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensePlate })
      });
      const data = await res.json();
      if (data.success) {
        setFee(data.fee);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="calculate-fee-card">
      <h3>$ Calculate Parking Fee</h3>
      <input
        type="text"
        placeholder="License Plate"
        value={licensePlate}
        onChange={e => setLicensePlate(e.target.value)}
      />
      <button onClick={handleCalculate}>Calculate Fee</button>
      {fee > 0 && <p>Fee: ${fee.toFixed(2)}</p>}
    </div>
  );
}
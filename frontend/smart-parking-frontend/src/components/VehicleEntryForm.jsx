import React, { useState } from 'react';
import './VehicleEntryForm.css';

export default function VehicleEntryForm({ fetchTickets }) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [zone, setZone] = useState('A');

  const handleRegister = async () => {
    if(!vehicleNumber) return alert('Enter license plate!');
    const res = await fetch('http://localhost:5000/api/parking/enter', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body: JSON.stringify({vehicleNumber, vehicleType, zone})
    });
    const data = await res.json();
    if(data.success){
      fetchTickets();
      setVehicleNumber('');
    } else alert(data.message);
  };

  return (
    <div className="vehicle-entry-form">
      <h3>Vehicle Entry</h3>
      <input 
        type="text" 
        placeholder="License Plate" 
        value={vehicleNumber} 
        onChange={e=>setVehicleNumber(e.target.value)}
      />
      <select value={vehicleType} onChange={e=>setVehicleType(e.target.value)}>
        <option value="Car">Car</option>
        <option value="Motorcycle">Motorcycle</option>
      </select>
      <select value={zone} onChange={e=>setZone(e.target.value)}>
        <option value="A">Zone A</option>
        <option value="B">Zone B</option>
      </select>
      <button onClick={handleRegister}>✔ Register Entry</button>
    </div>
  );
}
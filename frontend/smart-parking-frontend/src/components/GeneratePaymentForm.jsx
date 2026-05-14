import React, { useState } from 'react';
import './GeneratePaymentForm.css';

export default function GeneratePaymentForm({ refreshData }) {
  const [licensePlate, setLicensePlate] = useState('');
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const handlePayment = async () => {
    if (!licensePlate || amount <= 0) return alert('License Plate or Amount invalid!');
    try {
      const res = await fetch('http://localhost:5000/api/guidance/generate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licensePlate, amount, method: paymentMethod })
      });
      const data = await res.json();
      if (data.success) {
        alert('Payment Successful!');
        setLicensePlate('');
        setAmount(0);
        refreshData(); // update zones + recent payments
      } else {
        alert('Payment Failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="generate-payment-card">
      <h3>Generate Payment</h3>
      <input
        type="text"
        placeholder="License Plate"
        value={licensePlate}
        onChange={e => setLicensePlate(e.target.value)}
      />
      <input
        type="number"
        placeholder="$0.00"
        value={amount}
        onChange={e => setAmount(parseFloat(e.target.value))}
      />
      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
        <option>Credit Card</option>
        <option>Cash</option>
      </select>
      <button onClick={handlePayment}>Process Payment</button>
    </div>
  );
}
import React from 'react';
import './RecentPayment.css';

export default function RecentPayments() {
  return (
    <div className="recent-payments">
      <h3>Recent Payments</h3>
      <ul>
        <li>ABC-1234 - $5.00 - Paid</li>
        <li>XYZ-5678 - $3.00 - Paid</li>
      </ul>
    </div>
  );
}
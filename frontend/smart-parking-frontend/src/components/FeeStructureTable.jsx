import React from 'react';
import './FeeStructureTable.css';

export default function FeeStructureTable({ feeStructure }) {
  return (
    <table className="fee-structure-table">
      <thead>
        <tr>
          <th>Vehicle Type</th>
          <th>First Hour</th>
          <th>Additional Hour</th>
          <th>Daily Max</th>
        </tr>
      </thead>
      <tbody>
        {feeStructure.map((f, idx) => (
          <tr key={idx}>
            <td>{f.type}</td>
            <td>{f.firstHour}</td>
            <td>{f.additionalHour}</td>
            <td>{f.dailyMax}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
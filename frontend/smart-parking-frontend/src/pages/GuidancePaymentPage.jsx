import React, { useEffect, useState } from 'react';
import './guidancePayment.css';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import CalculateFeeForm from '../components/CalculateFeeForm';
import GeneratePaymentForm from '../components/GeneratePaymentForm';
import FeeStructureTable from '../components/FeeStructureTable';
import RecentPayments from '../components/RecentPayment';
import ParkingDirectionMap from '../components/ParkingDirectionMap';

export default function GuidancePaymentPage({ user }) {
  // State chung để share giữa 2 form
  const [licensePlate, setLicensePlate] = useState('');
  const [fee, setFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [zones, setZones] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [feeStructure] = useState([
    { type:'Car', firstHour:'$2.00', additionalHour:'$1.50', dailyMax:'$15.00'},
    { type:'Motorcycle', firstHour:'$1.00', additionalHour:'$0.75', dailyMax:'$8.00'},
    { type:'Truck', firstHour:'$3.00', additionalHour:'$2.00', dailyMax:'$20.00'}
  ]);

  // Fetch zones và recent payments
  const fetchZones = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/guidance/zones-status');
      const data = await res.json();
      if(data.success) setZones(data.zones.filter(z => z.name !== 'C'));
    } catch(err){ console.error(err); }
  };

  const fetchRecentPayments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/guidance/recent-payments');
      const data = await res.json();
      if(data.success) setRecentPayments(data.payments);
    } catch(err){ console.error(err); }
  };

  useEffect(() => {
    fetchZones();
    fetchRecentPayments();
  }, []);

  // Calculate Fee callback
  const handleCalculateFee = async () => {
    if(!licensePlate) return alert('Enter License Plate!');
    try {
      const res = await fetch('http://localhost:5000/api/guidance/calculate-fee',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ licensePlate })
      });
      const data = await res.json();
      if(data.success){
        setFee(data.fee); // update state, auto populate Generate Payment
      } else {
        alert(data.message);
      }
    } catch(err){ console.error(err); }
  };

  // Generate Payment callback
  const handleGeneratePayment = async () => {
    if(!licensePlate || fee <=0) return alert('License Plate or Fee invalid!');
    try {
      const res = await fetch('http://localhost:5000/api/guidance/generate-payment',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ licensePlate, amount: fee, method: paymentMethod })
      });
      const data = await res.json();
      if(data.success){
        alert('Payment Successful!');
        setLicensePlate('');
        setFee(0);
        fetchZones();
        fetchRecentPayments();
      } else {
        alert('Payment Failed');
      }
    } catch(err){ console.error(err); }
  };

  return (
    <div className="guidance-payment-container">
      <TopNav user={user} />
      <div className="guidance-payment-main">
        <div className="content-wrapper">

          {/* Top Row */}
          <div className="top-row">
            <CalculateFeeForm
              licensePlate={licensePlate}
              setLicensePlate={setLicensePlate}
              fee={fee}
              handleCalculateFee={handleCalculateFee}
            />
            <GeneratePaymentForm
              licensePlate={licensePlate}
              setLicensePlate={setLicensePlate}
              fee={fee}
              setFee={setFee}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              handleGeneratePayment={handleGeneratePayment}
            />
          </div>

          {/* Direction Map */}
          <ParkingDirectionMap zones={zones} />

          {/* Bottom Row */}
          <FeeStructureTable feeStructure={feeStructure}/>
        </div>
      </div>
      <Footer />
    </div>
  );
}
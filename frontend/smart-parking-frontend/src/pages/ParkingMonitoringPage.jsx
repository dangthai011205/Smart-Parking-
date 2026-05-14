import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import ZoneTabs from '../components/ZoneTabs';
import SlotOverviewCard from '../components/SlotOverviewCard';
import SlotGrid from '../components/SlotGrid';
import './parkingMonitoring.css';

export default function ParkingMonitoringPage({ user }) {
  const [activeZone, setActiveZone] = useState('A');
  const [slotsData, setSlotsData] = useState([]);
  const [overview, setOverview] = useState({ total:0, occupied:0, available:0 });

  const fetchSlots = async (zone) => {
    try {
      const res = await fetch(`http://localhost:5000/api/parking/slots?zone=${zone}`);
      const data = await res.json();
      if(data.success){
        setSlotsData(data.slots);
        setOverview({
          total: data.total,
          occupied: data.occupied,
          available: data.available
        });
      }
    } catch(err){
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlots(activeZone);
  }, [activeZone]);

  return (
    <div className="monitoring-container">
      <TopNav user={user} />
      <div className="monitoring-main">
        <h2>Parking Monitoring</h2>
        <p>Real-time parking slot status and monitoring</p>

        <ZoneTabs activeZone={activeZone} setActiveZone={setActiveZone} />

        <div className="overview-cards">
          <SlotOverviewCard title="Total Slots" value={overview.total} color="blue" />
          <SlotOverviewCard title="Occupied" value={overview.occupied} color="red" />
          <SlotOverviewCard title="Available" value={overview.available} color="green" />
        </div>

        <div className="legend-bar">
          <span className="available">🟩 Available</span>
          <span className="occupied">🟥 Occupied</span>
        </div>

        <SlotGrid slots={slotsData} />
      </div>
      <Footer />
    </div>
  );
}
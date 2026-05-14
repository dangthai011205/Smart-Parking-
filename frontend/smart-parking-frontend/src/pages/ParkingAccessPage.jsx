import React, { useState, useEffect } from 'react';
import VehicleEntryForm from '../components/VehicleEntryForm';
import RecentEntries from '../components/RecentEntries';
import EntryExitTabs from '../components/EntryExitTabs';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import { getHistory } from '../api/parking';
import './ParkingAccessPage.css';

export default function ParkingAccessPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('entry');

  const fetchTickets = async () => {
    try {
      const res = await getHistory();
      if(res.success) setTickets(res.tickets);
    } catch(err) {
      console.error(err);
    }
  };

  const handleExitTicket = async (ticketId) => {
    try {
      const res = await fetch('http://localhost:5000/api/parking/exit', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({ticketId})
      });
      const data = await res.json();
      if(data.success) fetchTickets();
    } catch(err) { console.error(err); }
  };

  useEffect(()=>{ fetchTickets() }, []);

  // Active tickets for Entry State
  const activeTickets = tickets.filter(t => t.status === "Active");

  return (
    <div className="parking-access-container">
      <TopNav user={user} />
      <div className="parking-access-main">
        <EntryExitTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'entry' && (
          <div className="parking-access-content">
            <VehicleEntryForm fetchTickets={fetchTickets} />
            <RecentEntries tickets={activeTickets} exitState={false} onExit={handleExitTicket}/>
          </div>
        )}
        {activeTab === 'exit' && (
          <div className="parking-access-content">
            <RecentEntries tickets={activeTickets} exitState={true} onExit={handleExitTicket}/>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
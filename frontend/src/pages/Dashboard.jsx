import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

function Dashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  // FEATURE 3: Fetch Real Database Data
  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/dashboard');
      setProviders(res.data.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    }
  };

  useEffect(() => {
    // 1. Initial page load par data fetch karo
    fetchDashboardData();

    // FEATURE 4: Real-Time Dashboard Update (Using WebSocket / Socket.io)
    // Connect to the backend socket server
    const socket = io('http://localhost:8000');

    // Listen for the broadcast event from backend
    socket.on('dashboardUpdate', () => {
      console.log("Real-time update triggered! Fetching new data...");
      // Without refresh page, get data silently
      fetchDashboardData(); 
    });

    // Cleanup connection when user leaves the page
    return () => socket.disconnect();
  }, []);

  if (loading) return <h3>🔄 Loading Live Dashboard...</h3>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2> Real-Time Provider Dashboard</h2>
        <span style={{ fontSize: '14px', color: '#666' }}>Last updated automatically: {lastUpdated}</span>
      </div>
      
      <table border="1" cellPadding="12" style={{ borderCollapse: 'collapse', width: '100%', marginTop: '10px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>Provider ID</th>
            <th>Name</th>
            {/* FEATURE 3: Remaining quota */}
            <th>Remaining Quota</th>
            {/* FEATURE 3: Leads received count */}
            <th>Total Leads Received</th>
            {/* FEATURE 3: Assigned leads list */}
            <th> Assigned Leads List</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.providerId}>
              <td>{p.providerId}</td>
              <td>{p.name}</td>
              <td style={{ fontWeight: 'bold', color: p.remainingQuota === 0 ? '#e74c3c' : '#27ae60' }}>
                {p.remainingQuota} / 10
              </td>
              <td>{p.leadsReceivedCount} Leads</td>
              
              {/* Rendering the Assigned Leads List */}
              <td>
                {p.assignedLeads && p.assignedLeads.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#333' }}>
                    {p.assignedLeads.map((lead) => (
                      <li key={lead._id} style={{ marginBottom: '4px' }}>
                        <strong>{lead.name}</strong> 
                        <span style={{ color: '#7f8c8d' }}> ({lead.phone} - {lead.service})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: '#bdc3c7', fontStyle: 'italic' }}>No leads assigned yet</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
import { useState } from 'react';
import axios from 'axios';

function TestTools() {
  const [log, setLog] = useState([]);
  const [txId, setTxId] = useState('');

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  //New Feature: Seed Database via Button
  const handleSeed = async () => {
    addLog(" Seeding database with 8 providers...");
    try {
      const res = await axios.post('http://localhost:8000/api/v1/test/seed');
      addLog(res.data.message);
    } catch (error) {
      addLog(`Error: ${error.message}`);
    }
  };

  const testConcurrency = async () => {
    addLog("⏳ Generating 10 leads instantly in parallel...");
    try {
      await axios.post('http://localhost:8000/api/v1/test/bulk-leads');
      addLog(`Stress test complete! Check dashboard for fair allocation.`);
    } catch (error) {
      addLog(` Error: ${error.message}`);
    }
  };

  const testWebhook = async () => {
    if (!txId) return alert("Please enter a random Transaction ID first!");
    
    addLog(`Triggering Webhook with ID: ${txId}...`);
    try {
      const res = await axios.post('http://localhost:8000/api/v1/webhook/reset-quota', { transactionId: txId });
      if (res.data.idempotent) {
        addLog(`IDEMPOTENCY CAUGHT: This id already used. Quotas didn't change.`);
      } else {
        addLog(`SUCCESS: Payment verified! Sab Providers ka quota 10 ho gaya.`);
      }
    } catch (error) {
      addLog(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Developer Test Tools</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        
        {/* Box 1: Seed Data */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', flex: '1 1 30%' }}>
          <h3>1. Setup Database</h3>
          <p style={{ fontSize: '13px', color: '#555' }}>Test shuru karne se pehle isko dabayein. Yeh purana data clean karke 8 fresh Providers add kar dega.</p>
          <button onClick={handleSeed} style={{ padding: '10px 20px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
            Seed / Reset Database
          </button>
        </div>

        {/* Box 2: Concurrency */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', flex: '1 1 30%' }}>
          <h3>2. Concurrency Test</h3>
          <p style={{ fontSize: '13px', color: '#555' }}>Ek sath 10 form submit karega yeh check karne ke liye ki koi quota minus mein toh nahi jaa raha.</p>
          <button onClick={testConcurrency} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
            Generate 10 Leads
          </button>
        </div>

        {/* Box 3: Webhook */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', flex: '1 1 30%' }}>
          <h3>3. Payment Webhook</h3>
          <p style={{ fontSize: '13px', color: '#555' }}>Koi bhi random naam type karein (Jaise: <b>TEST-01</b>). Same naam 2 baar daal kar Idempotency check karein.</p>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input 
              value={txId} 
              onChange={(e) => setTxId(e.target.value)} 
              placeholder="e.g. TEST-01" 
              style={{ padding: '8px', width: '60%' }} 
            />
            <button onClick={testWebhook} style={{ padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '40%' }}>
              Call Webhook
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Log */}
      <div style={{ background: '#1e1e1e', color: '#00ff00', padding: '15px', height: '250px', overflowY: 'auto', fontFamily: 'monospace', borderRadius: '4px' }}>
        {log.length === 0 ? <p style={{ color: '#888' }}>Terminal is ready... Click a button above.</p> : null}
        {log.map((l, i) => <p key={i} style={{ margin: '5px 0' }}>{l}</p>)}
      </div>
    </div>
  );
}

export default TestTools;
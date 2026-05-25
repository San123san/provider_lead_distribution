import { useState } from 'react';
import axios from 'axios';

function LeadForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', service: 'Service 1' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await axios.post('http://localhost:8000/api/v1/request-service', formData);
      setStatus({ type: 'success', message: ` Success! Assigned to: ${res.data.assignedTo.join(", ")}` });
      setFormData({ name: '', phone: '', city: '', service: 'Service 1' }); // Reset form
    } catch (error) {
      setStatus({ type: 'error', message: `Error: ${error.response?.data?.message || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
      <h2>Submit Service Request</h2>
      <form onSubmit={handleSubmit}>
        <input style={inputStyle} placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input style={inputStyle} placeholder="Phone Number (10 digits)" type="number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        <input style={inputStyle} placeholder="City" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
        <select style={inputStyle} value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>
          <option value="Service 1">Service 1</option>
          <option value="Service 2">Service 2</option>
          <option value="Service 3">Service 3</option>
        </select>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
          {loading ? 'Submitting...' : 'Submit Lead'}
        </button>
      </form>

      {status.message && (
        <div style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da', color: status.type === 'success' ? '#155724' : '#721c24' }}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default LeadForm;
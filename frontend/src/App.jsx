import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LeadForm from './pages/LeadForm';
import Dashboard from './pages/Dashboard';
import TestTools from './pages/TestTools';

function App() {
  const navStyle = { padding: '15px 30px', background: '#2c3e50', display: 'flex', gap: '20px' };
  const linkStyle = { color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' };

  return (
    <BrowserRouter>
      {/* Navigation Bar */}
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>Customer Form</Link>
        <Link to="/dashboard" style={linkStyle}>Live Dashboard</Link>
        <Link to="/test-tools" style={linkStyle}>Test Tools</Link>
      </nav>
      
      {/* Page Content */}
      <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
        <Routes>
          <Route path="/" element={<LeadForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/test-tools" element={<TestTools />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
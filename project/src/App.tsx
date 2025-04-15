import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Layout from './components/Layout';

const LandingRedirect = () => {
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingRedirect />} />
      <Route path="/dashboard/*" element={
        <Layout>
          <Dashboard />
        </Layout>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Router>
);

export default App;
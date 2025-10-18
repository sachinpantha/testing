import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import WaiterDashboard from './components/WaiterDashboard';
import ChefDashboard from './components/ChefDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import SocketTest from './components/SocketTest';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <SocketTest />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/waiter" element={
              <ProtectedRoute allowedRoles={['waiter']}>
                <WaiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/chef" element={
              <ProtectedRoute allowedRoles={['chef']}>
                <ChefDashboard />
              </ProtectedRoute>
            } />
            <Route path="/receptionist" element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
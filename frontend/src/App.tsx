import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DriverPage from './pages/DriverPage';
import Navbar from './components/Navbar';
import './App.css';

import UserManagement from './pages/UserManagement';
import FleetManagement from './pages/FleetManagement';
import ReportsPage from './pages/ReportsPage';

const PrivateRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { token, user } = useAuth();
  
  if (!token) return <Navigate to="/login" />;
  
  if (roles && user && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <div className="content">{children}</div>
      <Navbar />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="mobile-container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <PrivateRoute roles={['ADMINISTRADOR']}>
                  <UserManagement />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/fleet" 
              element={
                <PrivateRoute roles={['ADMINISTRADOR', 'SUPERVISOR']}>
                  <FleetManagement />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <PrivateRoute roles={['ADMINISTRADOR', 'SUPERVISOR']}>
                  <ReportsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/driver" 
              element={
                <PrivateRoute roles={['CHOFER', 'SUPERVISOR', 'ADMINISTRADOR']}>
                  <DriverPage />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

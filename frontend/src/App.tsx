import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DriverPage from './pages/DriverPage';
import Navbar from './components/Navbar';
import UserManagement from './pages/UserManagement';
import FleetManagement from './pages/FleetManagement';
import ReportsPage from './pages/ReportsPage';
import HistoryPage from './pages/HistoryPage';
import { WifiOff } from 'lucide-react';

const PrivateRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { token, user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!token) return <Navigate to="/login" />;
  
  if (roles && user && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" />;
  }

  // Determine layout based on screen size ONLY (as requested: "que sea igual a la de los otros")
  const layoutClass = isMobile ? 'mobile' : 'desktop';

  return (
    <div className={`app-container ${layoutClass}`}>
      <Navbar layout={layoutClass} />
      <main className="main-content animate-fade">
        {!isOnline && (
          <div className="offline-indicator card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', display: 'flex', gap: '8px', padding: '10px 15px', marginBottom: '15px' }}>
            <WifiOff size={18} /> Trabajando en modo Offline - Los cambios se sincronizarán al volver la red.
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
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
            path="/history" 
            element={
              <PrivateRoute>
                <HistoryPage />
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
      </Router>
    </AuthProvider>
  );
}

export default App;

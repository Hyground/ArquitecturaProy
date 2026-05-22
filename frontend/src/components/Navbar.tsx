import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, BarChart3, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={22} />
        <span>Panel</span>
      </NavLink>

      {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERVISOR') && (
        <>
          <NavLink to="/fleet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={22} />
            <span>Flota</span>
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={22} />
            <span>Reportes</span>
          </NavLink>
        </>
      )}

      {user?.rol === 'ADMINISTRADOR' && (
        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={22} />
          <span>Usuarios</span>
        </NavLink>
      )}

      <NavLink to="/driver" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Truck size={22} />
        <span>Viajes</span>
      </NavLink>
      <button onClick={logout} className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <LogOut size={24} />
        <span>Salir</span>
      </button>
    </nav>
  );
};

export default Navbar;

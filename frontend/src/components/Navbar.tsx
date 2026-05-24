import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, BarChart3, ShieldCheck, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  layout: 'mobile' | 'desktop';
}

const Navbar: React.FC<NavbarProps> = ({ layout }) => {
  const { logout, user } = useAuth();

  const navClass = layout === 'desktop' ? 'sidebar-nav' : 'bottom-nav';

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <Icon size={layout === 'desktop' ? 20 : 22} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <nav className={navClass}>
      {layout === 'desktop' && (
        <div className="sidebar-header">
          <div className="logo-area">
            <Package color="var(--primary)" size={32} />
            <h2>Trazabilidad</h2>
          </div>
          <div className="user-info">
            <p className="user-name">{user?.nombre}</p>
            <p className="user-role">{user?.rol}</p>
          </div>
        </div>
      )}

      <div className="nav-links">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Panel" />

        {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERVISOR') && (
          <>
            <NavItem to="/fleet" icon={ShieldCheck} label="Flota" />
            <NavItem to="/reports" icon={BarChart3} label="Reportes" />
          </>
        )}

        {user?.rol === 'ADMINISTRADOR' && (
          <NavItem to="/users" icon={Users} label="Usuarios" />
        )}

        <NavItem to="/driver" icon={Truck} label="Viajes" />
      </div>

      <button onClick={logout} className="logout-btn">
        <LogOut size={20} />
        {layout === 'desktop' && <span>Cerrar Sesión</span>}
      </button>

      <style>{`
        .sidebar-nav {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 280px;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          z-index: 1000;
        }

        .sidebar-header {
          margin-bottom: 3rem;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 2rem;
        }

        .logo-area h2 {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .user-info {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
        }

        .user-name { font-weight: 700; font-size: 0.95rem; }
        .user-role { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }

        .nav-links {
          display: flex;
          flex-direction: inherit;
          gap: 8px;
          flex: 1;
        }

        .sidebar-nav .nav-item {
          flex-direction: row;
          padding: 1rem;
          border-radius: var(--radius-md);
          gap: 12px;
          font-size: 0.95rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: var(--transition);
        }

        .sidebar-nav .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .sidebar-nav .nav-item.active {
          background: var(--primary-glow);
          color: var(--primary);
        }

        .logout-btn {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem;
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.05);
          border-radius: var(--radius-md);
        }

        .bottom-nav {
          position: fixed;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: rgba(28, 33, 44, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 2rem;
          display: flex;
          justify-content: space-around;
          padding: 0.75rem;
          z-index: 1000;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .bottom-nav .nav-item {
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .bottom-nav .nav-item.active {
          color: var(--primary);
        }

        .bottom-nav .logout-btn {
          padding: 0;
          flex-direction: column;
          font-size: 0.65rem;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

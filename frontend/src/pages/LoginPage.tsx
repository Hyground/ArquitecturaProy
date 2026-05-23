import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Lock, Mail, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!correo || !contraseña) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { correo, contraseña });
      login(response.data.jwt);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-slide-up">
        <div className="login-header">
          <div className="logo-circle">
            <Package size={32} color="var(--primary)" />
          </div>
          <h2>Iniciar Sesión</h2>
          <p>Accede al panel de control logístico</p>
        </div>

        {error && (
          <div className="error-alert animate-fade">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-container">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Correo electrónico"
              value={correo} 
              onChange={(e) => setCorreo(e.target.value)} 
            />
          </div>
          <div className="input-container">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Contraseña"
              value={contraseña} 
              onChange={(e) => setContraseña(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: var(--bg-darker);
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 10000;
        }

        .login-card {
          background: var(--bg-card);
          width: 100%;
          max-width: 400px;
          padding: 2.5rem 2rem;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid var(--border);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-circle {
          width: 64px;
          height: 64px;
          background: var(--primary-glow);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .login-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .input-container {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .input-container input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.95rem;
          transition: var(--transition);
        }

        .input-container input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-glow);
          outline: none;
        }

        .login-btn {
          width: 100%;
          padding: 1rem;
          margin-top: 1rem;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/ProtectedRoute.css';

const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH || 'default_hash';

// Simple hash function for password verification
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in session
    const authToken = sessionStorage.getItem('admin_auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const hashedInput = hashPassword(password);

    if (hashedInput === ADMIN_PASSWORD_HASH) {
      sessionStorage.setItem('admin_auth', 'authenticated');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Acceso Administrativo</h2>
          <p>Ingresa la contraseña para continuar</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="password-input"
              autoFocus
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="auth-button">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="logout-bar">
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
      {children}
    </>
  );
}

export default ProtectedRoute;

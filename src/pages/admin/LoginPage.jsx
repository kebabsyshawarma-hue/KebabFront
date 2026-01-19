import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './AdminDashboard.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin'); // Redirect to dashboard after login
    } catch (err) {
      setError('Error al iniciar sesión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#ffcc00' }}>
      <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#000', border: '1px solid #ffcc00' }}>
        <h2 className={`text-center mb-4 ${styles.dashboardTitle}`}>Admin Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label text-white">Email</label>
            <input
              type="email"
              className={`form-control ${styles.formControl}`}
              id="emailInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="passwordInput" className="form-label text-white">Contraseña</label>
            <input
              type="password"
              className={`form-control ${styles.formControl}`}
              id="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="btn w-100" 
            style={{ backgroundColor: '#A52A2A', color: '#fff', border: 'none', padding: '10px', fontSize: '1.1rem' }} 
            disabled={loading}
          >
            {loading ? (
              <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Entrando...</span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

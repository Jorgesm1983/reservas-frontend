import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access');
  const nombre = localStorage.getItem('nombre');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!token) return null;

  return (
    <header>
      <nav
        className="navbar navbar-light bg-light px-3 d-flex justify-content-between align-items-center"
        style={{ minHeight: 60, borderBottom: '1px solid #eee' }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#1769aa', letterSpacing: '1px' }}>
          PistaReserva
        </div>
        <div className="d-flex align-items-center">
          <span className="me-3" style={{ fontWeight: 500 }}>
            {nombre ? `Bienvenido, ${nombre}` : ''}
          </span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>
    </header>
  );
}

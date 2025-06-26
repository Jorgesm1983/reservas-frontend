import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CommunitySelector from './CommunitySelector';
import { useCommunity } from '../context/CommunityContext';


export default function Header({ showHomeIcon = false, showLogout = false, adminHomeIcon = false, isStaff = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCommunity, setSelectedCommunity } = useCommunity();


  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Solo muestra el icono de home si no estamos en la home
  const showHome = showHomeIcon && location.pathname !== '/';
  const showAdminHome = adminHomeIcon && location.pathname !== '/admin';

  return (
    <header
      className="d-flex align-items-center justify-content-between px-3"
      style={{
        width: '100%',
        height: 56,
        background: '#fff',
        boxShadow: '0 2px 8px 0 rgba(31,38,135,0.07)',
        borderBottom: '1px solid #e6e6e6',
        position: 'relative',
        zIndex: 10
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 22, color: '#0e2340', letterSpacing: 0.5 }}>
        PistaReserva <span style={{ color: '#c6ff00', fontSize: 18 }}>●</span>
      </span>
<div className="header-actions">
  {isStaff && (
    <CommunitySelector
      selectedCommunity={selectedCommunity}
      setSelectedCommunity={setSelectedCommunity}
    />
  )}
  {showHome && (
    <button
      className="btn btn-link"
      style={{
        color: '#0e2340',
        fontSize: 22,
        background: 'none',
        border: 'none',
        lineHeight: 1,
        minWidth: 0,
        boxShadow: 'none'
      }}
      onClick={() => navigate('/')}
      aria-label="Volver al home"
      type="button"
    >
      <i className="bi bi-house-door"></i>
    </button>
  )}
  {showAdminHome && (
    <button
      className="btn btn-link"
      style={{
        color: '#0e2340',
        fontSize: 22,
        background: 'none',
        border: 'none',
        lineHeight: 1,
        minWidth: 0,
        boxShadow: 'none'
      }}
      onClick={() => navigate('/admin')}
      aria-label="Ir al panel de administración"
      type="button"
    >
      <i className="bi bi-speedometer2"></i>
    </button>
  )}
  {showLogout && (
    <button
      className="btn btn-link"
      style={{
        color: '#0e2340',
        fontSize: 22,
        background: 'none',
        border: 'none',
        lineHeight: 1,
        minWidth: 0,
        boxShadow: 'none'
      }}
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      type="button"
    >
      <i className="bi bi-box-arrow-right"></i>
    </button>
  )}
</div>

    </header>
  );
}

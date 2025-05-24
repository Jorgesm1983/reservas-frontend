import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header
      className="d-flex align-items-center justify-content-between px-3 py-2"
      style={{
        background: "#fff",
        borderBottom: "1px solid #e2e4e8",
        minHeight: 60,
        boxShadow: "0 2px 8px 0 rgba(31,38,135,0.07)",
      }}
    >
      {/* Logo PistaReserva con punto verde */}
      <span style={{
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#0e2340',
        letterSpacing: '1px',
        display: 'inline-block',
        paddingRight: 8
      }}>
        PistaReserva
        <span style={{
          display: 'inline-block',
          width: 12,
          height: 12,
          background: '#c6ff00',
          borderRadius: '50%',
          marginLeft: 4,
          marginBottom: 4
        }}></span>
      </span>
      <button
        className="btn btn-link p-0"
        title="Cerrar sesión"
        style={{ color: '#0e2340', fontSize: '1.7rem' }}
        onClick={handleLogout}
      >
        {/* Icono logout SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 8v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"/>
          <path d="M9 12h12l-3-3"/>
          <path d="M18 15l3-3"/>
        </svg>
      </button>
    </header>
  );
}

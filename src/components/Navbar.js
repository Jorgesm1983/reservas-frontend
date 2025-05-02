// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Elimina tokens y datos de usuario
    navigate('/login');   // Redirige al login
  };

  return (
    <nav className="navbar navbar-light bg-light mb-4 px-3 d-flex justify-content-between">
      <span className="navbar-brand mb-0 h1">Reserva de Pista</span>
      <button className="btn btn-outline-danger" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </nav>
  );
};

export default Navbar;

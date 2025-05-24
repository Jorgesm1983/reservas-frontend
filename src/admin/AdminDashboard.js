// src/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="container mt-4">
      <h2>Panel de administración</h2>
      <div className="d-flex flex-wrap gap-3">
        <Link to="usuarios" className="btn btn-primary">Usuarios</Link>
        <Link to="pistas" className="btn btn-primary">Pistas</Link>
        <Link to="turnos" className="btn btn-primary">Turnos</Link>
        <Link to="reservas" className="btn btn-primary">Reservas</Link>
        <Link to="viviendas" className="btn btn-primary">Viviendas</Link>
        <Link to="invitaciones" className="btn btn-primary">Invitaciones</Link>
        <Link to="invitados" className="btn btn-primary">Invitados externos</Link>
        <Link to="comunidades" className="btn btn-primary">Comunidades</Link>
      </div>
    </div>
  );
}
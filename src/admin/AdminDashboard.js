// src/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header'; // Ajusta la ruta si es necesario

export default function AdminDashboard() {
  return (
    <div style={{ background: '#f6f8fa', display: 'flex', flexDirection: 'column' }}>
      <Header showHomeIcon={true} showLogout={false} isStaff={true} />
      <div className="container py-4 flex-grow-1 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div
          className="card shadow-sm rounded-4"
          style={{
            maxWidth: 420,
            width: '100%',
            margin: '0 auto',
            padding: '2rem 1.5rem 1.5rem 1.5rem',
            boxShadow: '0 4px 20px rgba(31,38,135,0.08)',
            borderTop: '3px solid #c6ff00'
          }}
        >
          <div className="mb-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                background: '#c6ff00',
                borderRadius: 50,
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                boxShadow: '0 2px 8px rgba(198,255,0,0.13)'
              }}
            >
              <i className="bi bi-gear" style={{ color: '#0e2340', fontSize: 26 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2, letterSpacing: 0.2 }}>
              Panel de administración
            </div>
            <div style={{ color: '#7e8594', fontSize: 15, textAlign: 'center', maxWidth: 290, marginTop: 2 }}>
              Gestiona usuarios, pistas, turnos, reservas y más desde este panel.
            </div>
          </div>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link to="usuarios" className="btn btn-primary flex-grow-1" style={{ minWidth: 120 }}><i className="bi bi-people"></i> Usuarios</Link>
            <Link to="pistas" className="btn btn-primary flex-grow-1" style={{ minWidth: 120 }}><i className="bi bi-grid-3x3-gap"></i> Pistas</Link>
            <Link to="turnos" className="btn btn-primary flex-grow-1" style={{ minWidth: 120 }}><i className="bi bi-clock-history"></i> Turnos</Link>
            <Link to="reservas" className="btn btn-primary flex-grow-1" style={{ minWidth: 120 }}><i className="bi bi-calendar-check"></i> Reservas</Link>
            <Link to="viviendas" className="btn btn-primary flex-grow-1" style={{ minWidth: 120 }}><i className="bi bi-house-door"></i> Viviendas</Link>
            <Link to="invitaciones" className="btn btn-primary flex-grow-1" style={{ minWidth: 120 }}><i className="bi bi-envelope-paper"></i> Invitaciones</Link>
            <Link to="invitados-externos" className="btn btn-primary flex-grow-1" style={{ minWidth: 120 }}><i className="bi bi-person-plus"></i> Invitados externos</Link>
            <Link to="comunidades" className="btn btn-primary flex-grow-1" style={{ minWidth: 120 }}><i className="bi bi-building"></i>  Comunidades</Link>
          </div>
        </div>
      </div>

    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Avatar from 'react-avatar';

function JugadorAvatar({ nombre }) {
  return (
    <Avatar
      name={nombre}
      size={40}
      round={true}
      roundColor="white" // Fondo azul oscuro como tu paleta
      color="#0e2340"      // Fondo azul oscuro como tu paleta
      fgColor="#c6ff00"    // Iniciales en verde lima, o usa "#fff" para blanco
      maxInitials={2}
      style={{ fontWeight: 700, border: '2px solid #fff', marginRight: 8, marginBottom: 8 }}
    />
  );
}

export default function Home() {
  const nombre = localStorage.getItem('nombre');
  const isStaff = localStorage.getItem('is_staff') === 'true';

  return (
    <div style={{ background: "#f6f8fa", minHeight: "100vh" }}>
      <Header />

      <div className="container py-3" style={{ maxWidth: 480 }}>
        {/* Bienvenida */}
        <div className="mb-3">
          <span className="fw-bold" style={{ color: '#0e2340', fontSize: '1.1rem' }}>
            Hola, {nombre || 'Usuario'}!
          </span>
        </div>

        {/* Próximo partido */}
        <div className="mb-4">
          <div className="rounded shadow-sm p-3" style={{ background: '#0e2340', color: '#fff' }}>
            <div className="fw-bold mb-1">
              miércoles 28 | 19:00 a 20:30
            </div>
            <div className="mb-2" style={{ fontSize: '0.97rem' }}>
              2.5 km · Mad4Pádel Pozuelo
            </div>
            <div>
              {/* Avatares de ejemplo */}
                <JugadorAvatar nombre="Carlos García" />
                <JugadorAvatar nombre="Ana Ruiz" />
                <JugadorAvatar nombre="Pedro López" />
            </div>
          </div>
        </div>

        {/* Botones principales en cuadrícula */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <Link to="/reservar" className="btn btn-lg w-100 rounded-4 shadow-sm py-3"
              style={{ background: '#0e2340', color: '#fff', border: 'none' }}>
              Reservar Pista
            </Link>
          </div>
          <div className="col-6">
            <Link to="/mis-reservas" className="btn btn-lg w-100 rounded-4 shadow-sm py-3"
              style={{ background: '#0e2340', color: '#fff', border: 'none' }}>
              Mis Reservas
            </Link>
          </div>
          <div className="col-12">
            <Link to="/list" className="btn btn-lg w-100 rounded-4 shadow-sm py-3"
              style={{ background: '#fff', color: '#0e2340', border: '2px solid #0e2340' }}>
              Histórico de Reservas
            </Link>
          </div>
        </div>

        {/* Bloque admin solo para staff */}
        {isStaff && (
          <div className="mb-4">
            <div className="bg-light rounded shadow-sm p-3 text-center">
              <Link to="/admin" className="btn w-100 rounded-4 py-3"
                style={{ background: '#ffc107', color: '#222', fontWeight: 600 }}>
                Administración
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

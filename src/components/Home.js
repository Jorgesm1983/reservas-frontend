import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'flowbite-react';
import Header from './Header';
import { fetchMyReservations } from '../services/ApiService';

// Función para obtener iniciales
function getInitials(nombre, email) {
  if (nombre && nombre.trim()) {
    const parts = nombre.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '';
}

// Componente avatar con tooltip (Flowbite)
function AvatarInvitado({ nombre, email }) {
  const initials = getInitials(nombre, email);
  const nombreCompleto = nombre || email;
  return (
      <Tooltip
  content={<span className="font-bold">{nombreCompleto}</span>}
  trigger="click"
  placement="bottom"
  style="light"
  className="shadow-lg border border-gray-200 px-4 py-2 text-base font-semibold text-gray-900 z-50"
>
  <span className="avatar-invitado">
    {initials}
  </span>
</Tooltip>

  );
}

export default function Home() {
  const nombre = localStorage.getItem('nombre');
  const isStaff = localStorage.getItem('is_staff') === 'true';
  const [proxima, setProxima] = useState(null);
  const [invitados, setInvitados] = useState([]);

  useEffect(() => {
    async function cargarProxima() {
      const today = new Date().toISOString().slice(0, 10);
      const response = await fetchMyReservations({ date_after: today });
      const reservas = response.data;
      if (!reservas.length) {
        setProxima(null);
        setInvitados([]);
        return;
      }
      const now = new Date();
      const reservasOrdenadas = reservas
        .map(r => ({
          ...r,
          fechaHora: new Date(`${r.date}T${r.timeslot?.start_time || '00:00'}`)
        }))
        .filter(r => r.fechaHora > now)
        .sort((a, b) => a.fechaHora - b.fechaHora);

      const prox = reservasOrdenadas[0] || null;
      setProxima(prox);
      setInvitados(
        prox ? (prox.invitaciones || []).filter(inv => inv.estado === 'aceptada') : []
      );
    }
    cargarProxima();
  }, []);

  return (
    <div style={{ background: "#f6f8fa", minHeight: "100vh" }}>
      <Header />
      <div className="container py-3" style={{ maxWidth: 480 }}>
        <div className="mb-3">
          <span className="fw-bold" style={{ color: '#0e2340', fontSize: '1.1rem' }}>
            Hola, {nombre || 'Usuario'}!
          </span>
        </div>
        <div className="mb-1" style={{ fontWeight: 600, color: '#222', fontSize: '1.1rem' }}>
          Tu próximo partido...
        </div>
        {/* Próximo partido */}
        <div className="mb-4">
          <div className="rounded shadow-sm p-3" style={{ background: '#0e2340', color: '#fff' }}>
            {proxima ? (
              <>
                <div className="fw-bold mb-1">
                  {new Date(`${proxima.date}T${proxima.timeslot?.start_time || '00:00'}`).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}{" "}
                  | {proxima.timeslot
                    ? `${proxima.timeslot.start_time.slice(0, 5)} - ${proxima.timeslot.end_time.slice(0, 5)}`
                    : ''}
                </div>
                <div className="mb-2" style={{ fontSize: '0.97rem' }}>
                  {proxima.court?.direccion || ''} · {proxima.court?.name || ''}
                </div>
                <div className="d-flex justify-content-center align-items-center flex-wrap mt-2" style={{ width: '100%' }}>
                  {invitados.length > 0 ? (
                    invitados.map((inv, idx) => (
                      <AvatarInvitado
                        key={inv.id || idx}
                        nombre={inv.nombre_mostrar || inv.nombre_invitado}
                        email={inv.email}
                      />
                    ))
                  ) : (
                    <span className="text-white-50" style={{ fontSize: '1rem', marginLeft: 2 }}>
                      Sin invitados
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-white-50">No tienes partidos próximos</div>
            )}
          </div>
        </div>

        {/* Botones principales */}
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

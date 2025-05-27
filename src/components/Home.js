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
      <span
        className="avatar-invitado"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#0e2340',
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          border: '2px solid #c6ff00',
          marginRight: 16,
          marginBottom: 2,
          letterSpacing: 1,
          cursor: 'pointer'
        }}
      >
        {initials}
      </span>
    </Tooltip>
  );
}

export default function Home() {
  const [nombre, setNombre] = useState('');
  const [partidosJugadosMes, setPartidosJugadosMes] = useState(0);
  const [invitacionesPendientes, setInvitacionesPendientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tiempoPrevisto, setTiempoPrevisto] = useState('');
  const [proxima, setProxima] = useState(null);
  const [invitados, setInvitados] = useState([]);
  const [invitacionActiva, setInvitacionActiva] = useState(null);
  const [isStaff, setIsStaff] = useState(false);

  // 1. Carga datos del dashboard (nombre, partidos, invitaciones)
  useEffect(() => {
    fetch('/api/dashboard/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setNombre(data.nombre);
        setPartidosJugadosMes(data.partidos_jugados_mes);
        setInvitacionesPendientes(data.invitaciones_pendientes || []);
        setIsStaff(data.is_staff || false); // <-- Añade esta línea
      });
  }, []);

  // 2. Carga el próximo partido y calcula invitados aceptados
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

      
      // --- DEBUG: Verifica la dirección de la pista ---
    console.log("Proxima reserva:", prox);
    console.log("Dirección de la pista:", prox?.court?.direccion);
    }
    cargarProxima();
  }, []);

  // Formatea fecha (ejemplo: "miércoles 28")
  function formateaFecha(fecha) {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  }

    useEffect(() => {
  if (proxima && proxima.court && proxima.court.direccion && proxima.date && proxima.timeslot?.start_time) {
    // 1. Extrae la localidad de la dirección de la pista
    function quitarTildes(str) {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    let direccion = proxima.court.direccion;
    let localidad = quitarTildes(
      direccion.includes('-') ? direccion.split('-').pop().trim() : direccion.trim()
    );
    localidad = quitarTildes(localidad); // "Alhaurin de la Torre"
    let pais = "ES"; // Puedes hacerlo dinámico si en el futuro tienes pistas fuera de España
    const apiKey = 'f968e3da593908befb180902bbede28d'; // Sustituye por tu clave real

const urlGeo = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(localidad)},${pais}&limit=1&appid=${apiKey}`;
    fetch(urlGeo)
      .then(res => res.json())
      .then(loc => {
        if (loc && loc[0]) {
          const { lat, lon } = loc[0];
          // 3. Ahora pide el tiempo por coordenadas
          const urlWeather = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
          fetch(urlWeather)
            .then(res => res.json())
            .then(data => {
              if (data && data.list && data.list.length > 0) {
                // 4. Busca el bloque horario más cercano a la hora del partido
                const fechaPartido = `${proxima.date} ${proxima.timeslot.start_time.slice(0,5)}:00`;
                let mejorBloque = data.list.reduce((prev, curr) => {
                  return Math.abs(new Date(curr.dt_txt) - new Date(fechaPartido)) <
                         Math.abs(new Date(prev.dt_txt) - new Date(fechaPartido))
                    ? curr : prev;
                });
                setTiempoPrevisto({
                  descripcion: mejorBloque.weather[0].description,
                  temp: Math.round(mejorBloque.main.temp),
                  icon: mejorBloque.weather[0].icon
                });
              } else {
                setTiempoPrevisto(null);
              }
            });
        } else {
          setTiempoPrevisto(null);
        }
      })
      .catch(() => setTiempoPrevisto(null));
  }
}, [proxima]);

    const iconMap = {
  '01d': 'wi wi-day-sunny',
  '01n': 'wi wi-night-clear',
  '02d': 'wi wi-day-cloudy',
  '02n': 'wi wi-night-alt-cloudy',
  '03d': 'wi wi-cloud',
  '03n': 'wi wi-cloud',
  '04d': 'wi wi-cloudy',
  '04n': 'wi wi-cloudy',
  '09d': 'wi wi-showers',
  '09n': 'wi wi-showers',
  '10d': 'wi wi-day-rain',
  '10n': 'wi wi-night-alt-rain',
  '11d': 'wi wi-thunderstorm',
  '11n': 'wi wi-thunderstorm',
  '13d': 'wi wi-snow',
  '13n': 'wi wi-snow',
  '50d': 'wi wi-fog',
  '50n': 'wi wi-fog'
};

function aceptarInvitacion(id, token) {
  fetch(`/api/confirmar_invitacion/${token}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify({ aceptar: true })
  })
    .then(res => res.json())
    .then(data => {
      // Opcional: muestra un mensaje de éxito
      // Refresca las invitaciones pendientes
      recargarDashboard();
      setShowModal(false);
    });
}

function rechazarInvitacion(id, token) {
  fetch(`/api/confirmar_invitacion/${token}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify({ aceptar: false })
  })
    .then(res => res.json())
    .then(data => {
      // Opcional: muestra un mensaje de éxito
      recargarDashboard();
      setShowModal(false);
    });
}

function recargarDashboard() {
  fetch('/api/dashboard/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    }
  })
    .then(res => res.json())
    .then(data => {
      setNombre(data.nombre);
      setPartidosJugadosMes(data.partidos_jugados_mes);
      setInvitacionesPendientes(data.invitaciones_pendientes || []);
      setIsStaff(data.is_staff || false);
    });
}




  return (
    <div style={{ background: "#f6f8fa", minHeight: "100vh" }}>
      <Header />
      <div className="container py-3" style={{ maxWidth: 480 }}>
        {/* Tarjeta blanca de bienvenida */}
          <div className="card-welcome">
            <div className="card-welcome-header">
              <div>
                <span className="card-welcome-hello">Hola,</span>
                <span className="card-welcome-name"> {nombre || 'Usuario'}!</span>
              </div>
              <div className="card-welcome-stats">
                <span className="card-welcome-partidos">{partidosJugadosMes}</span>
                <span className="card-welcome-partidos-label">partidos este mes</span>
              </div>
            </div>
            <div className="card-welcome-weather">
              <span className="card-welcome-weather-label">Tiempo en tu próximo partido:</span>
              {tiempoPrevisto?.icon && (
            <i
              className={iconMap[tiempoPrevisto.icon]}
              style={{ fontSize: 28, color: '#f5c518', marginRight: 8, verticalAlign: 'middle' }}
              title={tiempoPrevisto.descripcion}
            ></i>
          )}
              <span className="card-welcome-weather-desc">
                {tiempoPrevisto?.descripcion}, {tiempoPrevisto?.temp}°C
              </span>
            </div>
            {invitacionesPendientes.length > 0 && (
              <div
                className="card-welcome-inv"
                onClick={() => {
                  setInvitacionActiva(invitacionesPendientes[0]);
                  setShowModal(true);
                }}
              >
                Tienes {invitacionesPendientes.length} invitación{invitacionesPendientes.length > 1 ? 'es' : ''} pendiente{invitacionesPendientes.length > 1 ? 's' : ''} de aceptar
              </div>
            )}
            
          </div>

          {/* Modal de invitación */}
          {showModal && invitacionActiva && (
            <div className="inv-modal-overlay">
              <div className="inv-modal-content">
                <div className="inv-modal-title">Invitación pendiente</div>
                <div className="inv-modal-row">
                  <span className="inv-modal-label">Te invita: </span>
                  <span className="inv-modal-value">
                    {invitacionActiva.reserva?.user?.nombre || invitacionActiva.reserva?.user?.email}
                  </span>
                </div>
                <div className="inv-modal-row">
                  <span className="inv-modal-label">Partido: </span>
                  <span className="inv-modal-value">
                    {formateaFecha(invitacionActiva.reserva?.date)}{" "}
                    {invitacionActiva.reserva?.timeslot?.start_time?.slice(0,5)} - {invitacionActiva.reserva?.timeslot?.end_time?.slice(0,5)}
                  </span>
                </div>
                <div className="inv-modal-row">
                  <span className="inv-modal-label">Pista: </span>
                  <span className="inv-modal-value">
                    {invitacionActiva.reserva?.court?.name}
                    {invitacionActiva.reserva?.court?.direccion
                      ? ` (${invitacionActiva.reserva?.court?.direccion})`
                      : ""}
                  </span>
                </div>
                <div className="inv-modal-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => aceptarInvitacion(invitacionActiva.id, invitacionActiva.token)}
>
                    Aceptar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => rechazarInvitacion(invitacionActiva.id, invitacionActiva.token)}
>
                    Rechazar
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}


        {/* Tarjeta azul del próximo partido */}
        <div className="mb-4">
            {proxima && (
              <div style={{
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 16,
                color: '#0e2340',
                letterSpacing: 0.1,
                textAlign: 'left'
              }}>
                Tu próximo partido...
              </div>
            )}
          <div className="rounded shadow-sm p-3" style={{ background: '#0e2340', color: '#fff' }}>
            {proxima ? (
              <>
                <div className="fw-bold mb-1">
                  <i className="bi bi-calendar-event me-2"></i>
                  {formateaFecha(proxima.date)} | {proxima.timeslot?.start_time.slice(0, 5)} - {proxima.timeslot?.end_time.slice(0, 5)}
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
            <div className="mb-2">
              <Link
                to="/admin"
                className="btn-admin-custom w-100"
                style={{ marginTop: 8 }}
              >
                <i className="bi bi-shield-lock-fill" style={{ marginRight: 8, fontSize: 20, verticalAlign: 'middle' }}></i>
                Administración
              </Link>
            </div>
          )}
      </div>
    </div>
  );
}

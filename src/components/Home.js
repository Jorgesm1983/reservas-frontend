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
function AvatarInvitado({ nombre, email, esOrganizador }) {
  const initials = getInitials(nombre, email);
  const nombreCompleto = nombre || email;
  return (
    <Tooltip
      content={<span className="font-bold">{esOrganizador ? "Organizador" : nombreCompleto}</span>}
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

          marginRight: 16,
          marginBottom: 2,
          letterSpacing: 1,
          cursor: 'pointer',
          border: esOrganizador ? '2px solid gold' : '2px solid #c6ff00',
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
  const [, setInvitados] = useState([]);
  const [invitacionActiva, setInvitacionActiva] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [proximosPartidos, setProximosPartidos] = useState([]);
  const [indiceProximo, setIndiceProximo] = useState(0);  
  const partidoActivo = proximosPartidos[indiceProximo];
  const [loading, setLoading] = useState(true);
  
  
  
  

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
const [setReloadProxima] = useState(false);
  // 2. Carga el próximo partido y calcula invitados aceptados
useEffect(() => {
  async function cargarProximos() {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const ahora = new Date();

    // 1. Carga paralela de reservas propias e invitaciones
    const [responsePropias, respInv] = await Promise.all([
      fetchMyReservations({ date_after: today }),
      fetch('/api/proximos_partidos_invitado/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
      }).then(res => res.ok ? res.json() : [])
    ]);

    // 2. Procesamiento de datos
    const propias = (responsePropias.data || []).map(r => ({ ...r, tipo: 'propia' }));
    const invitadas = (respInv || []).map(r => ({ ...r, tipo: 'invitacion' }));

    const todos = [...propias, ...invitadas]
      .filter(r => {
        const fechaHora = new Date(`${r.date}T${r.timeslot?.start_time || '00:00'}`);
        return fechaHora >= ahora;
      })
      .sort((a, b) => {
        const fechaA = new Date(`${a.date}T${a.timeslot?.start_time || '00:00'}`);
        const fechaB = new Date(`${b.date}T${b.timeslot?.start_time || '00:00'}`);
        return fechaA - fechaB;
      });

    setProximosPartidos(todos);
    setIndiceProximo(0);

    setProxima(todos[0] || null);
    setInvitados(
      todos[0]?.invitaciones?.filter(inv => inv.estado === 'aceptada') || []
    );
    setLoading(false);
  }
  cargarProximos();
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
      setReloadProxima(r => !r); // Esto forzará el useEffect de arriba
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

console.log("proximosPartidos", proximosPartidos);
console.log("indiceProximo", indiceProximo);

if (loading) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
}

  return (
    
    <div style={{ background: "#f6f8fa"}}>
      <Header showLogout={true} />
      <div className="container py-3 flex-grow-1" tyle={{ maxWidth: 480 }}>
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
              <span className="card-welcome-weather-label">Tiempo previsto:</span>
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
  {proximosPartidos.length > 0 && (
    <>
      {/* Header con flechas y título */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        width: '100%'
      }}>
        {/* Flecha izquierda */}
        {proximosPartidos.length > 1 ? (
          <button
            className="btn btn-link p-0 m-0"
            style={{
              color: '#0e2340',
              fontSize: 22,
              background: 'none',
              border: 'none',
              lineHeight: 1,
              minWidth: 0,
              boxShadow: 'none'
            }}
            onClick={() => {
              const nuevo = indiceProximo === 0 ? proximosPartidos.length - 1 : indiceProximo - 1;
              setIndiceProximo(nuevo);
              setProxima(proximosPartidos[nuevo]);
              setInvitados(proximosPartidos[nuevo]?.invitaciones?.filter(inv => inv.estado === 'aceptada') || []);
            }}
            aria-label="Partido anterior"
            type="button"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        ) : <span style={{ width: 22 }} />} {/* Espacio para alinear si solo hay un partido */}

        <span style={{
          fontWeight: 600,
          fontSize: 16,
          color: '#0e2340',
          letterSpacing: 0.1,
          textAlign: 'center',
          flex: 1
        }}>
          Tu próximo partido...
        </span>

        {/* Flecha derecha */}
        {proximosPartidos.length > 1 ? (
          <button
            className="btn btn-link p-0 m-0"
            style={{
              color: '#0e2340',
              fontSize: 22,
              background: 'none',
              border: 'none',
              lineHeight: 1,
              minWidth: 0,
              boxShadow: 'none'
            }}
            onClick={() => {
              const nuevo = indiceProximo === proximosPartidos.length - 1 ? 0 : indiceProximo + 1;
              setIndiceProximo(nuevo);
              setProxima(proximosPartidos[nuevo]);
              setInvitados(proximosPartidos[nuevo]?.invitaciones?.filter(inv => inv.estado === 'aceptada') || []);
            }}
            aria-label="Siguiente partido"
            type="button"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        ) : <span style={{ width: 22 }} />}
      </div>

      {/* Tarjeta azul */}
      <div className="rounded shadow-sm p-3" style={{ background: '#0e2340', color: '#fff' }}>
        {proximosPartidos[indiceProximo] ? (
          <>
            <div className="fw-bold mb-1">
              <i className="bi bi-calendar-event me-2"></i>
              {formateaFecha(proximosPartidos[indiceProximo].date)} | {proximosPartidos[indiceProximo].timeslot?.start_time.slice(0, 5)} - {proximosPartidos[indiceProximo].timeslot?.end_time.slice(0, 5)}
            </div>
            <div className="mb-2" style={{ fontSize: '0.97rem' }}>
              {proximosPartidos[indiceProximo].court?.direccion || ''} · {proximosPartidos[indiceProximo].court?.name || ''}
            </div>
            <div className="d-flex justify-content-center align-items-center flex-wrap mt-2" style={{ width: '100%' }}>
  {/* Avatar del organizador */}
  {partidoActivo.user && (
    <AvatarInvitado
      nombre={partidoActivo.user.nombre}
      email={partidoActivo.user.email}
      esOrganizador
    />
  )}
  {/* Avatares de invitados aceptados, excluyendo al organizador si ya está */}
  {partidoActivo.invitaciones
    ?.filter(inv => inv.estado === 'aceptada' && inv.email !== partidoActivo.user.email)
    .map((inv, idx) => (
      <AvatarInvitado
        key={inv.id || idx}
        nombre={inv.nombre_mostrar || inv.nombre_invitado}
        email={inv.email}
      />
    ))}
</div>
            {/* Línea de badges y organizador */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 10
                }}>
                  {/* Badge de invitación aceptada */}
                  {partidoActivo.tipo === 'invitacion' && (
                    <span className="badge bg-warning text-dark">Invitación aceptada</span>
                  )}
                  {/* Organizador alineado a la derecha */}
                  {partidoActivo.user && (
                    <span style={{
                      fontSize: 14,
                      color: "#ffd700",
                      fontWeight: 500,
                      marginLeft: 8,
                      marginRight: 2,
                      flex: 1,
                      textAlign: 'right'
                    }}>
                      Organizador: {partidoActivo.user.nombre || partidoActivo.user.email}
                    </span>
                  )}
                </div>
          </>
        ) : (
          <div className="text-white-50">No tienes partidos próximos</div>
        )}
      </div>
    </>
  )}
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

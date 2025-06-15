import React, { useState, useEffect, useRef} from 'react';
import Select, { components } from 'react-select';
import {
  fetchMyReservations,
  fetchUsuariosComunidad,
  invitarJugadores,
  eliminarInvitacion,
  deleteReservation,
  fetchInvitadosFrecuentes
} from '../services/ApiService';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import Header from './Header';


const ESTADOS_COLORES = {
  pendiente: 'bg-warning',
  aceptada: 'bg-success',
  rechazada: 'bg-danger'
};

const FILTERS = {
  ACTIVAS: 'activas',
  INACTIVAS: 'inactivas',
  TODAS: 'todas'
};



const Group = props => {
  const { label, options } = props.data;
  const { expandedGroups, setExpandedGroups } = props.selectProps;
  const isExpanded = expandedGroups[label];
  const isMultiUser = options && options.length > 1;
  const toggleExpand = e => {
    e.preventDefault();
    e.stopPropagation();
    if (isMultiUser && e.target.closest('.group-header')) {
      setExpandedGroups(prev => ({
        ...prev,
        [label]: !prev[label]
      }));
    }
  };
  return (
    <div>
      <div
        className="d-flex align-items-center group-header"
        style={{ cursor: isMultiUser ? 'pointer' : 'default', padding: '8px 0', paddingLeft: 12, fontWeight: 600 }}
        onClick={toggleExpand}
      >
        {isMultiUser && <span style={{ marginRight: 8, color: '#7e8594' }}>👥</span>}
        {label}
      </div>
      {(!isMultiUser || isExpanded) && props.children}
    </div>
  );
};

const Option = props => {
  const isUser = !props.data.isSingle;
  const isExterno = props.data.isExterno;
  return (
    <div style={{ paddingLeft: isUser ? 26 : 6 }}>
      <components.Option {...props}>
        {isExterno ? (
          <span role="img" aria-label="externo" style={{ marginRight: 6 }}>🌐</span>
        ) : (
          <span role="img" aria-label="usuario" style={{ marginRight: 6, color: '#0e2340' }}>👤</span>
        )}
        {props.data.label}
      </components.Option>
    </div>
  );
};

function limpiarNombre(nombreLabel, email) {
  if (!nombreLabel) return email.split('@')[0];
  const match = nombreLabel.match(/^(.+?)\s*\([^)]+\)$/);
  return match ? match[1].trim() : nombreLabel.trim();
}

function isReservaCaducada(reserva) {
  if (!reserva.date || !reserva.timeslot?.start_time) return false;
  const inicio = new Date(`${reserva.date}T${reserva.timeslot.start_time}`);
  return inicio < new Date();
}

const MultiValueRemove = props => {
  const isMobile =
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const handleRemove = e => {
    if (isMobile) {
      if (!window.confirm("¿Eliminar este usuario de la invitación?")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
    if (props.innerProps?.onMouseDown) props.innerProps.onMouseDown(e);
  };
  return (
    <components.MultiValueRemove
      {...props}
      onMouseDown={handleRemove}
      onTouchStart={handleRemove}
    >
      &times;
    </components.MultiValueRemove>
  );
};

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [, setUsuarios] = useState([]);
  const [usuariosPlanos, setUsuariosPlanos] = useState([]);
  const [invitacionesActivas, setInvitacionesActivas] = useState({});
  const [formStates, setFormStates] = useState({});
  const [showExternos, setShowExternos] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [invitadosFrecuentes, setInvitadosFrecuentes] = useState([]);
  const [nuevoInvitadoExterno, setNuevoInvitadoExterno] = useState({ email: '', nombre: '' });
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const firstDay = `${yyyy}-${mm}-01`;
  const lastDay = `${yyyy}-${mm}-${new Date(yyyy, now.getMonth() + 1, 0).getDate().toString().padStart(2, '0')}`;

  const [filter, setFilter] = useState(FILTERS.ACTIVAS);
  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(lastDay);
  const [inputReadOnly, setInputReadOnly] = useState(true);
  const selectRef = useRef();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [reservasData, usuariosResponse, invitadosResponse] = await Promise.all([
          fetchMyReservations({ user: 'me' }),
          fetchUsuariosComunidad(),
          fetchInvitadosFrecuentes()
        ]);
        setReservas(reservasData.data);
        setUsuarios(agruparUsuariosPorVivienda(usuariosResponse.data));
        setUsuariosPlanos(usuariosResponse.data);
        setInvitadosFrecuentes(invitadosResponse.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const cargarInvitadosFrecuentes = async () => {
    try {
      const response = await fetchInvitadosFrecuentes();
      setInvitadosFrecuentes(response.data);
    } catch (error) {
      console.error("Error actualizando invitados frecuentes:", error);
    }
  };

  function agruparUsuariosPorVivienda(usuarios) {
    const agrupados = usuarios.reduce((acc, usuario) => {
      const viviendaNombre = usuario.vivienda?.nombre || 'Sin vivienda';
      if (!acc[viviendaNombre]) acc[viviendaNombre] = [];
      acc[viviendaNombre].push(usuario);
      return acc;
    }, {});
    return Object.entries(agrupados).map(([vivienda, usuariosVivienda]) => {
      if (usuariosVivienda.length === 1) {
        return {
          value: usuariosVivienda[0].id,
          label: vivienda,
          displayName: vivienda,
          email: usuariosVivienda[0].email,
          isSingle: true
        };
      } else {
        return {
          label: vivienda,
          options: usuariosVivienda.map(u => ({
            value: u.id,
            label: `${u.nombre} ${u.apellido}`,
            displayName: `${vivienda} - ${u.nombre} ${u.apellido}`,
            email: u.email,
            isSingle: false
          }))
        };
      }
    });
  }

    const handleFormChange = (reservaId, field, value) => {
    setFormStates(prev => ({
      ...prev,
      [reservaId]: {
        ...prev[reservaId],
        [field]: value
      }
    }));
  };

  const handleShowExternos = (reservaId) => {
    setShowExternos(prev => {
      const next = !prev[reservaId];
      if (next) cargarInvitadosFrecuentes();
      return { ...prev, [reservaId]: next };
    });
  };

  const manejarInvitacion = async (reservaId) => {
  try {
    const { selectedUsers, invitacionesExternas } = formStates[reservaId] || {};

    // Construye el array de invitaciones a enviar
    const invitaciones = [
      ...(selectedUsers?.map(u => ({
        email: u.email,
        nombre: limpiarNombre(u.displayName || u.label, u.email)
      })) || []),
      ...(invitacionesExternas || [])
    ];

    // Obtén los emails ya invitados en la reserva actual
    const reserva = reservas.find(r => r.id === reservaId);
    const emailsYaInvitados = new Set(
      (reserva?.invitaciones || []).map(inv => inv.email?.toLowerCase())
    );

    // Filtra los que ya están invitados
    const yaInvitados = invitaciones.filter(inv => emailsYaInvitados.has(inv.email?.toLowerCase()));

    if (yaInvitados.length > 0) {
      alert(
        `Ya has invitado a: ${yaInvitados.map(i => i.nombre || i.email).join(', ')}. No puedes invitar dos veces a la misma persona.`
      );
      return;
    }

   const invitacionesValidas = invitaciones.filter(
  inv => inv.estado === "pendiente" || inv.estado === "aceptada"
);

if (invitacionesValidas.length >= 3) {
  alert("Sólo puedes invitar hasta 3 personas por reserva.");
  return;
}

    await invitarJugadores(reservaId, { invitaciones });
    const [nuevasReservas, nuevosContactos] = await Promise.all([
      fetchMyReservations({ user: 'me' }),
      fetchInvitadosFrecuentes()
    ]);
    setReservas(nuevasReservas.data);
    setInvitadosFrecuentes(nuevosContactos.data);
    setFormStates(prev => ({
      ...prev,
      [reservaId]: { selectedUsers: [], invitacionesExternas: [] }
    }));
  } catch (error) {
    console.error("Error invitando jugadores:", error.response?.data);
    alert("Error al enviar invitaciones: " + (error.response?.data?.error || "Intente nuevamente"));
  }
};


  const handleEliminarInvitacion = async (invitacionId, reservaId) => {
    try {
      await eliminarInvitacion(invitacionId);
      const nuevasReservas = await fetchMyReservations({ user: 'me' });
      setReservas(nuevasReservas.data);
    } catch (error) {
      console.error("Error eliminando invitación:", error);
      alert("No se pudo eliminar la invitación");
    }
  };

  const handleEliminarReserva = async (reservaId) => {
    if (window.confirm("¿Seguro que quieres eliminar esta reserva?")) {
      try {
        await deleteReservation(reservaId);
        setReservas(prev => prev.filter(r => r.id !== reservaId));
      } catch (error) {
        alert("No se pudo eliminar la reserva");
        console.error(error);
      }
    }
  };

  const filtrarReservas = () => {
    let filtradas = [...reservas];
    if (filter === FILTERS.ACTIVAS) {
      filtradas = filtradas.filter(r => !isReservaCaducada(r));
    } else if (filter === FILTERS.INACTIVAS) {
      filtradas = filtradas.filter(r => isReservaCaducada(r));
    }
    if (dateFrom) {
      filtradas = filtradas.filter(r => !isBefore(parseISO(r.date), parseISO(dateFrom)));
    }
    if (dateTo) {
      filtradas = filtradas.filter(r => !isAfter(parseISO(r.date), parseISO(dateTo)));
    }
    return filtradas;
  };

  const reservasFiltradas = filtrarReservas();

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }





  
  return (
    <div style={{background: '#f6f8fa' }}>
      <Header showHomeIcon={true} showLogout={false} />
      <div className="container py-3 flex-grow-1" style={{ flex: 1, maxWidth: 480 }}>
        <div
          className="card-welcome mb-4"
          style={{
            maxWidth: 420,
            margin: "0 auto",
            padding: "1.5rem 1.2rem 1.2rem 1.2rem",
            boxShadow: "0 4px 20px rgba(31,38,135,0.08)",
            borderTop: "3px solid #c6ff00"
          }}
        >
          <div
            className="card-reserva-header"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 18
            }}
          >
            <div
              style={{
                background: '#c6ff00',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                boxShadow: '0 2px 8px rgba(198,255,0,0.13)'
              }}
            >
              <i className="bi bi-calendar-check" style={{ color: '#0e2340', fontSize: 26 }}></i>
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: '#0e2340',
                marginBottom: 2,
                letterSpacing: 0.2
              }}
            >
              Mis Reservas
            </div>
            <div
              style={{
                color: "#7e8594",
                fontSize: 15,
                textAlign: 'center',
                maxWidth: 290,
                marginTop: 2
              }}
            >
              Consulta y gestiona tus reservas activas y pasadas.
            </div>
          </div>
          {/* Filtros toggle */}
          <div className="mb-3">
            <div style={{ fontWeight: 600, fontSize: 15, color: "#0e2340", marginBottom: 6 }}>
              Filtra tus reservas:
            </div>
            <div className="btn-group w-100 mb-2" role="group" aria-label="Filtro de reservas">
              <button
                className={`btn btn-toggle-tab${filter === FILTERS.ACTIVAS ? ' active' : ''}`}
                onClick={() => setFilter(FILTERS.ACTIVAS)}
                type="button"
              >
                Activas
              </button>
              <button
                className={`btn btn-toggle-tab${filter === FILTERS.INACTIVAS ? ' active' : ''}`}
                onClick={() => setFilter(FILTERS.INACTIVAS)}
                type="button"
              >
                Pasadas
              </button>
              <button
                className={`btn btn-toggle-tab${filter === FILTERS.TODAS ? ' active' : ''}`}
                onClick={() => setFilter(FILTERS.TODAS)}
                type="button"
              >
                Todas
              </button>
            </div>
            {/* <div style={{ fontSize: 13, color: '#7e8594', marginBottom: 6 }}>
              Elige el tipo de reservas que quieres ver
            </div> */}
            {/* <div style={{ fontSize: 13, color: '#0e2340', marginBottom: 4 }}>
              Filtrar por fechas:
            </div> */}
            <div className="d-flex flex-column flex-md-row gap-2">
              <div style={{ flex: 1 }}>
                <label htmlFor="dateFrom" style={{ fontSize: 13, color: '#7e8594', marginBottom: 2, display: 'block' }}>Desde</label>
                <input
                  id="dateFrom"
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  style={{ borderRadius: 10, width: "100%" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="dateTo" style={{ fontSize: 13, color: '#7e8594', marginBottom: 2, display: 'block' }}>Hasta</label>
                <input
                  id="dateTo"
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  style={{ borderRadius: 10, width: "100%" }}
                />
              </div>
            </div>
          </div>
          {reservasFiltradas.length === 0 ? (
            <div className="alert alert-info mt-4">
              {filter === FILTERS.ACTIVAS
                ? "No tienes reservas activas actualmente"
                : filter === FILTERS.INACTIVAS
                  ? "No tienes reservas pasadas en este rango"
                  : "No tienes reservas en este rango"}
            </div>
          ) : (
            reservasFiltradas.map(reserva => {
              const caducada = isReservaCaducada(reserva);
              const total = reserva.invitaciones?.length || 0;
              const aceptadas = reserva.invitaciones?.filter(i => i.estado === 'aceptada').length || 0;

                // BLOQUE DE FILTRADO: ponlo aquí, dentro del map y antes del <Select />
// Normaliza emails de usuarios internos
const emailsUsuariosComunidad = usuariosPlanos
  .map(u => u.email && u.email.trim().toLowerCase())
  .filter(Boolean);

console.log("usuariosPlanos:", usuariosPlanos);
console.log("emailsUsuariosComunidad:", emailsUsuariosComunidad);

// Normaliza emails de invitados ya invitados a la reserva
const emailsInvitados = new Set(
  (reserva.invitaciones || [])
    .map(inv => inv.email && inv.email.trim().toLowerCase())
    .filter(Boolean)
);

console.log("reserva.invitaciones:", reserva.invitaciones);
console.log("emailsInvitados:", [...emailsInvitados]);

// Filtra invitados externos frecuentes que NO son usuarios internos
const invitadosExternosFrecuentes = invitadosFrecuentes.filter(invitado => {
  const email = invitado.email && invitado.email.trim().toLowerCase();
  const esExterno = email && !emailsUsuariosComunidad.includes(email);
  if (!esExterno) {
    console.log(`Filtrado como interno: ${invitado.email} (${invitado.nombre_invitado})`);
  }
  return esExterno;
});

console.log("invitadosExternosFrecuentes:", invitadosExternosFrecuentes);

// Filtra los que ya han sido invitados a esta reserva
const invitadosExternosFrecuentesFiltrados = invitadosExternosFrecuentes.filter(invitado => {
  const email = invitado.email && invitado.email.trim().toLowerCase();
  const noYaInvitado = email && !emailsInvitados.has(email);
  if (!noYaInvitado) {
    console.log(`Ya invitado a esta reserva: ${invitado.email} (${invitado.nombre_invitado})`);
  }
  return noYaInvitado;
});

console.log("invitadosExternosFrecuentesFiltrados:", invitadosExternosFrecuentesFiltrados);

// Filtra y agrupa usuarios internos no invitados aún
const usuariosPlanosFiltrados = usuariosPlanos.filter(u => {
  const email = u.email && u.email.trim().toLowerCase();
  return email && !emailsInvitados.has(email);
});
const usuariosAgrupados = agruparUsuariosPorVivienda(usuariosPlanosFiltrados);

console.log("usuariosPlanosFiltrados:", usuariosPlanosFiltrados);
console.log("usuariosAgrupados:", usuariosAgrupados);

// Opciones para el <Select />
const opcionesCombinadas = [
  ...usuariosAgrupados,
  {
    label: "Invitados externos frecuentes",
    options: invitadosExternosFrecuentesFiltrados.map(ie => ({
      value: ie.email,
      label: `${ie.nombre_invitado} (${ie.email})`,
      displayName: `${ie.nombre_invitado} (${ie.email})`,
      isExterno: true,
      email: ie.email,
      nombre: ie.nombre_invitado
    }))
  }
];

console.log("opcionesCombinadas:", opcionesCombinadas);
              return (
                <div
  key={reserva.id}
  className="card mb-4"
  style={{
    border: '2.5px solid #0e2340',
    borderRadius: 18,
    boxShadow: '0 6px 24px rgba(31,38,135,0.09)',
    background: '#fff',
    padding: 0,
    overflow: 'hidden'
  }}
>
  {/* Cabecera: título y botones arriba */}
<div className="card-header d-flex justify-content-between align-items-center" style={{ gap: 8 }}>
  <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
    <div style={{ fontWeight: 600, color: '#0e2340', fontSize: 16, lineHeight: 1.2 }}>
      {reserva.court?.name || ''} · {reserva.court?.comunidad_direccion || ''}
    </div>
    <div style={{ color: '#7e8594', fontSize: 15, marginTop: 2 }}>
      {format(new Date(reserva.date), 'dd/MM/yyyy')}
      {reserva.timeslot && (
        <span className="ms-2">
          {reserva.timeslot.start_time?.slice(0, 5)} - {reserva.timeslot.end_time?.slice(0, 5)}
        </span>
      )}
    </div>
  </div>
  {/* Bloque derecho: botón eliminar arriba, badge abajo */}
<div className="d-flex flex-column align-items-end gap-2">
  <button
    className="btn btn-danger btn-sm"
    style={{ minWidth: 110, minHeight: 38, fontWeight: 600, borderRadius: 8 }}
    onClick={() => handleEliminarReserva(reserva.id)}
    disabled={caducada}
    title={caducada ? "No puedes eliminar reservas pasadas" : "Eliminar"}
  >
    Eliminar
  </button>
  <button
    type="button"
    className="btn btn-info btn-sm"
    style={{ minWidth: 110, minHeight: 38, fontWeight: 600, borderRadius: 8 }}
    onClick={() => setInvitacionesActivas(prev => ({
      ...prev,
      [reserva.id]: !prev[reserva.id]
    }))}
    tabIndex={0}
    aria-pressed={!!invitacionesActivas[reserva.id]}

  >
    {total === 0 ? 'Sin invitados' : total === 1 ? '1 invitado' : `${total} invitados`}
    </button>
    {aceptadas > 0 && (
      <span className="badge badge-fixed-width bg-success ms-2" style={{ fontWeight: 600 }}>
        {aceptadas} {aceptadas === 1 ? 'aceptado' : 'aceptados'}
      </span>
    )}
  </div>
</div>




                  <div
                    className={`transition-invitaciones ${invitacionesActivas[reserva.id] ? 'open' : ''}`}
                    style={{
                      overflow: 'hidden',
                      transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                      maxHeight: invitacionesActivas[reserva.id] ? 800 : 0,
                      opacity: invitacionesActivas[reserva.id] ? 1 : 0
                    }}
                  >
                    {invitacionesActivas[reserva.id] && (
                      <div className="card-body">
                        {caducada ? (
                          <>
                            <div className="alert alert-warning">
                              Esta reserva ya ha pasado. Solo puedes consultar los invitados.
                            </div>
                            <div className="mt-3">
                              <h6>Invitaciones actuales:</h6>
                              <ul className="list-group">
                                {[...new Map((reserva.invitaciones || []).map(inv => [inv.email, inv])).values()].map(invitacion => {
                                  let displayText = invitacion.nombre || invitacion.displayName || invitacion.label || invitacion.email;

                                  if (invitacion.invitado) {
                                    const usuario = usuariosPlanos.find(u => u.id === invitacion.invitado);
                                    if (usuario) {
                                      const viviendaUsuarios = usuariosPlanos.filter(
                                        u => u.vivienda?.nombre === usuario.vivienda?.nombre
                                      );
                                      if (viviendaUsuarios.length === 1) {
                                        displayText = usuario.vivienda?.nombre || usuario.nombre || usuario.email;
                                      } else {
                                        displayText = `${usuario.vivienda?.nombre || ''} - ${usuario.nombre} ${usuario.apellido}`;
                                      }
                                    }
                                  } else if (invitacion.nombre_invitado) {
                                    displayText = `${invitacion.nombre_invitado}`;
                                  }
                                  return (
<li className="list-group-item d-flex justify-content-between align-items-center" style={{ gap: 8, minWidth: 0 }}>
  <div style={{ flex: 1, minWidth: 0 }}>
    <div
      className="text-truncate"
      style={{
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 120, // Ajusta este valor según el espacio disponible
        display: 'block'
      }}
      title={displayText}
    >
      {displayText}
    </div>
    <span className={`badge ${ESTADOS_COLORES[invitacion.estado]} mt-2`}>
      {invitacion.estado}
    </span>
  </div>
  {!caducada && invitacion.estado === 'pendiente' && (
    <button
      className="btn btn-danger btn-sm ms-3"
      onClick={() => handleEliminarInvitacion(invitacion.id, reserva.id)}
      title="Eliminar invitación"
      style={{
        minWidth: 90,
        maxWidth: 110,
        width: 110,
        flexShrink: 0,
        whiteSpace: 'nowrap'
      }}
    >
      Eliminar
    </button>
  )}
</li>
                                 );
                                })}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="btn-group w-100 mb-3" role="group" aria-label="Selector de tipo de invitación">
                              <button
                                type="button"
                                className={`btn btn-toggle-tab${!showExternos[reserva.id] ? ' active' : ''}`}
                                onClick={() => handleShowExternos(reserva.id)}
                              >
                                Invitar usuarios
                              </button>
                              <button
                                type="button"
                                className={`btn btn-toggle-tab${showExternos[reserva.id] ? ' active' : ''}`}
                                onClick={() => handleShowExternos(reserva.id)}
                              >
                                Invitar externos
                              </button>
                            </div>
                            {showExternos[reserva.id] ? (
                              <div className="mb-2">
                                <input
                                  type="email"
                                  className="form-control mb-2"
                                  placeholder="Email del invitado externo"
                                  value={nuevoInvitadoExterno.email}
                                  onChange={e => setNuevoInvitadoExterno({ ...nuevoInvitadoExterno, email: e.target.value })}
                                  autoComplete="off"
                                />
                                <input
                                  type="text"
                                  className="form-control mb-2"
                                  placeholder="Nombre completo"
                                  value={nuevoInvitadoExterno.nombre}
                                  onChange={e => setNuevoInvitadoExterno({ ...nuevoInvitadoExterno, nombre: e.target.value })}
                                  autoComplete="off"
                                />
                                <button
                                  className="btn btn-success w-100"
                                  style={{
                                    background: '#c6ff00',
                                    color: '#0e2340',
                                    fontWeight: 700,
                                    borderRadius: 8,
                                    border: 'none',
                                    minHeight: 38,
                                    fontSize: 16
                                  }}
                                  onClick={() => {
                                    if (!nuevoInvitadoExterno.email || !nuevoInvitadoExterno.nombre) return;
                                    const yaExiste = (formStates[reserva.id]?.invitacionesExternas || []).some(
                                      inv => inv.email === nuevoInvitadoExterno.email
                                    );
                                    if (!yaExiste) {
                                      handleFormChange(reserva.id, 'invitacionesExternas', [
                                        ...(formStates[reserva.id]?.invitacionesExternas || []),
                                        nuevoInvitadoExterno
                                      ]);
                                    }
                                    setNuevoInvitadoExterno({ email: '', nombre: '' });
                                  }}
                                >
                                  Añadir
                                </button>
                              </div>
                            ) : (
                              <div style={{ position: "relative" }} key={reserva.id}>
                              <Select
                                isSearchable={false}
                                inputProps={{ readOnly: true }}
                                ref={selectRef}
                               
                                onMenuOpen={() => setInputReadOnly(true)}
                                options={opcionesCombinadas}
                                isMulti
                                closeMenuOnSelect={false}
                                blurInputOnSelect={false}
                                getOptionLabel={opt => opt.displayName || opt.label || opt.email}
                                getOptionValue={opt => opt.value || opt.email}
                                components={{
                                  Group,
                                  Option,
                                  MultiValueLabel: props => (
                                    <components.MultiValueLabel {...props}>
                                      {props.data.displayName || props.data.label}
                                    </components.MultiValueLabel>
                                  ),
                                  MultiValueRemove,
                                  ClearIndicator: () => null // <-- Esto elimina la X del input
                                }}
                                value={formStates[reserva.id]?.selectedUsers || []}
                                onChange={selected => handleFormChange(reserva.id, 'selectedUsers', selected || [])}
                                placeholder="Buscar por vivienda o invitados externos frecuentes..."
                                noOptionsMessage={() => "No hay usuarios disponibles"}
                                expandedGroups={expandedGroups}
                                setExpandedGroups={setExpandedGroups}
                                menuPortalTarget={document.body}
                                styles={{
                                  option: (provided, state) => ({
                                    ...provided,
                                    paddingLeft: state.data.isSingle === false ? 24 : 6
                                  })
                                }}
                              />
                                {inputReadOnly && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: 0,
                                      right: 0,
                                      top: 0,
                                      bottom: 0,
                                      zIndex: 10,
                                      cursor: "text"
                                    }}
                                    onTouchStart={() => {
                                      setInputReadOnly(false);
                                      setTimeout(() => {
                                        if (selectRef.current?.select?.inputRef) {
                                          selectRef.current.select.inputRef.focus();
                                        }
                                      }, 100);
                                    }}
                                    onClick={() => {
                                      setInputReadOnly(false);
                                      setTimeout(() => {
                                        if (selectRef.current?.select?.inputRef) {
                                          selectRef.current.select.inputRef.focus();
                                        }
                                      }, 100);
                                    }}
                                  />
                                )}
                                </div>                
            )}
                            {(formStates[reserva.id]?.invitacionesExternas || []).length > 0 && (
                              <div className="mb-3">
                                <ul className="list-group">
                                  {formStates[reserva.id].invitacionesExternas.map((inv, idx) => (
                                    <li
                                      key={idx}
                                      className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                      <span>
                                        <strong>{inv.nombre}</strong>
                                        <span className="text-muted ms-2">({inv.email})</span>
                                      </span>
                                      <button
                                        className="btn btn-link btn-sm text-danger"
                                        style={{ textDecoration: 'none' }}
                                        onClick={() => {
                                          handleFormChange(
                                            reserva.id,
                                            'invitacionesExternas',
                                            formStates[reserva.id].invitacionesExternas.filter((_, i) => i !== idx)
                                          );
                                        }}
                                        title="Eliminar invitado externo"
                                      >
                                        <i className="bi bi-x-circle" style={{ fontSize: '1.3em' }}></i>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <button
                              className="btn btn-success w-100 mt-2"
                              style={{ fontWeight: 700, fontSize: 17, borderRadius: 10, background: '#c6ff00', color: '#0e2340', border: 'none' }}
                              onClick={() => manejarInvitacion(reserva.id)}
                              disabled={
                                ((formStates[reserva.id]?.selectedUsers?.length || 0) +
                                  (formStates[reserva.id]?.invitacionesExternas?.length || 0)) > 3
                              }
                            ><i className="bi bi-person-plus"> </i>
                              Invitar (
                              {(formStates[reserva.id]?.selectedUsers?.length || 0) +
                                (formStates[reserva.id]?.invitacionesExternas?.length || 0)}
                              /3)
                            </button>
                            <div className="mt-3">
                              <h6>Invitaciones actuales:</h6>
                              <ul className="list-group">
                                    {[...new Map((reserva.invitaciones || []).map(inv => [inv.email, inv])).values()].map(invitacion => {
                                                                      let displayText = invitacion.nombre || invitacion.displayName || invitacion.label || invitacion.email;

                                                                      if (invitacion.invitado) {
                                                                        const usuario = usuariosPlanos.find(u => u.id === invitacion.invitado);
                                                                        if (usuario) {
                                                                          const viviendaUsuarios = usuariosPlanos.filter(
                                                                            u => u.vivienda?.nombre === usuario.vivienda?.nombre
                                                                          );
                                                                          if (viviendaUsuarios.length === 1) {
                                                                            displayText = usuario.vivienda?.nombre || usuario.nombre || usuario.email;
                                                                          } else {
                                                                            displayText = `${usuario.vivienda?.nombre || ''} - ${usuario.nombre} ${usuario.apellido}`;
                                                                          }
                                                                        }
                                                                      } else if (invitacion.nombre_invitado) {
                                                                        displayText = `${invitacion.nombre_invitado}`;
                                                                      }

        // ...
    return (
<li key={invitacion.id} className="list-group-item d-flex justify-content-between align-items-center" >
  <div style={{ flex: 1, minWidth: 0 }}>
    <div
      className="text-truncate"
      style={{
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 120,
        display: 'block'
      }}
      title={displayText}
    >
      {displayText}
    </div>
    <span className={`badge ${ESTADOS_COLORES[invitacion.estado]} mt-2`}>
      {invitacion.estado}
    </span>
  </div>
  {!caducada && invitacion.estado === 'pendiente' && (
    <button
      className="btn btn-danger btn-sm ms-3"
      onClick={() => handleEliminarInvitacion(invitacion.id, reserva.id)}
      title="Eliminar invitación"
      style={{ minWidth: 90 }}
    >
      Eliminar
    </button>
  )}
</li>


//       <li className="list-group-item d-flex justify-content-between align-items-center" style={{ gap: 8, minWidth: 0 }}>
//   <div style={{ flex: 1, minWidth: 0 }}>
//     <div
//       className="text-truncate"
//       style={{
//         fontWeight: 600,
//         whiteSpace: 'nowrap',
//         overflow: 'hidden',
//         textOverflow: 'ellipsis',
//         maxWidth: 120, // Ajusta este valor según el espacio disponible
//         display: 'block'
//       }}
//       title={displayText}
//     >
//       {displayText}
//     </div>
//     <span className={`badge ${ESTADOS_COLORES[invitacion.estado]} mt-2`}>
//       {invitacion.estado}
//     </span>
//   </div>
//   {!caducada && invitacion.estado === 'pendiente' && (
//     <button
//       className="btn btn-danger btn-sm ms-3"
//       onClick={() => handleEliminarInvitacion(invitacion.id, reserva.id)}
//       title="Eliminar invitación"
//       style={{
//         minWidth: 90,
//         maxWidth: 110,
//         width: 110,
//         flexShrink: 0,
//         whiteSpace: 'nowrap'
//       }}
//     >
//       Eliminar
//     </button>
//   )}
// </li>
    );
  })}
</ul>

                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

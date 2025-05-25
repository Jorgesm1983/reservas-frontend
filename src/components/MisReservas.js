import React, { useState, useEffect } from 'react';
import ReactSelect, { components } from 'react-select';
import {
  fetchMyReservations,
  fetchUsuariosComunidad,
  invitarJugadores,
  eliminarInvitacion,
  deleteReservation,
  fetchInvitadosFrecuentes
} from '../services/ApiService';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

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
        style={{ cursor: isMultiUser ? 'pointer' : 'default', padding: '8px 0', paddingLeft: 12 }}
        onClick={toggleExpand}
      >
        <div className="fw-bold">{label}</div>
      </div>
      {(!isMultiUser || isExpanded) && props.children}
    </div>
  );
};

function limpiarNombre(nombreLabel, email) {
  if (!nombreLabel) return email.split('@')[0];
  // Si el label es "Sonia (Sonia@jerez.com)", extrae solo "Sonia"
  const match = nombreLabel.match(/^(.+?)\s*\([^)]+\)$/);
  return match ? match[1].trim() : nombreLabel.trim();
}

const Option = props => {
  const isUser = !props.data.isSingle;
  return (
    <div style={{ paddingLeft: isUser ? 24 : 0 }}>
      <components.Option {...props} />
    </div>
  );
};

function isReservaCaducada(reserva) {
  if (!reserva.date || !reserva.timeslot?.start_time) return false;
  const inicio = new Date(`${reserva.date}T${reserva.timeslot.start_time}`);
  return inicio < new Date();
}


export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosPlanos, setUsuariosPlanos] = useState([]);
  const [invitacionesActivas, setInvitacionesActivas] = useState({});
  const [formStates, setFormStates] = useState({});
  const [showExternos, setShowExternos] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [invitadosFrecuentes, setInvitadosFrecuentes] = useState([]);
  const [nuevoInvitadoExterno, setNuevoInvitadoExterno] = useState({ email: '', nombre: '' });

  // Filtros
  const [filter, setFilter] = useState(FILTERS.ACTIVAS);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  const agruparUsuariosPorVivienda = (usuarios) => {
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
  };

  // Filtra invitados externos frecuentes para excluir usuarios de la comunidad
  const opcionesCombinadas = [
    ...usuarios,
    {
      label: "Invitados externos frecuentes",
      options: invitadosFrecuentes
        .filter(invitado => {
          const emailsUsuariosComunidad = usuariosPlanos.map(u => u.email);
          return !emailsUsuariosComunidad.includes(invitado.email);
        })
        .map(ie => ({
          value: ie.email,
          label: `${ie.nombre_invitado} (${ie.email})`,
          displayName: `${ie.nombre_invitado} (${ie.email})`,
          isExterno: true,
          email: ie.email,
          nombre: ie.nombre_invitado
        }))
    }
  ];

  const handleFormChange = (reservaId, field, value) => {
    setFormStates(prev => ({
      ...prev,
      [reservaId]: {
        ...prev[reservaId],
        [field]: value
      }
    }));
  };

  // Al alternar el selector de externos, recarga la lista si se va a mostrar
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
    const invitaciones = [
      ...(selectedUsers?.map(u => ({
        email: u.email,
        nombre: limpiarNombre(u.displayName || u.label, u.email)
      })) || []),
      ...(invitacionesExternas || [])
    ];
    if (invitaciones.length > 3) {
      alert("Sólo puedes invitar hasta 3 personas por reserva.");
      return;
    }
    await invitarJugadores(reservaId, { invitaciones });
    // Refresca reservas y contactos externos tras invitar
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
    // Refresca reservas desde la API para tener datos consistentes y evitar duplicados
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

  // --- FILTRADO ---
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
    <div className="container">
      {/* Filtros */}
      <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
        <div>
          <label className="form-label mb-0 me-2">Mostrar:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value={FILTERS.ACTIVAS}>Reservas activas</option>
            <option value={FILTERS.INACTIVAS}>Reservas inactivas</option>
            <option value={FILTERS.TODAS}>Todas las reservas</option>
          </select>
        </div>
        <div>
          <label className="form-label mb-0 me-2">Desde:</label>
          <input
            type="date"
            className="form-control d-inline-block w-auto"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label mb-0 me-2">Hasta:</label>
          <input
            type="date"
            className="form-control d-inline-block w-auto"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {reservasFiltradas.length === 0 ? (
        <div className="alert alert-info mt-4">
          {filter === FILTERS.ACTIVAS
            ? "No tienes reservas activas actualmente"
            : filter === FILTERS.INACTIVAS
            ? "No tienes reservas inactivas en este rango"
            : "No tienes reservas en este rango"}
        </div>
      ) : (
        reservasFiltradas.map(reserva => {
          const caducada = isReservaCaducada(reserva);
          return (
            <div key={reserva.id} className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  {reserva.court?.name} - {format(new Date(reserva.date), 'dd/MM/yyyy')}
                  {reserva.timeslot && (
                    <span className="ms-2 text-muted">
                      {reserva.timeslot.start_time?.slice(0,5)} - {reserva.timeslot.end_time?.slice(0,5)}
                    </span>
                  )}
                  <span className="ms-3">
                    {(() => {
                      const total = reserva.invitaciones?.length || 0;
                      const aceptadas = reserva.invitaciones?.filter(i => i.estado === 'aceptada').length || 0;
                      if (total === 0) return <span className="badge bg-secondary">Sin invitados</span>;
                      if (total === 1) return (
                        <span>
                          <span className="badge bg-info">1 invitado</span>
                          {aceptadas > 0 && <span className="badge bg-success ms-2">{aceptadas} aceptado</span>}
                        </span>
                      );
                      if (total > 1) return (
                        <span>
                          <span className="badge bg-info">{total} invitados</span>
                          {aceptadas > 0 && <span className="badge bg-success ms-2">{aceptadas} aceptados</span>}
                        </span>
                      );
                      return null;
                    })()}
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleEliminarReserva(reserva.id)}
                    disabled={caducada}
                    title={caducada ? "No puedes eliminar reservas pasadas" : "Eliminar"}
                  >
                    Eliminar
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setInvitacionesActivas(prev => ({
                      ...prev,
                      [reserva.id]: !prev[reserva.id]
                    }))}
                  >
                    {invitacionesActivas[reserva.id] ? 'Ocultar' : 'Gestionar invitaciones'}
                  </button>
                </div>
              </div>
              
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
    let displayText = invitacion.email;
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
      displayText = `${invitacion.nombre_invitado} (${invitacion.email})`;
    }
    return (
      <li key={invitacion.id} className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{displayText}</strong>
          <span className={`badge ${ESTADOS_COLORES[invitacion.estado]} ms-3`}>
            {invitacion.estado}
          </span>
        </div>
        {!caducada && invitacion.estado === 'pendiente' && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleEliminarInvitacion(invitacion.id, reserva.id)}
            title="Eliminar invitación"
          >
            Eliminar
          </button>
        )}
      </li>
    );
  })}
</ul>

Sustituye por este bloque (único cambio):
jsx
<ul className="list-group">
  {[...new Map((reserva.invitaciones || []).map(inv => [inv.email, inv])).values()].map(invitacion => {
    let displayText = invitacion.email;
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
      <li key={invitacion.id} className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{displayText}</strong>
          <span className={`badge ${ESTADOS_COLORES[invitacion.estado]} ms-3`}>
            {invitacion.estado}
          </span>
        </div>
        {!caducada && invitacion.estado === 'pendiente' && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleEliminarInvitacion(invitacion.id, reserva.id)}
            title="Eliminar invitación"
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
                      <div className="mb-3">
                        <button
                          className={`btn ${!showExternos[reserva.id] ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                          onClick={() => {
                            handleShowExternos(reserva.id);
                          }}
                        >
                          Invitar usuarios
                        </button>
                        <button
                          className={`btn ${showExternos[reserva.id] ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => {
                            handleShowExternos(reserva.id);
                          }}
                        >
                          Invitar externos
                        </button>
                      </div>

                      {!showExternos[reserva.id] ? (
                        <ReactSelect
                          options={opcionesCombinadas}
                          isMulti
                          components={{
                            Group,
                            Option,
                            MultiValueLabel: props => (
                              <components.MultiValueLabel {...props}>
                                {props.data.displayName || props.data.label}
                              </components.MultiValueLabel>
                            ),
                            MultiValueRemove: props => (
                              <components.MultiValueRemove {...props}>
                                <span title="Quitar" style={{ color: '#dc3545', cursor: 'pointer' }}>&times;</span>
                              </components.MultiValueRemove>
                            )
                          }}
                          onChange={selected => handleFormChange(reserva.id, 'selectedUsers', selected)}
                          value={formStates[reserva.id]?.selectedUsers || []}
                          placeholder="Buscar por vivienda o invitados externos frecuentes..."
                          noOptionsMessage={() => "No hay usuarios disponibles"}
                          expandedGroups={expandedGroups}
                          setExpandedGroups={setExpandedGroups}
                          menuPortalTarget={document.body}
                        />
                      ) : (
                        <div className="row g-2 align-items-end mb-2">
                          <div className="col-md-5">
                            <input
                              type="email"
                              className="form-control"
                              placeholder="Email del invitado externo"
                              value={nuevoInvitadoExterno.email}
                              onChange={e => setNuevoInvitadoExterno({ ...nuevoInvitadoExterno, email: e.target.value })}
                            />
                          </div>
                          <div className="col-md-5">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nombre completo"
                              value={nuevoInvitadoExterno.nombre}
                              onChange={e => setNuevoInvitadoExterno({ ...nuevoInvitadoExterno, nombre: e.target.value })}
                            />
                          </div>
                          <div className="col-md-2">
                            <button
                              className="btn btn-success w-100"
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

                      <div className="mt-3 d-flex justify-content-between align-items-center">
                        <button
                          className="btn btn-success"
                          onClick={() => manejarInvitacion(reserva.id)}
                          disabled={
                            ((formStates[reserva.id]?.selectedUsers?.length || 0) +
                              (formStates[reserva.id]?.invitacionesExternas?.length || 0)) > 3
                          }
                        >
                          Invitar (
                          {(formStates[reserva.id]?.selectedUsers?.length || 0) +
                            (formStates[reserva.id]?.invitacionesExternas?.length || 0)}
                          /3)
                        </button>
                      </div>
                    </>
                  )}

                  {/* Invitaciones actuales con visualización inteligente */}
                  <div className="mt-3">
                    <h6>Invitaciones actuales:</h6>
                    <ul className="list-group">
  {[...new Map((reserva.invitaciones || []).map(inv => [inv.email, inv])).values()].map(invitacion => {
    let displayText = invitacion.email;
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
      <li key={invitacion.id} className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{displayText}</strong>
          <span className={`badge ${ESTADOS_COLORES[invitacion.estado]} ms-3`}>
            {invitacion.estado}
          </span>
        </div>
        {!caducada && invitacion.estado === 'pendiente' && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleEliminarInvitacion(invitacion.id, reserva.id)}
            title="Eliminar invitación"
          >
            Eliminar
          </button>
        )}
      </li>
    );
  })}
</ul>

                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import ReactSelect, { components } from 'react-select';
import { 
  fetchReservations,
  fetchUsuariosComunidad,
  invitarJugadores,
  eliminarInvitacion, // <- Usar esta función
  deleteReservation
} from '../services/ApiService';
import { format } from 'date-fns';

const ESTADOS_COLORES = {
  pendiente: 'bg-warning',
  aceptada: 'bg-success',
  rechazada: 'bg-danger'
};

// Componente personalizado para grupo colapsable
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

// Componente personalizado para opciones (tabulación visual)
const Option = props => {
  const isUser = !props.data.isSingle;
  return (
    <div style={{ paddingLeft: isUser ? 24 : 0 }}>
      <components.Option {...props} />
    </div>
  );
};

// Agrupa usuarios por vivienda para ReactSelect
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
        isSingle: true,
        email: usuariosVivienda[0].email
      };
    } else {
      return {
        label: vivienda,
        options: usuariosVivienda.map(u => ({
          value: u.id,
          label: `${u.nombre} ${u.apellido}`,
          email: u.email,
          isSingle: false
        }))
      };
    }
  });
};

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [invitacionesActivas, setInvitacionesActivas] = useState({});
  const [formStates, setFormStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  const fetchReservasDelUsuario = async () => {
    try {
      const response = await fetchReservations({ user: 'me' });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error obteniendo reservas:", error);
      return [];
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [reservasData, usuariosResponse] = await Promise.all([
          fetchReservasDelUsuario(),
          fetchUsuariosComunidad()
        ]);
        const usuariosData = Array.isArray(usuariosResponse)
          ? usuariosResponse
          : (usuariosResponse?.data || []);
        setReservas(Array.isArray(reservasData) ? reservasData : []);
        setUsuarios(agruparUsuariosPorVivienda(usuariosData));
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleFormChange = (reservaId, field, value) => {
    setFormStates(prev => ({
      ...prev,
      [reservaId]: {
        ...prev[reservaId],
        [field]: value
      }
    }));
  };

  const manejarInvitacion = async (reservaId) => {
    try {
      const { emails, selectedUsers } = formStates[reservaId] || {};
      const usuariosSeleccionados = selectedUsers?.map(u => u.isSingle ? { email: u.email } : { id: u.value }) || [];
      await invitarJugadores(reservaId, {
        emails: [
          ...(emails?.split(',').map(e => e.trim()).filter(e => e) || []),
          ...usuariosSeleccionados.map(u => u.email).filter(Boolean)
        ],
        usuarios: usuariosSeleccionados.map(u => u.id).filter(Boolean)
      });
      const nuevasReservas = await fetchReservasDelUsuario();
      setReservas(nuevasReservas);
      setFormStates(prev => ({
        ...prev,
        [reservaId]: { emails: '', selectedUsers: [] }
      }));
    } catch (error) {
      console.error("Error invitando jugadores:", error.response?.data);
    }
  };

  // FUNCIÓN PARA ELIMINAR INVITACIONES EN TIEMPO REAL
  const handleEliminarInvitacion = async (invitacionId, reservaId) => {
    try {
      await eliminarInvitacion(invitacionId);
      setReservas(prev => prev.map(reserva => {
        if (reserva.id === reservaId) {
          return {
            ...reserva,
            invitaciones: reserva.invitaciones.filter(i => i.id !== invitacionId)
          };
        }
        return reserva;
      }));
    } catch (error) {
      console.error("Error eliminando invitación:", error.response?.data);
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
      {reservas.length === 0 ? (
        <div className="alert alert-info mt-4">
          No tienes reservas actualmente
        </div>
      ) : (
        reservas.map(reserva => (
          <div key={reserva.id} className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                {reserva.court?.name} - {format(new Date(reserva.date), 'dd/MM/yyyy')}
                {reserva.timeslot && (
                  <span className="ms-2 text-muted">
                    {reserva.timeslot.start_time?.slice(0,5)} - {reserva.timeslot.end_time?.slice(0,5)}
                  </span>
                )}
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleEliminarReserva(reserva.id)}
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
                <ReactSelect
                  options={usuarios}
                  isMulti
                  components={{ Group, Option, DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                  onChange={selected => handleFormChange(reserva.id, 'selectedUsers', selected)}
                  value={formStates[reserva.id]?.selectedUsers || []}
                  placeholder="Buscar por vivienda..."
                  noOptionsMessage={() => "No hay usuarios disponibles"}
                  expandedGroups={expandedGroups}
                  setExpandedGroups={setExpandedGroups}
                  menuPortalTarget={document.body}
                />
                
                <div className="mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Añadir emails externos (separar por comas)"
                    value={formStates[reserva.id]?.emails || ''}
                    onChange={(e) => handleFormChange(reserva.id, 'emails', e.target.value)}
                  />
                </div>

                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <button 
                    className="btn btn-primary"
                    onClick={() => manejarInvitacion(reserva.id)}
                    disabled={
                      ((formStates[reserva.id]?.selectedUsers?.length || 0) + 
                      (formStates[reserva.id]?.emails?.split(',').filter(e => e).length || 0)) > 3
                    }
                  >
                    Invitar (
                      {(formStates[reserva.id]?.selectedUsers?.length || 0) + 
                      (formStates[reserva.id]?.emails?.split(',').filter(e => e).length || 0)}
                      /3)
                  </button>
                </div>

                <div className="mt-3">
                  <h6>Invitaciones actuales:</h6>
                  {reserva.invitaciones?.map(invitacion => (
                    <div key={invitacion.id} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        {invitacion.invitado?.nombre || invitacion.email} - 
                        <span className={`badge ${ESTADOS_COLORES[invitacion.estado]} ms-2`}>
                          {invitacion.estado}
                        </span>
                      </div>
                      {invitacion.estado === 'pendiente' && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleEliminarInvitacion(invitacion.id, reserva.id)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

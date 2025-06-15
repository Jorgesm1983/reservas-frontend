import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchReservations,
  fetchTimeSlots,
  fetchViviendas,
  // deleteReservation,
  fetchCourts
} from '../services/ApiService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from './Header';
import { useCommunity } from '../context/CommunityContext';
const PAGE_SIZE = 10;

// Utilidad para extraer el ID de comunidad
function getCommunityId(selectedCommunity) {
  if (!selectedCommunity) return '';
  if (typeof selectedCommunity === 'object' && selectedCommunity !== null) {
    return selectedCommunity.id;
  }
  return selectedCommunity;
}

function getMonthDateRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    start: format(firstDay, 'yyyy-MM-dd'),
    end: format(lastDay, 'yyyy-MM-dd')
  };
}

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [isStaff, setIsStaff] = useState(false);
   const { selectedCommunity } = useCommunity();
  const [filters, setFilters] = useState(() => {
    const { start, end } = getMonthDateRange();
    return {
      startDate: start,
      endDate: end,
      timeslot: '',
      vivienda: ''
    };
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // const userEmail = localStorage.getItem('email');

  useEffect(() => {
    const communityId = getCommunityId(selectedCommunity);

    // const communityId =
    //     selectedCommunity && typeof selectedCommunity === 'object'
    // ? selectedCommunity.id
    // : selectedCommunity;

    const fetchFiltersData = async () => {
      try {
          const [tsRes, vRes, cRes] = await Promise.all([
            fetchTimeSlots(communityId),
            fetchViviendas(communityId),
            fetchCourts(communityId)
          ]);
          setTimeSlots(tsRes.data);
          const viviendasData = Array.isArray(vRes.data) ? vRes.data : vRes.data.results || [];
          setViviendas(viviendasData);
          setCourts(cRes.data);

      } catch (error) {
      setViviendas([]);
      setTimeSlots([]);
      setCourts([]);
      console.error("Error fetching filters:", error);
    }
    };
    fetchFiltersData();
    setIsStaff(localStorage.getItem('is_staff') === 'true');
  }, [selectedCommunity]);

  const fetchFilteredReservations = useCallback(async () => {
    setLoading(true);

  const communityId = getCommunityId(selectedCommunity);
  console.log("communityId (debe ser número o string):", communityId, typeof communityId);

    const params = {
      page,
      page_size: PAGE_SIZE,
      ...(communityId ? { community: communityId } : {}),
    };
  
    if (filters.startDate) params.date_after = filters.startDate;
    if (filters.endDate) params.date_before = filters.endDate;
    if (filters.timeslot) params.timeslot = filters.timeslot;
    if (filters.vivienda) params.vivienda = filters.vivienda;

    // Log final de los parámetros enviados
    console.log("Parámetros finales enviados:", params, typeof params.community);

    
    try {
      const res = await fetchReservations(params);
      // DRF Pagination: results + count
      if (Array.isArray(res.data?.results)) {
        setReservations(res.data.results);
        setTotal(res.data.count || 0);
      } else if (Array.isArray(res.data)) {
        setReservations(res.data);
        setTotal(res.data.length);
      } else {
        setReservations([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error.response?.data);
      setReservations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, selectedCommunity]);

  useEffect(() => {
    fetchFilteredReservations();
    // eslint-disable-next-line
  }, [filters, page, fetchFilteredReservations, selectedCommunity]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("¿Seguro que quieres cancelar esta reserva?")) {
  //     try {
  //       await deleteReservation(id);
  //       fetchFilteredReservations(); // <-- Recarga la página actual
  //     } catch (error) {
  //       console.error("Error cancelando reserva:", error);
  //       alert(error.response?.data?.error || "No se pudo cancelar la reserva");
  //     }
  //   }
  // };

  // Paginación simple
  const totalPages = Math.ceil(total / PAGE_SIZE);

return (
  <div style={{ background: '#f6f8fa'}}>
    <Header showHomeIcon={true} showLogout={false} />
    <div className="container py-3 flex-grow-1" style={{ flex: 1, maxWidth: 480 }}>
      <div className="card-welcome mb-4" style={{
        maxWidth: 420,
        margin: '0 auto',
        padding: '1.5rem 1.2rem 1.2rem 1.2rem',
        background: '#fff',
        boxShadow: "0 4px 20px rgba(31,38,135,0.08)",
          borderTop: "3px solid #c6ff00"
      }}>

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
              Histórico de reservas
            </div>
            <div
              style={{
                color: '#7e8594',
                fontSize: 15,
                textAlign: 'center',
                maxWidth: 290,
                marginTop: 2
              }}
            >
              Consulta, filtra las reservas de pista.
            </div>
          </div>
        
        {/* Filtros */}
        <div className="row mb-3 align-items-end">
          <div className="col-6 mb-2">
            <label style={{ color: '#7e8594', fontWeight: 500 }}>Desde:</label>
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-6 mb-2">
            <label style={{ color: '#7e8594', fontWeight: 500 }}>Hasta:</label>
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-6 mb-2">
            <label style={{ color: '#7e8594', fontWeight: 500 }}>Horario:</label>
            <select
              className="form-select"
              name="timeslot"
              value={filters.timeslot}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              {timeSlots.map(ts => (
                <option key={ts.id} value={ts.id}>
                  {ts.start_time.slice(0, 5)} - {ts.end_time.slice(0, 5)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 mb-2">
            <label style={{ color: '#7e8594', fontWeight: 500 }}>Vivienda:</label>
            <select
              className="form-select"
              name="vivienda"
              value={filters.vivienda}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              {Array.isArray(viviendas) && viviendas.map(v => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>
        </div>

<div>
  {loading ? (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
    </div>
  ) : reservations.length === 0 ? (
    <div className="text-center text-muted py-5">
      No hay reservas en este rango
    </div>
  ) : (
    reservations.map(res => {
      const ts = timeSlots.find(ts => ts.id === (res.timeslot?.id || res.timeslot));
      const pista = courts.find(c => c.id === (res.court?.id || res.court));
      // const resDate = new Date(res.date + 'T' + (ts?.start_time || '00:00'));
      // const now = new Date();
      // // const isActive = resDate > now;
      const user = res.user || {};
      const userEmail = localStorage.getItem('email');

      return (
        <div key={res.id}
          className="d-flex align-items-center border rounded-3 mb-2 px-3 py-2"
          style={{
            background: "#f8fafc",
            borderColor: "#e3e7ed",
            minHeight: 60
          }}>
          
          {/* Datos principales de la reserva */}
          <div style={{ flex: 1, minWidth: 0, marginRight: 15 }}>
            <div className="fw-bold" style={{
              color: '#0e2340',
              fontSize: 16,
              letterSpacing: 0.1,
              marginBottom: 2
            }}>
              {format(new Date(res.date), "EEEE d 'de' MMMM", { locale: es })} · {ts?.start_time?.slice(0,5)}-{ts?.end_time?.slice(0,5)}
            </div>
            <div style={{ fontSize: 14, color: '#0e2340', marginBottom: 2 }}>
              <i className="bi bi-geo-alt-fill me-1" style={{ color: '#0e2340' }} />
              {pista?.name || 'Sin pista'}
            </div>
            <div style={{ fontSize: 13, color: '#7e8594' }}>
              {user.nombre} {user.apellido} · {user.vivienda?.nombre || 'Sin vivienda'}
            </div>
          </div>

{/* Jugadores confirmados (solo para staff o propietario) */}
{(isStaff || res.user?.email === userEmail) && res.invitaciones && res.invitaciones.some(inv => inv.estado === "aceptada") && (
  <div
    style={{
      minWidth: 120,
      maxWidth: 220,
      textAlign: "right",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      justifyContent: "center"
    }}
  >
    <div
      style={{
        fontWeight: 600,
        color: "#0e2340",
        fontSize: 13,
        marginBottom: 4
      }}
    >
      Jugado con:
    </div>
    <div className="d-flex flex-wrap justify-content-end" style={{ gap: 3 }}>
      {res.invitaciones
        .filter(inv => inv.estado === "aceptada")
        .map(inv => (
          <span
            key={inv.id}
            className="badge"
            style={{
              background: "#f2f6fa",
              color: "#0e2340",
              fontSize: 11,
              fontWeight: 500,
              padding: "3px 6px",
              borderRadius: "4px",
              border: "1px solid #e3e7ed",
              marginBottom: 2
            }}
          >
            {inv.nombremostrar || inv.nombre_invitado || inv.nombre || inv.email}
          </span>
        ))}
    </div>
    {/* Botón cancelar solo si staff y activa */}
    {/* {isStaff && isActive && (
      <button
        className="btn btn-danger btn-sm mt-2"
        onClick={() => handleDelete(res.id)}
        style={{ minWidth: 70, fontSize: 12 }}
      >
        Cancelar
      </button>
    )} */}
  </div>
)}


        </div>
      );
    })
  )}
</div>

{/* Paginación */}
{totalPages > 1 && (
  <nav className="mt-4">
    <ul className="pagination justify-content-center mb-0">
      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Anterior
        </button>
      </li>
      {Array.from({ length: totalPages }, (_, idx) => (
        <li key={idx + 1} className={`page-item ${page === idx + 1 ? 'active' : ''}`}>
          <button className="page-link" onClick={() => setPage(idx + 1)}>
            {idx + 1}
          </button>
        </li>
      ))}
      <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Siguiente
        </button>
      </li>
    </ul>
  </nav>
)}

      </div>
    </div>
  </div>
);
}
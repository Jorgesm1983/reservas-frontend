import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchReservations,
  fetchTimeSlots,
  fetchViviendas,
  deleteReservation,
  fetchCourts
} from '../services/ApiService';
import { format } from 'date-fns';

const PAGE_SIZE = 20;

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

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [tsRes, vRes, cRes] = await Promise.all([
          fetchTimeSlots(),
          fetchViviendas(),
          fetchCourts()
        ]);
        setTimeSlots(tsRes.data);
        setViviendas(vRes.data);
        setCourts(cRes.data);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchFiltersData();
    setIsStaff(localStorage.getItem('is_staff') === 'true');
  }, []);

  const fetchFilteredReservations = useCallback(async () => {
    setLoading(true);
    const params = {
      page,
      page_size: PAGE_SIZE
    };
    if (filters.startDate) params.date_after = filters.startDate;
    if (filters.endDate) params.date_before = filters.endDate;
    if (filters.timeslot) params.timeslot = filters.timeslot;
    if (filters.vivienda) params.vivienda = filters.vivienda;
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
  }, [filters, page]);

  useEffect(() => {
    fetchFilteredReservations();
    // eslint-disable-next-line
  }, [filters, page, fetchFilteredReservations]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres cancelar esta reserva?")) {
      try {
        await deleteReservation(id);
        setReservations(prev => prev.filter(res => res.id !== id));
      } catch (error) {
        console.error("Error cancelando reserva:", error);
        alert(error.response?.data?.error || "No se pudo cancelar la reserva");
      }
    }
  };

  // Paginación simple
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container">
      <h2>Listado de reservas</h2>
      <div className="row mb-3 align-items-end">
        <div className="col-md-2">
          <label>Desde:</label>
          <input
            type="date"
            className="form-control"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-2">
          <label>Hasta:</label>
          <input
            type="date"
            className="form-control"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-2">
          <label>Horario:</label>
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
        <div className="col-md-2">
          <label>Vivienda:</label>
          <select
            className="form-select"
            name="vivienda"
            value={filters.vivienda}
            onChange={handleFilterChange}
          >
            <option value="">Todas</option>
            {viviendas.map(v => (
              <option key={v.id} value={v.id}>{v.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Pista</th>
              <th>Nombre y Apellido</th>
              <th>Vivienda</th>
              {isStaff && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isStaff ? 6 : 5} className="text-center">
                  Cargando...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={isStaff ? 6 : 5} className="text-center">
                  No hay reservas en este rango
                </td>
              </tr>
            ) : (
              reservations.map(res => (
                <tr key={res.id}>
                  <td>{format(new Date(res.date), 'dd/MM/yyyy')}</td>
                  <td>
                    {timeSlots.find(ts => ts.id === (res.timeslot?.id || res.timeslot))?.start_time?.slice(0,5) || '--:--'}
                    {" - "}
                    {timeSlots.find(ts => ts.id === (res.timeslot?.id || res.timeslot))?.end_time?.slice(0,5) || '--:--'}
                  </td>
                  <td>{courts.find(c => c.id === (res.court?.id || res.court))?.name || 'Sin pista'}</td>
                  <td>
                    {res.user?.nombre || ''}{res.user?.apellido ? ' ' + res.user.apellido : ''}
                  </td>
                  <td>{res.user?.vivienda?.nombre || 'Sin vivienda'}</td>
                  {isStaff && (
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(res.id)}
                      >
                        Cancelar
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
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
  );
}

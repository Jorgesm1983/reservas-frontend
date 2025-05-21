import React, { useEffect, useState, useCallback } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  fetchReservations,
  fetchTimeSlots,
  fetchViviendas,
  deleteReservation,
  fetchCourts
} from '../services/ApiService';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [isStaff, setIsStaff] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    timeslot: '',
    vivienda: ''
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState([]);

  // Cargar datos para selects y detectar si es staff
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

  // Obtener reservas filtradas
  const fetchFilteredReservations = useCallback(async () => {
    const params = {
      date_after: format(filters.startDate, 'yyyy-MM-dd'),
      date_before: format(filters.endDate, 'yyyy-MM-dd'),
      timeslot: filters.timeslot,
      vivienda: filters.vivienda
    };
    try {
      const res = await fetchReservations(params);
      // Soporta tanto array plano como paginado
      const allReservations = Array.isArray(res.data?.results)
        ? res.data.results
        : Array.isArray(res.data)
        ? res.data
        : [];
      setReservations(allReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error.response?.data);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Actualizar reservas cada vez que cambian los filtros
  useEffect(() => {
    fetchFilteredReservations();
    // eslint-disable-next-line
  }, [filters, fetchFilteredReservations]);

  // Cambiar fechas del filtro
  const handleDateChange = (ranges) => {
    setFilters(prev => ({
      ...prev,
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate
    }));
  };

  // Cambiar selects de filtro
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Eliminar reserva (solo staff)
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

  // Para DateRangePicker
  const selectionRange = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    key: 'selection'
  };

  return (
    <div className="container">
      <h2>Listado de reservas</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <label>Rango de fechas:</label>
          <DateRangePicker
            ranges={[selectionRange]}
            onChange={handleDateChange}
            locale={es}
            showMonthAndYearPickers={true}
            rangeColors={['#0d6efd']}
            maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
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
    </div>
  );
}

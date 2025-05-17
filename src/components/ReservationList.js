import React, { useEffect, useState, useCallback } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { fetchReservations, fetchTimeSlots, fetchViviendas, deleteReservation, fetchCourts } from '../services/ApiService';
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
  const [courts, setCourts] = useState([]); // ← Añadir estado para courts

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
        setCourts(cRes.data); // ← Guardar courts en estado
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
      setReservations(Array.isArray(res.data?.results) ? res.data.results : []);
    } catch (error) {
      console.error("Error fetching reservations:", error.response?.data);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [filters]); // ← Añadir dependencia

  // Actualizar reservas cada vez que cambian los filtros
  useEffect(() => {
    fetchFilteredReservations();
    // eslint-disable-next-line
  }, [filters]);

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
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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

  return (
    <div className="container mt-4">
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Filtros</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Rango de fechas</label>
              <DateRangePicker
                ranges={[{
                  startDate: filters.startDate,
                  endDate: filters.endDate,
                  key: 'selection'
                }]}
                onChange={handleDateChange}
                locale={es}
                maxDate={new Date()}
                shownDate={filters.startDate}
                rangeColors={["#3d91ff"]}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tramo horario</label>
              <select 
                className="form-select"
                name="timeslot"
                value={filters.timeslot}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {timeSlots.map(ts => (
                  <option key={ts.id} value={ts.id}>
                    {ts.start_time.slice(0,5)} - {ts.end_time.slice(0,5)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Vivienda</label>
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
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Pista</th>
              {isStaff ? (
                <>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Vivienda</th>
                </>
              ) : (
                <th>Vivienda</th>
              )}
              {isStaff && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={isStaff ? 7 : 5} className="text-center text-muted">
                  No hay reservas en este rango
                </td>
              </tr>
            ) : (
              reservations.map(res => (
                <tr key={res.id}>
                  <td>{format(new Date(res.date), 'dd/MM/yyyy')}</td>
                  <td>
                    {timeSlots.find(ts => ts.id === res.timeslot)?.start_time?.slice(0,5) || '--:--'} - 
                    {timeSlots.find(ts => ts.id === res.timeslot)?.end_time?.slice(0,5) || '--:--'}
                  </td>
                  <td>{courts.find(c => c.id === res.court)?.name || 'Sin pista'}</td>
                  {isStaff ? (
                    <>
                      <td>{res.user?.nombre || ''}</td>
                      <td>{res.user?.apellido || ''}</td>
                      <td>{res.user?.vivienda?.nombre || 'Sin vivienda'}</td>
                    </>
                  ) : (
                    <td>{res.user?.vivienda?.nombre || 'Sin vivienda'}</td>
                  )}
                  {isStaff && (
                    <td>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="btn btn-danger btn-sm"
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
      )}
    </div>
  );
}

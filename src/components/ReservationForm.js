import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { fetchCourts, fetchTimeSlots, createReservation, fetchReservations } from '../services/ApiService';


function getReservaWindow() {
  const now = new Date();
  const horaActual = now.getHours();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minDate = new Date(today);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + (horaActual >= 8 ? 2 : 1));
  return { min: minDate, max: maxDate };
}

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReservationForm() {
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [dateLimits, setDateLimits] = useState(getReservaWindow());
  const [ocupados, setOcupados] = useState([]); // IDs de slots ocupados (strings)
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualiza los límites de fecha cada minuto
  useEffect(() => {
    const interval = setInterval(() => setDateLimits(getReservaWindow()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCourts().then(res => setCourts(res.data));
    fetchTimeSlots().then(res => setSlots(res.data));
  }, []);

  // Al seleccionar fecha y pista, consulta reservas existentes y marca slots ocupados (como string)
  useEffect(() => {
    const cargarReservasDia = async () => {
      setOcupados([]);
      setSelectedSlot('');
      if (selectedDate && selectedCourt) {
        try {
          const res = await fetchReservations({
            date_after: formatDateLocal(selectedDate),
            date_before: formatDateLocal(selectedDate),
            court: selectedCourt
          });
          // Guarda los IDs como string
           const reservas = Array.isArray(res.data.results) ? res.data.results : res.data;
        const ocupadosIds = reservas.map(r => String(r.timeslot?.id || r.timeslot));
        setOcupados(ocupadosIds);
      } catch (err) {
        setOcupados([]);
      }
    }
  };
  cargarReservasDia();
}, [selectedDate, selectedCourt]);

  // Si el slot seleccionado se vuelve ocupado, límpialo (como string)
  useEffect(() => {
    if (selectedSlot && ocupados.includes(selectedSlot)) {
      setSelectedSlot('');
    }
  }, [ocupados, selectedSlot]);

  const isDayDisabled = date => date < dateLimits.min || date > dateLimits.max;

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      await createReservation({
        court: parseInt(selectedCourt, 10),
        date: formatDateLocal(selectedDate),
        timeslot: parseInt(selectedSlot, 10)
      });
      setSuccessMessage('✅ Reserva creada exitosamente!');
      setSelectedCourt('');
      setSelectedSlot('');
      setSelectedDate(null);
      setOcupados([]);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          setError('⛔ ' + (error.response.data.error || error.response.data.detail));
        } else if (error.response.data?.error) {
          setError('⚠️ Error: ' + error.response.data.error);
        } else if (error.response.data?.non_field_errors) {
          setError('⛔ ' + error.response.data.non_field_errors[0]);
        } else {
          setError('⚠️ Error: ' + (error.response.data.detail || 'Error desconocido'));
        }
      } else {
        setError('🚨 Error de conexión - verifica tu conexión a internet');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separa slots libres y ocupados para el optgroup
  const slotsLibres = slots.filter(slot => !ocupados.includes(String(slot.id)));
  const slotsOcupados = slots.filter(slot => ocupados.includes(String(slot.id)));

  return (
    <>
     
      <div className="container mt-4">
        <h2>Reservar pista</h2>
        <div className="row">
          <div className="col-md-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={dateLimits.min}
              maxDate={dateLimits.max}
              tileDisabled={({ date }) => isDayDisabled(date)}
              locale="es-ES"
            />
          </div>
          <div className="col-md-6">
            {selectedDate && (
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label>Pista:</label>
                  <select
                    value={selectedCourt}
                    onChange={e => setSelectedCourt(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona pista</option>
                    {courts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label>Hora:</label>
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    className="form-select"
                    required
                    disabled={!selectedCourt}
                  >
                    <option value="">Selecciona hora</option>
                    {slotsLibres.length > 0 && (
                      <optgroup label="Disponibles">
                        {slotsLibres.map(slot => (
                          <option key={slot.id} value={slot.id}>
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {slotsOcupados.length > 0 && (
                      <optgroup label="Ocupados">
                        {slotsOcupados.map(slot => (
                          <option
                            key={slot.id}
                            value={slot.id}
                            disabled
                            style={{ color: '#bbb', fontStyle: 'italic' }}
                          >
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)} (ocupado)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {selectedCourt && slotsLibres.length === 0 && (
                    <div className="text-danger mt-2">
                      No hay huecos disponibles en esta pista para este día.
                    </div>
                  )}
                </div>
                <button className="btn btn-primary" type="submit" disabled={isSubmitting || !selectedCourt || !selectedSlot}>
                  Reservar
                </button>
              </form>
            )}
            {error && <div className="alert alert-danger mt-2">{error}</div>}
            {successMessage && <div className="alert alert-success mt-2">{successMessage}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

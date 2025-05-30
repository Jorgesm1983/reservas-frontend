import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { fetchCourts, fetchTimeSlots, createReservation, fetchReservations } from '../services/ApiService';
import Header from './Header';
import Footer from './Footer';

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
  const [ocupados, setOcupados] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Actualiza los límites de fecha cada minuto
  useEffect(() => {
    const interval = setInterval(() => setDateLimits(getReservaWindow()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCourts().then(res => setCourts(res.data));
    fetchTimeSlots().then(res => setSlots(res.data));
  }, []);

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

  const slotsLibres = slots.filter(slot => !ocupados.includes(String(slot.id)));
  const slotsOcupados = slots.filter(slot => ocupados.includes(String(slot.id)));

  return (
    <div className="d-flex flex-column main-wrapper" style={{ minHeight: '100dvh' }}>
      {/* Header con botón de volver al home */}
      <Header showHomeIcon={true}
        rightIcon={
          <button
            className="btn btn-link"
            style={{
              color: '#0e2340',
              fontSize: 22,
              background: 'none',
              border: 'none',
              lineHeight: 1,
              minWidth: 0,
              boxShadow: 'none'
            }}
            onClick={() => navigate('/')}
            aria-label="Volver al home"
            type="button"
          >
            <i className="bi bi-house-door"></i>
          </button>
        }
      />
                <div className="container py-3 flex-grow-1" style={{ flex: 1, maxWidth: 480 }}>
          <div className="card-welcome mb-4" style={{ maxWidth: 420, margin: "0 auto" }}>
            <div className="card-welcome-header">
              <span className="card-welcome-hello">Nueva reserva</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Fecha</label>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    minDate={dateLimits.min}
                    maxDate={dateLimits.max}
                    tileDisabled={({ date }) => isDayDisabled(date)}
                    locale="es-ES"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Pista</label>
                <select
                  className="form-select"
                  value={selectedCourt}
                  onChange={e => setSelectedCourt(e.target.value)}
                  required
                >
                  <option value="">Selecciona pista</option>
                  {courts.map(court => (
                    <option key={court.id} value={court.id}>{court.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Horario</label>
                <select
                  className="form-select"
                  value={selectedSlot}
                  onChange={e => setSelectedSlot(e.target.value)}
                  required
                  disabled={!selectedCourt || !selectedDate}
                >
                  <option value="">Selecciona horario</option>
                  {slotsLibres.length > 0 && (
                    <optgroup label="Horarios disponibles">
                      {slotsLibres.map(slot => (
                        <option key={slot.id} value={slot.id}>
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {slotsOcupados.length > 0 && (
                    <optgroup label="No disponibles">
                      {slotsOcupados.map(slot => (
                        <option key={slot.id} value={slot.id} disabled>
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              {successMessage && <div className="alert alert-success">{successMessage}</div>}
              <button className="btn btn-primary w-100" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Reservando...' : 'Reservar'}
              </button>
            </form>
          </div>
      </div>
    </div>
  );
}

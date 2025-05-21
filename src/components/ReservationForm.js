import React, { useState, useEffect } from 'react';
import { fetchCourts, fetchTimeSlots, createReservation } from '../services/ApiService';
import Navbar from './Navbar';

// Función para calcular la ventana de reserva
function getReservaWindow() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000); // Ajuste de zona horaria
  
  const horaActual = localDate.getHours();
  const today = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());

  // Fecha mínima siempre es HOY (local)
  const minDate = new Date(today);
  
  // Fecha máxima: hoy + 1 día si <8h, hoy +2 días si >=8h
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + (horaActual >= 8 ? 2 : 1));

  // Formatear en ISO sin conversión UTC
  const toLocalISO = d => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    min: toLocalISO(minDate),
    max: toLocalISO(maxDate)
  };
}

export default function ReservationForm() {
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ court: '', date: '', timeslot: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateLimits, setDateLimits] = useState(getReservaWindow());

  // Actualiza los límites de fecha cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setDateLimits(getReservaWindow());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Cargar pistas y franjas horarias
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetchCourts().then(res => setCourts(res.data));
      fetchTimeSlots().then(res => setSlots(res.data));
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {

      const formattedDate = new Date(form.date).toISOString().split('T')[0];

      const reservationData = {
        court: parseInt(form.court, 10),
        date: formattedDate,
        timeslot: parseInt(form.timeslot, 10),
      };

      await createReservation(reservationData);
      setSuccessMessage('✅ Reserva creada exitosamente!');
      setForm({ court: '', date: '', timeslot: '' });
      
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

  return (
    <>
      <Navbar />
      <form onSubmit={handleSubmit}>
        <label>
          Pista
          <select 
            name="court" 
            value={form.court} 
            onChange={handleChange} 
            required
            disabled={isSubmitting}
          >
            <option value="">-- Selecciona --</option>
            {courts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>
          Fecha
          <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={dateLimits.min}
              max={dateLimits.max}
              className="form-control"
              required
              // Validación adicional en el cliente
              onKeyDown={(e) => e.preventDefault()} // Evita entrada manual
            />
        </label>

        <label>
          Franja horaria
          <select 
            name="timeslot" 
            value={form.timeslot} 
            onChange={handleChange} 
            required
            disabled={isSubmitting}
          >
            <option value="">-- Selecciona franja --</option>
            {slots.map(s => (
              <option key={s.id} value={s.id}>
                {s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}
              </option>
            ))}
          </select>
        </label>

        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Reservar'}
        </button>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </form>
    </>
  );
}

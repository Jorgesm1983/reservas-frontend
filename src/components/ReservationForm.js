import React, { useState, useEffect } from 'react';
import { fetchCourts, fetchTimeSlots, createReservation } from '../services/ApiService';
import Navbar from './Navbar';

export default function ReservationForm() {
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ court: '', date: '', timeslot: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetchCourts().then(res => setCourts(res.data));
      fetchTimeSlots().then(res => setSlots(res.data));
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Limpia errores al modificar el formulario
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const reservationData = {
        court: parseInt(form.court, 10),
        date: form.date,
        timeslot: parseInt(form.timeslot, 10),
      };

      await createReservation(reservationData);
      setSuccessMessage('✅ Reserva creada exitosamente!');
      setForm({ court: '', date: '', timeslot: '' }); // Limpiar formulario
      
    } catch (error) {
      if (error.response) {
        // Error específico del backend
        if (error.response.status === 409) {
          setError('⛔ ' + error.response.data.detail);
        } else {
          setError('⚠️ Error: ' + (error.response.data.error || 'Error desconocido'));
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
            required
            disabled={isSubmitting}
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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
      </form>
    </>
  );
}

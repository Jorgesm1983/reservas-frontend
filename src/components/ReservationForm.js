import React, { useState, useEffect } from 'react';
import { fetchCourts, fetchTimeSlots, createReservation } from '../services/ApiService';
import Navbar from './Navbar';

export default function ReservationForm() {
  const [courts, setCourts] = useState([]);
  const [slots,  setSlots]  = useState([]);
  const [form,   setForm]   = useState({ court: '', date: '', timeslot: '' });

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      
      fetchCourts().then(res => setCourts(res.data));
      fetchTimeSlots().then(res => setSlots(res.data));
    } else {
      console.warn("🔐 No hay token en localStorage, no se hacen peticiones protegidas.");
    }
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
  
    const reservationData = {
      court: parseInt(form.court, 10),  // Asegúrate de que court y slot sean enteros
      date: form.date,
      timeslot: parseInt(form.timeslot, 10),
    };
  
    createReservation(reservationData).then(() => window.location.reload());
  };

  return (
      <>
      <Navbar />
    
    <form onSubmit={handleSubmit}>
      <label>
        Pista
        <select name="court" value={form.court} onChange={handleChange} required>
          <option value="">-- Selecciona --</option>
          {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label>
        Fecha
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
      </label>
      <label>
        Franja
        <select name="timeslot" value={form.timeslot} onChange={handleChange} required>
          <option value="">-- Selecciona franja --</option>
          {slots.map(s =>
            <option key={s.id} value={s.id}>
              {s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}
            </option>
          )}
        </select>
      </label>
      <button type="submit">Reservar</button>
    </form>
    </>
  );
}

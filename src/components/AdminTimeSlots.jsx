import React, { useEffect, useState } from 'react';
import { fetchTimeSlots, createTimeSlot } from '../services/ApiService';

export default function AdminTimeSlots() {
  const [slots, setSlots] = useState([]);
  const [start, setStart] = useState('');
  const [end,   setEnd]   = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetchTimeSlots()
        .then(r => fetchTimeSlots(r.data))
        .catch(err => console.error("Error al obtener las pistas:", err));
    }
  }, []);

  const addSlot = e => {
    e.preventDefault();
    createTimeSlot({ start_time: start, end_time: end })
      .then(() => {
        setStart(''); setEnd('');
        return fetchTimeSlots();
      })
      .then(r => setSlots(r.data));
  };

  return (
    <div>
      <h2>Gestionar Franjas</h2>
      <form onSubmit={addSlot}>
        <input type="time" value={start} onChange={e => setStart(e.target.value)} required />
        <input type="time" value={end}   onChange={e => setEnd(e.target.value)}   required />
        <button type="submit">Añadir</button>
      </form>
      <ul>
        {slots.map(s =>
          <li key={s.id}>
            {s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}
          </li>
        )}
      </ul>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { fetchTimeSlots, createTimeSlot } from '../services/ApiService';

export default function AdminTimeSlots() {
  const [slots, setSlots] = useState([]);
  const [slotLabel, setSlotLabel] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar slots al montar el componente
  useEffect(() => {
    fetchTimeSlots()
      .then(r => {
        setSlots(r.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al obtener los slots:", err);
        setLoading(false);
      });
  }, []);

  // Añadir un nuevo slot
  const addSlot = e => {
    e.preventDefault();
    if (!slotLabel.trim()) {
      alert("Debes introducir un nombre para la franja horaria (slot).");
      return;
    }
    createTimeSlot({ slot: slotLabel, start_time: start, end_time: end })
      .then(() => {
        setSlotLabel('');
        setStart('');
        setEnd('');
        return fetchTimeSlots();
      })
      .then(r => setSlots(r.data))
      .catch(err => {
        alert("Error al crear la franja horaria");
        console.error(err);
      });
  };

  if (loading) return <div>Cargando franjas horarias...</div>;

  return (
    <div className="container mt-4">
      <h2>Gestionar Franjas Horarias</h2>
      <form onSubmit={addSlot} className="mb-4">
        <input
          type="text"
          placeholder="Nombre franja (ej: 10:00 - 11:00)"
          value={slotLabel}
          onChange={e => setSlotLabel(e.target.value)}
          required
          className="form-control mb-2"
        />
        <input
          type="time"
          value={start}
          onChange={e => setStart(e.target.value)}
          required
          className="form-control mb-2"
        />
        <input
          type="time"
          value={end}
          onChange={e => setEnd(e.target.value)}
          required
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-primary">Añadir</button>
      </form>
      <h3>Franjas existentes</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Slot</th>
            <th>Hora inicio</th>
            <th>Hora fin</th>
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot.id}>
              <td>{slot.id}</td>
              <td>{slot.slot}</td>
              <td>{slot.start_time ? slot.start_time.slice(0,5) : ''}</td>
              <td>{slot.end_time ? slot.end_time.slice(0,5) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { fetchCourts, createCourt } from '../services/ApiService';

export default function AdminCourts() {
  const [courts, setCourts] = useState([]);
  const [name, setName]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetchCourts()
        .then(r => setCourts(r.data))
        .catch(err => console.error("Error al obtener las pistas:", err));
    }
  }, []);

  const addCourt = e => {
    e.preventDefault();
    createCourt({ name }).then(() => {
      setName('');
      return fetchCourts();
    })
    .then(r => setCourts(r.data))
    .catch(err => console.error("Error al añadir la pista:", err));  // Captura errores
  };

  return (
    <div>
      <h2>Gestionar Pistas</h2>
      <form onSubmit={addCourt}>
        <input
          placeholder="Nombre de la pista"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button type="submit">Añadir</button>
      </form>
      <ul>
        {courts.map(c => <li key={c.id}>{c.name}</li>)}
      </ul>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { fetchReservations } from '../services/ApiService';

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations().then(res => setReservations(res.data));
  }, []);

  return (
    <div>
      <h2>Reservas</h2>
      <ul>
        {reservations.map(r => (
          <li key={r.id}>
            Pista {r.court} — {r.date} {r.start_time}-{r.end_time}
          </li>
        ))}
      </ul>
    </div>
  );
}
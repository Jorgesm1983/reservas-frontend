import React, { useEffect, useState } from 'react';
import { fetchReservations, deleteReservation } from '../services/ApiService';

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations().then(res => setReservations(res.data));
  }, []);

  // Función para eliminar reserva
  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres cancelar esta reserva?")) {
        try {
            await deleteReservation(id);
            // Actualiza el estado local sin recargar la página
            setReservations(prev => prev.filter(res => res.id !== id));
        } catch (error) {
            console.error("Error cancelando reserva:", error);
            alert("No se pudo cancelar la reserva");
        }
    }
};


  return (
    <table className="table">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Usuario</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {reservations.map(res => (
                <tr key={res.id}>
                    <td>{res.date}</td>
                    <td>{res.timeslot.start_time}</td>
                    <td>{res.user.username}</td>
                    <td>
                            <button 
                                onClick={() => handleDelete(res.id)}
                                className="btn btn-danger btn-sm"
                            >
                                Cancelar
                            </button>
                        </td>
                </tr>
            ))}
        </tbody>
    </table>
);
}
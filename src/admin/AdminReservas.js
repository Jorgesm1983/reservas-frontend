import React, { useEffect, useState } from 'react';
import { fetchReservations, createReservation, updateReservation, deleteReservation, fetchCourts, fetchTimeSlots } from '../services/ApiService';

export default function AdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', reserva: null });
  const [form, setForm] = useState({ court: '', timeslot: '', date: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchReservations().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setReservas(data);
      setLoading(false);
    });
    fetchCourts().then(res => setCourts(Array.isArray(res.data) ? res.data : res.data.results || []));
    fetchTimeSlots().then(res => setSlots(Array.isArray(res.data) ? res.data : res.data.results || []));
  }, []);

  const handleOpenModal = (mode, reserva = null) => {
    setModal({ open: true, mode, reserva });
    setForm(reserva
      ? { court: reserva.court.id, timeslot: reserva.timeslot.id, date: reserva.date }
      : { court: '', timeslot: '', date: '' });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', reserva: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createReservation(form);
      setReservas([...reservas, res.data]);
    } else {
      const res = await updateReservation(modal.reserva.id, form);
      setReservas(reservas.map(r => (r.id === res.data.id ? res.data : r)));
    }
    handleCloseModal();
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar esta reserva?')) {
      await deleteReservation(id);
      setReservas(reservas.filter(r => r.id !== id));
    }
  };

  if (loading) return <p>Cargando reservas...</p>;

  return (
    <div className="container mt-4">
      <h3>Reservas</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nueva reserva</button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Pista</th>
            <th>Turno</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map(r => (
            <tr key={r.id}>
              <td>{r.court?.name}</td>
              <td>{r.timeslot?.start_time} - {r.timeslot?.end_time}</td>
              <td>{r.date}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', r)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal.open && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: '#0003' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nueva reserva' : 'Editar reserva'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <select className="form-select mb-2" name="court" value={form.court} onChange={handleChange} required>
                  <option value="">Selecciona pista</option>
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select className="form-select mb-2" name="timeslot" value={form.timeslot} onChange={handleChange} required>
                  <option value="">Selecciona turno</option>
                  {slots.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.start_time} - {s.end_time}
                    </option>
                  ))}
                </select>
                <input className="form-control mb-2" type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" type="button" onClick={handleCloseModal}>Cancelar</button>
                <button className="btn btn-primary" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { fetchTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } from '../services/ApiService';

export default function AdminTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', turno: null });
  const [form, setForm] = useState({ slot: '', start_time: '', end_time: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTimeSlots().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTurnos(data);
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (mode, turno = null) => {
    setModal({ open: true, mode, turno });
    setForm(turno ? { ...turno } : { slot: '', start_time: '', end_time: '' });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', turno: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createTimeSlot(form);
      setTurnos([...turnos, res.data]);
    } else {
      const res = await updateTimeSlot(modal.turno.id, form);
      setTurnos(turnos.map(t => (t.id === res.data.id ? res.data : t)));
    }
    handleCloseModal();
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar este turno?')) {
      await deleteTimeSlot(id);
      setTurnos(turnos.filter(t => t.id !== id));
    }
  };

  if (loading) return <p>Cargando turnos...</p>;

  return (
    <div className="container mt-4">
      <h3>Turnos</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nuevo turno</button>
      <table className="table table-striped">
        <thead>
          <tr><th>Slot</th><th>Inicio</th><th>Fin</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {turnos.map(t => (
            <tr key={t.id}>
              <td>{t.slot}</td>
              <td>{t.start_time}</td>
              <td>{t.end_time}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', t)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Eliminar</button>
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
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nuevo turno' : 'Editar turno'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" name="slot" value={form.slot} onChange={handleChange} placeholder="Nombre del turno" />
                <input className="form-control mb-2" name="start_time" value={form.start_time} onChange={handleChange} placeholder="Inicio (HH:MM:SS)" required />
                <input className="form-control mb-2" name="end_time" value={form.end_time} onChange={handleChange} placeholder="Fin (HH:MM:SS)" required />
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

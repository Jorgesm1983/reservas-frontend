import React, { useEffect, useState } from 'react';
import { fetchInvitaciones, createInvitacion, updateInvitacion, deleteInvitacion } from '../services/ApiService';

export default function AdminInvitaciones() {
  const [invitaciones, setInvitaciones] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', invitacion: null });
  const [form, setForm] = useState({ reserva: '', invitado: '', email: '', estado: 'pendiente', nombre_invitado: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchInvitaciones().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setInvitaciones(data);
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (mode, invitacion = null) => {
    setModal({ open: true, mode, invitacion });
    setForm(invitacion ? { ...invitacion } : { reserva: '', invitado: '', email: '', estado: 'pendiente', nombre_invitado: '' });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', invitacion: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createInvitacion(form);
      setInvitaciones([...invitaciones, res.data]);
    } else {
      const res = await updateInvitacion(modal.invitacion.id, form);
      setInvitaciones(invitaciones.map(i => (i.id === res.data.id ? res.data : i)));
    }
    handleCloseModal();
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar esta invitación?')) {
      await deleteInvitacion(id);
      setInvitaciones(invitaciones.filter(i => i.id !== id));
    }
  };

  if (loading) return <p>Cargando invitaciones...</p>;

  return (
    <div className="container mt-4">
      <h3>Invitaciones</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nueva invitación</button>
      <table className="table table-striped">
        <thead>
          <tr><th>Reserva</th><th>Email</th><th>Estado</th><th>Nombre invitado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {invitaciones.map(i => (
            <tr key={i.id}>
              <td>{i.reserva}</td>
              <td>{i.email}</td>
              <td>{i.estado}</td>
              <td>{i.nombre_invitado}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', i)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}>Eliminar</button>
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
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nueva invitación' : 'Editar invitación'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" name="reserva" value={form.reserva} onChange={handleChange} placeholder="ID Reserva" required />
                <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <input className="form-control mb-2" name="nombre_invitado" value={form.nombre_invitado} onChange={handleChange} placeholder="Nombre invitado" />
                <select className="form-select mb-2" name="estado" value={form.estado} onChange={handleChange}>
                  <option value="pendiente">Pendiente</option>
                  <option value="aceptada">Aceptada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
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

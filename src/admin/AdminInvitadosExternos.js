import React, { useEffect, useState } from 'react';
import { fetchInvitadosExternos, createInvitadoExterno, updateInvitadoExterno, deleteInvitadoExternoByEmail } from '../services/ApiService';

export default function AdminInvitadosExternos() {
  const [invitados, setInvitados] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', invitado: null });
  const [form, setForm] = useState({ email: '', nombre: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchInvitadosExternos().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setInvitados(data);
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (mode, invitado = null) => {
    setModal({ open: true, mode, invitado });
    setForm(invitado ? { ...invitado } : { email: '', nombre: '' });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', invitado: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createInvitadoExterno(form);
      setInvitados([...invitados, res.data]);
    } else {
      const res = await updateInvitadoExterno(modal.invitado.id, form);
      setInvitados(invitados.map(i => (i.id === res.data.id ? res.data : i)));
    }
    handleCloseModal();
  };

  const handleDelete = async email => {
    if (window.confirm('¿Seguro que quieres eliminar este invitado externo?')) {
      await deleteInvitadoExternoByEmail(email);
      setInvitados(invitados.filter(i => i.email !== email));
    }
  };

  if (loading) return <p>Cargando invitados externos...</p>;

  return (
    <div className="container mt-4">
      <h3>Invitados externos</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nuevo invitado</button>
      <table className="table table-striped">
        <thead>
          <tr><th>Email</th><th>Nombre</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {invitados.map(i => (
            <tr key={i.email}>
              <td>{i.email}</td>
              <td>{i.nombre}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', i)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.email)}>Eliminar</button>
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
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nuevo invitado externo' : 'Editar invitado externo'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <input className="form-control mb-2" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
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

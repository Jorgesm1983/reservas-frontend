import React, { useEffect, useState } from 'react';
import { fetchInvitaciones, createInvitacion, updateInvitacion, deleteInvitacion } from '../services/ApiService';
import Header from '../components/Header';
import { useCommunity } from '../context/CommunityContext';

export default function AdminInvitaciones() {
  const [invitaciones, setInvitaciones] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', invitacion: null });
  const [form, setForm] = useState({ reserva: '', invitado: '', email: '', estado: 'pendiente', nombre_invitado: '' });
  const [loading, setLoading] = useState(true);
  const { selectedCommunity } = useCommunity();

  useEffect(() => {
    setLoading(true);
    fetchInvitaciones(selectedCommunity).then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setInvitaciones(data);
      setLoading(false);
    });
  }, [selectedCommunity]);

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
  <div style={{ background: '#f6f8fa'}}>
    <Header showHomeIcon={true} showLogout={false} adminHomeIcon={true} isStaff={true}/>
    <div className="container py-4 flex-grow-1 d-flex justify-content-center align-items-start" style={{ minHeight: '80vh' }}>
      <div
        className="card shadow-sm rounded-4"
        style={{
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem 1.5rem 1.5rem',
          borderTop: '3px solid #c6ff00'
        }}
      >
        <div className="mb-4 text-center">
          <div
            style={{
              background: '#c6ff00',
              borderRadius: 50,
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto',
              boxShadow: '0 2px 8px rgba(198,255,0,0.13)'
            }}
          >
            <i className="bi bi-envelope-paper" style={{ color: '#0e2340', fontSize: 26 }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2 }}>
            Invitaciones
          </div>
          <div style={{ color: '#7e8594', fontSize: 15 }}>
            Gestiona las invitaciones enviadas para reservas.
          </div>
        </div>
        <button className="btn btn-success w-100 mb-3" onClick={() => handleOpenModal('add')}>
          <i className="bi bi-plus-circle me-2"></i>Nueva invitación
        </button>
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Reserva</th>
                <th style={{ minWidth: 120 }}>Email</th>
                <th style={{ minWidth: 100 }}>Estado</th>
                <th style={{ minWidth: 140 }}>Nombre invitado</th>
                <th style={{ minWidth: 110 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invitaciones.map(i => (
                <tr key={i.id}>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>
                    <strong>{i.reserva?.court?.name}</strong><br />
                    {i.reserva?.date}<br />
                    {i.reserva?.timeslot?.start_time?.slice(0,5)}-{i.reserva?.timeslot?.end_time?.slice(0,5)}
                  </td>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{i.email}</td>
                  <td style={{ verticalAlign: 'middle' }}>{i.estado}</td>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{i.nombre_invitado}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleOpenModal('edit', i)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(i.id)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {modal.open && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: '#0003' }}>
            <div className="modal-dialog">
              <form className="modal-content" onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modal.mode === 'add' ? (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>Nueva invitación
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>Editar invitación
                      </>
                    )}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    name="reserva"
                    value={form.reserva}
                    onChange={handleChange}
                    placeholder="ID Reserva"
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="nombre_invitado"
                    value={form.nombre_invitado}
                    onChange={handleChange}
                    placeholder="Nombre invitado"
                  />
                  <select
                    className="form-select mb-2"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aceptada">Aceptada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={handleCloseModal}
                  >
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                  </button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    type="submit"
                  >
                    <i className="bi bi-save me-1"></i>Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
import React, { useEffect, useState } from 'react';
import { fetchInvitadosExternos, createInvitadoExterno, updateInvitadoExterno, deleteInvitadoExternoByEmail } from '../services/ApiService';
import Header from '../components/Header';

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

   // Guarda el email original antes de editar (para update)
  const [originalEmail, setOriginalEmail] = useState('');

  const handleOpenModal = (mode, invitado = null) => {
    setModal({ open: true, mode, invitado });
    if (invitado) {
      setForm({ email: invitado.email, nombre: invitado.nombre });
      setOriginalEmail(invitado.email);
    } else {
      setForm({ email: '', nombre: '' });
      setOriginalEmail('');
    }
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', invitado: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createInvitadoExterno(form);
      setInvitados([...invitados, res.data]);
    } else {
      // Usa el email original como identificador
      const res = await updateInvitadoExterno(originalEmail, form);
      setInvitados(invitados.map(i => (i.email === originalEmail ? res.data : i)));
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
  <div style={{ background: '#f6f8fa'}}>
    <Header showHomeIcon={true} showLogout={false} adminHomeIcon={true} />
    <div className="container py-4 flex-grow-1 d-flex justify-content-center align-items-start" style={{ minHeight: '80vh' }}>
      <div
        className="card shadow-sm rounded-4"
        style={{
          maxWidth: 600,
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
            <i className="bi bi-person-plus" style={{ color: '#0e2340', fontSize: 26 }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2 }}>
            Invitados externos
          </div>
          <div style={{ color: '#7e8594', fontSize: 15 }}>
            Gestiona los invitados externos frecuentes de la comunidad.
          </div>
        </div>
        <button className="btn btn-success w-100 mb-3" onClick={() => handleOpenModal('add')}>
          <i className="bi bi-plus-circle me-2"></i>Nuevo invitado
        </button>
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: 140 }}>Email</th>
                <th style={{ minWidth: 120 }}>Nombre</th>
                <th style={{ minWidth: 110 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invitados.map(i => (
                <tr key={i.email}>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{i.email}</td>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{i.nombre}</td>
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
                        onClick={() => handleDelete(i.email)}
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
                        <i className="bi bi-plus-circle me-2"></i>Nuevo invitado externo
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>Editar invitado externo
                      </>
                    )}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
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
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                    required
                  />
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
import React, { useEffect, useState } from 'react';
import { fetchCourts, createCourt, updateCourt, deleteCourt } from '../services/ApiService';
import Header from '../components/Header';

export default function AdminPistas() {
  const [pistas, setPistas] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', pista: null });
  const [form, setForm] = useState({ name: '', direccion: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCourts().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setPistas(data);
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (mode, pista = null) => {
    setModal({ open: true, mode, pista });
    setForm(pista ? { ...pista } : { name: '', direccion: '' });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', pista: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createCourt(form);
      setPistas([...pistas, res.data]);
    } else {
      const res = await updateCourt(modal.pista.id, form);
      setPistas(pistas.map(p => (p.id === res.data.id ? res.data : p)));
    }
    handleCloseModal();
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar esta pista?')) {
      await deleteCourt(id);
      setPistas(pistas.filter(p => p.id !== id));
    }
  };

  if (loading) return <p>Cargando pistas...</p>;

return (
 <div style={{ background: '#f6f8fa' }}>
     <Header adminHomeIcon={true} showLogout={false} />
     <div className="container py-4 flex-grow-1 d-flex justify-content-center align-items-start" style={{ minHeight: '80vh' }}>
    <div className="container py-4">
      <div
        className="card shadow-sm rounded-4"
        style={{
          maxWidth: 700,
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
            <i className="bi bi-grid-3x3-gap" style={{ color: '#0e2340', fontSize: 26 }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2 }}>
            Pistas
          </div>
          <div style={{ color: '#7e8594', fontSize: 15 }}>
            Gestiona las pistas disponibles en la comunidad.
          </div>
        </div>
        <button className="btn btn-success w-100 mb-3" onClick={() => handleOpenModal('add')}>
          <i className="bi bi-plus-circle me-2"></i>Nueva pista
        </button>
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: 120 }}>Nombre</th>
                <th style={{ minWidth: 180 }}>Dirección</th>
                <th style={{ minWidth: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pistas.map(p => (
                <tr key={p.id}>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{p.name}</td>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{p.direccion || '-'}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={() => handleOpenModal('edit', p)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(p.id)}
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
                        <i className="bi bi-plus-circle me-2"></i>Nueva pista
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>Editar pista
                      </>
                    )}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nombre"
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Dirección"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={handleCloseModal}
                  >
                    <i className="bi bi-x-circle me-1"></i> Cancelar
                  </button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    type="submit"
                  >
                    <i className="bi bi-check-circle me-1"></i> Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  </div>
);
}

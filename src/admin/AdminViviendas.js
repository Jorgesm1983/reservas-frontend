import React, { useEffect, useState } from 'react';
import { fetchViviendas, createVivienda, updateVivienda, deleteVivienda, fetchComunidades } from '../services/ApiService';
import Header from '../components/Header';
import { useCommunity } from '../context/CommunityContext';


export default function AdminViviendas() {
  const [viviendas, setViviendas] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', vivienda: null });
  const [form, setForm] = useState({ nombre: '' });
  const [loading, setLoading] = useState(true);
  
  const { selectedCommunity } = useCommunity();
  const [comunidades, setComunidades] = useState([selectedCommunity]);

  useEffect(() => {
  fetchComunidades().then(res => setComunidades(res.data.results || res.data));
}, []);


  useEffect(() => {
    setLoading(true);
    fetchViviendas(selectedCommunity).then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setViviendas(data);
      setLoading(false);
    });
  }, [selectedCommunity]);

  const defaultCommunityId =
  selectedCommunity && typeof selectedCommunity === 'object'
    ? selectedCommunity.id
    : selectedCommunity || '';

  const handleOpenModal = (mode, vivienda = null) => {
    setModal({ open: true, mode, vivienda });
    setForm(
      vivienda
        ? { nombre: vivienda.nombre, community: defaultCommunityId }
        : { nombre: '', community: defaultCommunityId }
    );
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', vivienda: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

const handleSubmit = async e => {
  e.preventDefault();
  const data = {
    nombre: form.nombre,
    community_id: form.community // OJO: debe ser community_id, no community
  };
  if (modal.mode === 'add') {
    const res = await createVivienda(data);
    setViviendas([...viviendas, res.data]);
  } else {
    const res = await updateVivienda(modal.vivienda.id, data);
    setViviendas(viviendas.map(v => (v.id === res.data.id ? res.data : v)));
  }
  handleCloseModal();
};

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar esta vivienda?')) {
      await deleteVivienda(id);
      setViviendas(viviendas.filter(v => v.id !== id));
    }
  };

  if (loading) return <p>Cargando viviendas...</p>;

return (
  <div style={{ background: '#f6f8fa'}}>
    <Header showHomeIcon={true} showLogout={false} adminHomeIcon={true} isStaff={true}/>
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
            <i className="bi bi-house-door" style={{ color: '#0e2340', fontSize: 26 }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2 }}>
            Viviendas
          </div>
          <div style={{ color: '#7e8594', fontSize: 15 }}>
            Gestiona las viviendas de la comunidad.
          </div>
        </div>
        <button className="btn btn-success w-100 mb-3" onClick={() => handleOpenModal('add')}>
          <i className="bi bi-plus-circle me-2"></i>Nueva vivienda
        </button>
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: 120 }}>Nombre</th>
                <th style={{ minWidth: 120 }}>Comunidad</th>
                <th style={{ minWidth: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {viviendas.map(v => (
                <tr key={v.id}>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{v.nombre}</td>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{v.community?.name || '-'}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleOpenModal('edit', v)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(v.id)}
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
                        <i className="bi bi-plus-circle me-2"></i>Nueva vivienda
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>Editar vivienda
                      </>
                    )}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                    required
                  />
                </div>
                <select
                className="form-select"
                name="community"
                value={form.community}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona comunidad</option>
                {comunidades.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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

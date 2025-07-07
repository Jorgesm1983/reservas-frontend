import React, { useEffect, useState } from 'react';
import { fetchComunidades, createComunidad, updateComunidad, deleteComunidad } from '../services/ApiService';
import Header from '../components/Header';

export default function AdminComunidades() {
  const [comunidades, setComunidades] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', comunidad: null });
  const [form, setForm] = useState({ name: '', direccion: '', code: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchComunidades().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setComunidades(data);
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (mode, comunidad = null) => {
    setModal({ open: true, mode, comunidad });
    setForm(comunidad ? { ...comunidad } : { name: '', direccion: '', code: '' });
    setMsg('');
  };

  const handleCloseModal = () => {
    setModal({ open: false, mode: 'add', comunidad: null });
    setMsg('');
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.direccion.trim()) {
      setMsg('Nombre y dirección son obligatorios.');
      return;
    }
    if (form.code && form.code.length < 6) {
      setMsg('El código debe tener al menos 6 caracteres.');
      return;
    }
    try {
      if (modal.mode === 'add') {
        const res = await createComunidad(form);
        setComunidades([...comunidades, res.data]);
      } else {
        const res = await updateComunidad(modal.comunidad.id, form);
        setComunidades(comunidades.map(c => (c.id === res.data.id ? res.data : c)));
      }
      handleCloseModal();
    } catch (err) {
      setMsg('Error al guardar la comunidad. ¿Quizá el código ya existe?');
    }
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar esta comunidad?')) {
      await deleteComunidad(id);
      setComunidades(comunidades.filter(c => c.id !== id));
    }
  };

  // Utilidad para copiar código al portapapeles
  const handleCopyCode = code => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setMsg('¡Código copiado al portapapeles!');
    setTimeout(() => setMsg(''), 1500);
  };

  // Generador simple de código aleatorio (puedes mejorarlo en backend)
  const generarCodigo = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm(f => ({ ...f, code }));
  };

  if (loading) return <p>Cargando comunidades...</p>;

  return (
    <div style={{ background: '#f6f8fa' }}>
      <Header showHomeIcon={true} showLogout={false} adminHomeIcon={true} isStaff={true} />
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
              <i className="bi bi-building" style={{ color: '#0e2340', fontSize: 26 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2 }}>
              Comunidades
            </div>
            <div style={{ color: '#7e8594', fontSize: 15 }}>
              Gestiona las comunidades registradas en el sistema.
            </div>
          </div>
          <button className="btn btn-success w-100 mb-3" onClick={() => handleOpenModal('add')}>
            <i className="bi bi-plus-circle me-2"></i>Nueva comunidad
          </button>
          {msg && <div className="alert alert-info py-2">{msg}</div>}
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: 140 }}>Nombre</th>
                  <th style={{ minWidth: 180 }}>Dirección</th>
                  <th style={{ minWidth: 130 }}>Código</th>
                  <th style={{ minWidth: 110 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comunidades.map(c => (
                  <tr key={c.id}>
                    <td className="text-break" style={{ verticalAlign: 'middle' }}>{c.name}</td>
                    <td className="text-break" style={{ verticalAlign: 'middle' }}>{c.direccion}</td>
                    <td className="text-break" style={{ verticalAlign: 'middle' }}>
                      {c.code ? (
                        <span className="d-inline-flex align-items-center">
                          <span className="fw-bold me-2">{c.code}</span>
                          <button
                            type="button"
                            className="btn btn-light btn-sm px-2 py-0"
                            title="Copiar código"
                            onClick={() => handleCopyCode(c.code)}
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        </span>
                      ) : (
                        <span className="text-muted">Sin código</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleOpenModal('edit', c)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(c.id)}
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
                          <i className="bi bi-plus-circle me-2"></i>Nueva comunidad
                        </>
                      ) : (
                        <>
                          <i className="bi bi-pencil me-2"></i>Editar comunidad
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
                      required
                    />
                    <div className="input-group mb-2">
                      <input
                        className="form-control"
                        name="code"
                        value={form.code || ''}
                        onChange={handleChange}
                        placeholder="Código de comunidad (mín. 6 caracteres)"
                        minLength={6}
                        maxLength={20}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        title="Generar código aleatorio"
                        onClick={generarCodigo}
                        tabIndex={-1}
                      >
                        <i className="bi bi-shuffle"></i>
                      </button>
                    </div>
                    <small className="text-muted">
                      El código debe ser único y difícil de adivinar. Usa el botón para generar uno seguro.
                    </small>
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

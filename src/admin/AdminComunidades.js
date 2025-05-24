import React, { useEffect, useState } from 'react';
import { fetchComunidades, createComunidad, updateComunidad, deleteComunidad } from '../services/ApiService';

export default function AdminComunidades() {
  const [comunidades, setComunidades] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', comunidad: null });
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(true);

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
    setForm(comunidad ? { ...comunidad } : { name: '' });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', comunidad: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createComunidad(form);
      setComunidades([...comunidades, res.data]);
    } else {
      const res = await updateComunidad(modal.comunidad.id, form);
      setComunidades(comunidades.map(c => (c.id === res.data.id ? res.data : c)));
    }
    handleCloseModal();
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar esta comunidad?')) {
      await deleteComunidad(id);
      setComunidades(comunidades.filter(c => c.id !== id));
    }
  };

  if (loading) return <p>Cargando comunidades...</p>;

  return (
    <div className="container mt-4">
      <h3>Comunidades</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nueva comunidad</button>
      <table className="table table-striped">
        <thead>
          <tr><th>Nombre</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {comunidades.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', c)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Eliminar</button>
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
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nueva comunidad' : 'Editar comunidad'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
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

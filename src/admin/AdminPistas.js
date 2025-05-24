import React, { useEffect, useState } from 'react';
import { fetchCourts, createCourt, updateCourt, deleteCourt } from '../services/ApiService';

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
    <div className="container mt-4">
      <h3>Pistas</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nueva pista</button>
      <table className="table table-striped">
        <thead>
          <tr><th>Nombre</th><th>Dirección</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {pistas.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.direccion}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', p)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Eliminar</button>
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
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nueva pista' : 'Editar pista'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
                <input className="form-control mb-2" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" />
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

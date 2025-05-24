import React, { useEffect, useState } from 'react';
import { fetchViviendas, createVivienda, updateVivienda, deleteVivienda } from '../services/ApiService';

export default function AdminViviendas() {
  const [viviendas, setViviendas] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', vivienda: null });
  const [form, setForm] = useState({ nombre: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchViviendas().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setViviendas(data);
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (mode, vivienda = null) => {
    setModal({ open: true, mode, vivienda });
    setForm(vivienda ? { ...vivienda } : { nombre: '' });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', vivienda: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createVivienda(form);
      setViviendas([...viviendas, res.data]);
    } else {
      const res = await updateVivienda(modal.vivienda.id, form);
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
    <div className="container mt-4">
      <h3>Viviendas</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nueva vivienda</button>
      <table className="table table-striped">
        <thead>
          <tr><th>Nombre</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {viviendas.map(v => (
            <tr key={v.id}>
              <td>{v.nombre}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', v)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Eliminar</button>
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
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nueva vivienda' : 'Editar vivienda'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
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

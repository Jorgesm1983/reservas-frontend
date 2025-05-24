import React, { useEffect, useState } from 'react';
// Cambia estos imports por los servicios de la entidad correspondiente
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/ApiService';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', user: null });
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', is_staff: false });
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
    useEffect(() => {
    setLoading(true); // <-- Importante: activa loading antes de pedir datos
    fetchUsers()
        .then(res => {
        if (Array.isArray(res.data)) {
            setUsuarios(res.data);
        } else if (Array.isArray(res.data.results)) {
            setUsuarios(res.data.results);
        } else {
            setUsuarios([]);
        }
        setLoading(false); // <-- Desactiva loading cuando termina la carga
        })
        .catch(error => {
        setUsuarios([]);
        setLoading(false); // <-- Desactiva loading también si hay error
        // (Opcional) puedes mostrar un mensaje de error aquí
        });
    }, []);

  // Abrir modal de alta o edición
  const handleOpenModal = (mode, user = null) => {
    setModal({ open: true, mode, user });
    setForm(user ? { ...user } : { nombre: '', apellido: '', email: '', is_staff: false });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', user: null });

  // Actualizar formulario
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Guardar alta o edición
  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createUser(form);
      setUsuarios([...usuarios, res.data]);
    } else {
      const res = await updateUser(modal.user.id, form);
      setUsuarios(usuarios.map(u => (u.id === res.data.id ? res.data : u)));
    }
    handleCloseModal();
  };

  // Eliminar registro
  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      await deleteUser(id);
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="container mt-4">
      <h3>Usuarios</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nuevo usuario</button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Staff</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.apellido}</td>
              <td>{u.email}</td>
              <td>{u.is_staff ? 'Sí' : 'No'}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', u)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal para alta/edición */}
      {modal.open && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: '#0003' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nuevo usuario' : 'Editar usuario'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
                <input className="form-control mb-2" name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" required />
                <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="is_staff" checked={form.is_staff} onChange={handleChange} id="staffCheck" />
                  <label className="form-check-label" htmlFor="staffCheck">Staff</label>
                </div>
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

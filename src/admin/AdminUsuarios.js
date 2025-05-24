import React, { useEffect, useState } from 'react';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchViviendas,
  fetchComunidades,
  changeUserPassword
} from '../services/ApiService';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [viviendas, setViviendas] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', user: null });
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    is_staff: false,
    vivienda: '',
    comunidad: ''
  });
  const [loading, setLoading] = useState(true);

  // Para el cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    setLoading(true);
    fetchUsers().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setUsuarios(data);
      setLoading(false);
    });
    fetchViviendas().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setViviendas(data);
    });
    fetchComunidades().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setComunidades(data);
    });
  }, []);

  // Abrir modal de alta o edición
  const handleOpenModal = (mode, user = null) => {
    setModal({ open: true, mode, user });
    setForm(user ? {
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      is_staff: user.is_staff || false,
      vivienda: user.vivienda?.id || '',
      comunidad: user.community?.id || ''
    } : {
      nombre: '',
      apellido: '',
      email: '',
      is_staff: false,
      vivienda: '',
      comunidad: ''
    });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', user: null });

  // Actualizar formulario
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Guardar alta o edición
  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      is_staff: form.is_staff,
      vivienda_id: form.vivienda || null,
      community_id: form.comunidad || null
    };
    if (modal.mode === 'add') {
      const res = await createUser(payload);
      setUsuarios([...usuarios, res.data]);
    } else {
      const res = await updateUser(modal.user.id, payload);
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

  // Cambiar contraseña
  const handleChangePassword = async (userId) => {
    if (!newPassword) return;
    await changeUserPassword(userId, { new_password: newPassword });
    setShowPasswordModal(false);
    setNewPassword('');
    alert('Contraseña actualizada');
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="container mt-4">
      <h3>Usuarios</h3>
      <button className="btn btn-success mb-2" onClick={() => handleOpenModal('add')}>Nuevo usuario</button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre completo</th>
            <th>Email</th>
            <th>Vivienda</th>
            <th>Comunidad</th>
            <th>Staff</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.nombre} {u.apellido}</td>
              <td>{u.email}</td>
              <td>{u.vivienda?.nombre || '-'}</td>
              <td>{u.community?.name || '-'}</td>
              <td>{u.is_staff ? 'Sí' : 'No'}</td>
              <td>
                <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenModal('edit', u)}>Editar</button>
                <button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(u.id)}>Eliminar</button>
                <button className="btn btn-warning btn-sm" onClick={() => { setModal({ ...modal, user: u }); setShowPasswordModal(true); }}>Cambiar contraseña</button>
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
                <h5 className="modal-title">{modal.mode === 'add' ? 'Nuevo usuario' : 'Editar usuario'}</h5>
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
                <input
                  className="form-control mb-2"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Apellido"
                />
                <input
                  className="form-control mb-2"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  required
                />
                <select
                  className="form-select mb-2"
                  name="vivienda"
                  value={form.vivienda}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona vivienda</option>
                  {viviendas.map(v => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
                <select
                  className="form-select mb-2"
                  name="comunidad"
                  value={form.comunidad}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona comunidad</option>
                  {comunidades.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="is_staff"
                    checked={form.is_staff}
                    onChange={handleChange}
                    id="staffCheck"
                  />
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

      {/* Modal para cambio de contraseña */}
      {showPasswordModal && modal.user && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: '#0003' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={e => { e.preventDefault(); handleChangePassword(modal.user.id); }}>
              <div className="modal-header">
                <h5 className="modal-title">Cambiar contraseña para {modal.user.nombre} {modal.user.apellido}</h5>
                <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" type="button" onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                <button className="btn btn-primary" type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

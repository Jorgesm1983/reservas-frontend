import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useCommunity } from '../context/CommunityContext';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchViviendas,
  fetchComunidades,
  changeUserPassword
} from '../services/ApiService';

// Utilidad para extraer el ID de comunidad de forma segura
// Utilidad para extraer el ID de comunidad
function getCommunityId(selectedCommunity) {
  if (!selectedCommunity) return '';
  if (typeof selectedCommunity === 'object' && selectedCommunity !== null) {
    return selectedCommunity.id;
  }
  return selectedCommunity;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const { selectedCommunity } = useCommunity();
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

  // Filtros y ordenación
  const [viviendaFiltro, setViviendaFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState({ campo: 'nombre', asc: true });

  // Cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
    setLoading(true);
    const communityId = getCommunityId(selectedCommunity);
    

    fetchUsers(communityId).then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setUsuarios(data);
      setLoading(false);
    });
    fetchViviendas(communityId).then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setViviendas(data);
    });
    fetchComunidades().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setComunidades(data);
    });
  }, [selectedCommunity]);

  const defaultCommunityId =
    selectedCommunity && typeof selectedCommunity === 'object'
      ? selectedCommunity.id
      : selectedCommunity || '';



  const handleOpenModal = (mode, user = null) => {
    setModal({ open: true, mode, user });
    setForm(user ? {
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      is_staff: user.is_staff || false,
      vivienda: user.vivienda?.id || '',
      comunidad: user.community?.id || defaultCommunityId
    } : {
      nombre: '',
      apellido: '',
      email: '',
      is_staff: false,
      vivienda: '',
      comunidad: defaultCommunityId
    });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', user: null });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      await deleteUser(id);
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  const handleChangePassword = async (userId) => {
    if (!newPassword) return;
    await changeUserPassword(userId, { new_password: newPassword });
    setShowPasswordModal(false);
    setNewPassword('');
    alert('Contraseña actualizada');
  };

  // --- Filtro y ordenación ---
  const usuariosFiltrados = usuarios
    .filter(u =>
      (!viviendaFiltro || String(u.vivienda?.id) === String(viviendaFiltro)) &&
      (
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      )
    )
    .sort((a, b) => {
      const campo = orden.campo;
      let va = a[campo], vb = b[campo];
      if (campo === 'vivienda') {
        va = a.vivienda?.nombre || '';
        vb = b.vivienda?.nombre || '';
      }
      if (campo === 'comunidad') {
        va = a.community?.name || '';
        vb = b.community?.name || '';
      }
      if (va < vb) return orden.asc ? -1 : 1;
      if (va > vb) return orden.asc ? 1 : -1;
      return 0;
    });

  const handleOrdenar = campo => {
    setOrden(o => ({
      campo,
      asc: o.campo === campo ? !o.asc : true
    }));
  };

  if (loading) return <p className="text-center mt-5">Cargando usuarios...</p>;

  return (
    <div style={{ background: '#f6f8fa' }}>
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
          <div className="mb-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                background: '#c6ff00',
                borderRadius: 50,
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                boxShadow: '0 2px 8px rgba(198,255,0,0.13)'
              }}
            >
              <i className="bi bi-people" style={{ color: '#0e2340', fontSize: 26 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2, letterSpacing: 0.2 }}>
              Usuarios
            </div>
            <div style={{ color: '#7e8594', fontSize: 15, textAlign: 'center', maxWidth: 450, marginTop: 2 }}>
              Gestiona los usuarios registrados, sus roles y asignaciones.
            </div>
          </div>
          {/* Filtros */}
          <div className="mb-3 d-flex gap-3 align-items-center">
            <select
              className="form-select"
              style={{ maxWidth: 220 }}
              value={viviendaFiltro}
              onChange={e => setViviendaFiltro(e.target.value)}
            >
              <option value="">Todas las viviendas</option>
              {viviendas.map(v => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
            <input
              className="form-control"
              style={{ maxWidth: 250 }}
              type="text"
              placeholder="Buscar por nombre, apellido o email"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <button className="btn btn-success w-100 mb-3" onClick={() => handleOpenModal('add')}>
            <i className="bi bi-person-plus me-2"></i>Nuevo usuario
          </button>
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: 120, cursor: 'pointer' }} onClick={() => handleOrdenar('nombre')}>Nombre completo</th>
                  <th style={{ minWidth: 180, cursor: 'pointer' }} onClick={() => handleOrdenar('email')}>Email</th>
                  <th style={{ minWidth: 120, cursor: 'pointer' }} onClick={() => handleOrdenar('vivienda')}>Vivienda</th>
                  <th style={{ minWidth: 120, cursor: 'pointer' }} onClick={() => handleOrdenar('comunidad')}>Comunidad</th>
                  <th style={{ minWidth: 60 }}>Staff</th>
                  <th style={{ minWidth: 130 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map(u => (
                  <tr key={u.id}>
                    <td className="text-break" style={{ verticalAlign: 'middle', maxWidth: 120 }}>
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="text-break" style={{ verticalAlign: 'middle', maxWidth: 180 }}>
                      {u.email}
                    </td>
                    <td className="text-break" style={{ verticalAlign: 'middle', maxWidth: 120 }}>
                      {u.vivienda?.nombre || '-'}
                    </td>
                    <td className="text-break" style={{ verticalAlign: 'middle', maxWidth: 120 }}>
                      {u.community?.name || '-'}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {u.is_staff ? 'Sí' : 'No'}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-info btn-sm"
                          onClick={() => handleOpenModal('edit', u)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(u.id)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => { setModal({ ...modal, user: u }); setShowPasswordModal(true); }}
                          title="Cambiar contraseña"
                        >
                          <i className="bi bi-key text-dark"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Modal de alta/edición */}
          {modal.open && (
            <div className="modal show d-block" tabIndex="-1" style={{ background: '#0003' }}>
              <div className="modal-dialog">
                <form className="modal-content" onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {modal.mode === 'add' ? (
                        <>
                          <i className="bi bi-person-plus me-2"></i>Nuevo usuario
                        </>
                      ) : (
                        <>
                          <i className="bi bi-pencil me-2"></i>Editar usuario
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
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                    />
                    <select
                      className="form-select mb-2"
                      name="vivienda"
                      value={form.vivienda}
                      onChange={handleChange}
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
                        id="is_staff"
                        checked={form.is_staff}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="is_staff">
                        Es staff
                      </label>
                    </div>
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
          {/* Modal de cambio de contraseña */}
          {showPasswordModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ background: '#0003' }}>
              <div className="modal-dialog">
                <form className="modal-content" onSubmit={e => { e.preventDefault(); handleChangePassword(modal.user.id); }}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <i className="bi bi-key me-2"></i>Cambiar contraseña
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <input
                      className="form-control mb-2"
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
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

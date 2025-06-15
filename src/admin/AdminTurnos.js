import React, { useEffect, useState } from 'react';
import { fetchTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot, fetchComunidades } from '../services/ApiService';
import Header from '../components/Header';
import { useCommunity } from '../context/CommunityContext';


export default function AdminTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', turno: null });
  const [form, setForm] = useState({ slot: '', start_time: '', end_time: '', community: '' });
  const [loading, setLoading] = useState(true);
  
  const { selectedCommunity } = useCommunity();
  const [comunidades, setComunidades] = useState([selectedCommunity]);
  

  useEffect(() => {
  fetchComunidades().then(res => setComunidades(res.data.results || res.data))
  // fetchTimeSlots().then(res => setTurnos(res.data.results || res.data));
}, []); 


  useEffect(() => {
    setLoading(true);
    fetchTimeSlots(selectedCommunity).then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTurnos(data);
      setLoading(false);
    });
  }, [selectedCommunity]);

  const defaultCommunityId =
  selectedCommunity && typeof selectedCommunity === 'object'
    ? selectedCommunity.id
    : selectedCommunity || '';

  const handleOpenModal = (mode, turno = null) => {
    setModal({ open: true, mode });
    if (turno) {
      setForm({
        ...turno,
        community: defaultCommunityId
      });
    } else {
      setForm({ slot: '', start_time: '', end_time: '', community: defaultCommunityId });
    }
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', turno: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      community: form.community || null
    };

    const action = modal.mode === 'add' 
      ? createTimeSlot(data) 
      : updateTimeSlot(form.id, data);

    action.then(() => {
      fetchTimeSlots().then(res => setTurnos(res.data.results || res.data));
      handleCloseModal();
    }).catch(error => {
      console.error("Error guardando turno:", error.response?.data);
    });
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar este turno?')) {
      await deleteTimeSlot(id);
      fetchTimeSlots(selectedCommunity).then(res => setTurnos(res.data.results || res.data));
    }
  };

  if (loading) return <p>Cargando turnos...</p>;

  return (
  <div style={{ background: '#f6f8fa' }}>
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
            <i className="bi bi-clock-history" style={{ color: '#0e2340', fontSize: 26 }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2 }}>
            Turnos
          </div>
          <div style={{ color: '#7e8594', fontSize: 15 }}>
            Gestiona los turnos y horarios disponibles para reservas.
          </div>
        </div>
        <button className="btn btn-success w-100 mb-3" onClick={() => handleOpenModal('add')}>
          <i className="bi bi-plus-circle me-2"></i>Nuevo turno
        </button>
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: 80 }}>Slot</th>
                <th style={{ minWidth: 90 }}>Inicio</th>
                <th style={{ minWidth: 90 }}>Fin</th>
                <th style={{ minWidth: 90}}>Comunidad</th> {/* Nueva columna */}
                <th style={{ minWidth: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map(t => (
                <tr key={t.id}>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{t.slot}</td>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{t.start_time}</td>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{t.end_time}</td>
                  <td>{t.community?.name || '-'}</td> {/* Mostrar comunidad */}
                  <td>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={() => handleOpenModal('edit', t)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(t.id)}
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
                        <i className="bi bi-plus-circle me-2"></i>Nuevo turno
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>Editar turno
                      </>
                    )}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    name="slot"
                    value={form.slot}
                    onChange={handleChange}
                    placeholder="Nombre del turno"
                  />
                  <input
                    className="form-control mb-2"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    placeholder="Inicio (HH:MM:SS)"
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    placeholder="Fin (HH:MM:SS)"
                    required
                  />
                </div>
                <label className="form-label">Comunidad</label>
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
);
}
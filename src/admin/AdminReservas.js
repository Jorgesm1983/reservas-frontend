import React, { useEffect, useState } from 'react';
import { fetchReservations, createReservation, updateReservation, deleteReservation, fetchCourts, fetchTimeSlots } from '../services/ApiService';
import Header from '../components/Header';
import { useCommunity } from '../context/CommunityContext';


// Utilidad para extraer el ID de comunidad de forma segura
function getCommunityId(selectedCommunity) {
  if (!selectedCommunity) return '';
  if (typeof selectedCommunity === 'object' && selectedCommunity !== null) {
    return selectedCommunity.id;
  }
  return selectedCommunity;
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', reserva: null });
  const [form, setForm] = useState({ court: '', timeslot: '', date: '' });
  const [loading, setLoading] = useState(true);
  const { selectedCommunity } = useCommunity();

  useEffect(() => {
    setLoading(true);
    const communityId = getCommunityId(selectedCommunity);

    // Construye un objeto plano de filtros para reservas
    const params = communityId ? { community: communityId } : {};

    fetchReservations(params).then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setReservas(data);
      setLoading(false);
    });
    fetchCourts(communityId).then(res => setCourts(Array.isArray(res.data) ? res.data : res.data.results || []));
    fetchTimeSlots(communityId).then(res => setSlots(Array.isArray(res.data) ? res.data : res.data.results || []));
  }, [selectedCommunity]);

  const handleOpenModal = (mode, reserva = null) => {
    setModal({ open: true, mode, reserva });
    setForm(reserva
      ? { court: reserva.court.id, timeslot: reserva.timeslot.id, date: reserva.date }
      : { court: '', timeslot: '', date: '' });
  };

  const handleCloseModal = () => setModal({ open: false, mode: 'add', reserva: null });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (modal.mode === 'add') {
      const res = await createReservation(form);
      setReservas([...reservas, res.data]);
    } else {
      const res = await updateReservation(modal.reserva.id, form);
      setReservas(reservas.map(r => (r.id === res.data.id ? res.data : r)));
    }
    handleCloseModal();
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que quieres eliminar esta reserva?')) {
      await deleteReservation(id);
      setReservas(reservas.filter(r => r.id !== id));
    }
  };

  if (loading) return <p>Cargando reservas...</p>;

  return (
  <div style={{ background: '#f6f8fa'}}>
    <Header showHomeIcon={true} showLogout={false} adminHomeIcon={true} isStaff={true}/>
    <div className="container py-4 flex-grow-1 d-flex justify-content-center align-items-start" style={{ minHeight: '80vh' }}>
      <div
        className="card shadow-sm rounded-4"
        style={{
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem 1.5rem 1.5rem',
          boxShadow: '0 4px 20px rgba(31,38,135,0.08)',
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
            <i className="bi bi-calendar2-week" style={{ color: '#0e2340', fontSize: 26 }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#0e2340', marginBottom: 2, letterSpacing: 0.2 }}>
            Reservas
          </div>
          <div style={{ color: '#7e8594', fontSize: 15, textAlign: 'center', maxWidth: 450, marginTop: 2 }}>
            Gestiona todas las reservas de la comunidad.
          </div>
        </div>
        
        <button 
          className="btn btn-success w-100 mb-3" 
          onClick={() => handleOpenModal('add')}
        >
          <i className="bi bi-plus-circle me-2"></i>Nueva reserva
        </button>
        
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: 120 }}>Pista</th>
                <th style={{ minWidth: 140 }}>Turno</th>
                <th style={{ minWidth: 100 }}>Fecha</th>
                <th style={{ minWidth: 110 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => (
                <tr key={r.id}>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>{r.court?.name}</td>
                  <td className="text-break" style={{ verticalAlign: 'middle' }}>
                    {r.timeslot?.start_time} - {r.timeslot?.end_time}
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>{r.date}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={() => handleOpenModal('edit', r)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(r.id)}
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

        {/* Modal */}
        {modal.open && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: '#0003' }}>
            <div className="modal-dialog">
              <form className="modal-content" onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modal.mode === 'add' ? (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>Nueva reserva
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>Editar reserva
                      </>
                    )}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <select 
                    className="form-select mb-2" 
                    name="court" 
                    value={form.court} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Selecciona pista</option>
                    {courts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select 
                    className="form-select mb-2" 
                    name="timeslot" 
                    value={form.timeslot} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Selecciona turno</option>
                    {slots.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.start_time} - {s.end_time}
                      </option>
                    ))}
                  </select>
                  <input 
                    className="form-control mb-2" 
                    type="date" 
                    name="date" 
                    value={form.date} 
                    onChange={handleChange} 
                    required 
                  />
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
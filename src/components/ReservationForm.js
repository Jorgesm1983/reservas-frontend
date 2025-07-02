import React, { useState, useEffect, useRef } from 'react';

import { fetchCourts, fetchTimeSlots, createReservation} from '../services/ApiService';
import Header from './Header';
import { useCommunity } from '../context/CommunityContext';
import { fetchOcupados } from '../services/ApiService';

function getReservaWindow() {
  const now = new Date();
  const horaActual = now.getHours();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minDate = new Date(today);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + (horaActual >= 8 ? 2 : 1));
  return { min: minDate, max: maxDate };
}

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Genera los días disponibles entre min y max (incluidos)
function getDiasDisponibles(minDate, maxDate) {
  const dias = [];
  let d = new Date(minDate);
  while (d <= maxDate) {
    dias.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dias;
}




export default function ReservationForm() {
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [dateLimits, setDateLimits] = useState(getReservaWindow());
  const [ocupados, setOcupados] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successTimeout = useRef(null);
  const { selectedCommunity } = useCommunity();

  


  useEffect(() => {
    const interval = setInterval(() => setDateLimits(getReservaWindow()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const communityId = selectedCommunity?.id;
     console.log('useEffect se ejecutó correctamente');
    console.log('Community ID seleccionado:', communityId);
    fetchCourts(selectedCommunity?.id).then(res => {
      setCourts(res.data);
      // Si solo hay una pista, selecciónala automáticamente
      if (res.data.length === 1) {
        setSelectedCourt(String(res.data[0].id));
      }
    });
    fetchTimeSlots(selectedCommunity?.id).then(res => setSlots(res.data));
  }, [selectedCommunity]);

 useEffect(() => {
  const cargarOcupadosDia = async () => {
    setOcupados([]);
    setSelectedSlot('');
    if (selectedDate && selectedCourt) {
      const params = {
        court: selectedCourt,
        date: formatDateLocal(selectedDate)
      };
      // console.log("Parámetros enviados a fetchOcupados:", params);
      try {
        const ocupadosIds = await fetchOcupados(params); // Debe devolver un array de IDs
        // console.log("Horarios ocupados para esta pista y día:", ocupadosIds);
        setOcupados(ocupadosIds.map(String));
      } catch (err) {
        setOcupados([]);
      }
    }
  };
  cargarOcupadosDia();
}, [selectedDate, selectedCourt]);

  useEffect(() => {
    if (selectedSlot && ocupados.includes(selectedSlot)) {
      setSelectedSlot('');
    }
  }, [ocupados, selectedSlot]);

  const diasDisponibles = getDiasDisponibles(dateLimits.min, dateLimits.max);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      await createReservation({
        court: parseInt(selectedCourt, 10),
        date: formatDateLocal(selectedDate),
        timeslot: parseInt(selectedSlot, 10)
      });
      setSuccessMessage('✅ Pista reservada con éxito!');
      setSelectedCourt('');
      setSelectedSlot('');
      setSelectedDate(null);
      setOcupados([]);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          setError('⛔ ' + (error.response.data.error || error.response.data.detail));
        } else if (error.response.data?.error) {
          setError('⚠️ Error: ' + error.response.data.error);
        } else if (error.response.data?.non_field_errors) {
          setError('⛔ ' + error.response.data.non_field_errors[0]);
        } else {
          setError('⚠️ Error: ' + (error.response.data.detail || 'Error desconocido'));
        }
      } else {
        setError('🚨 Error de conexión - verifica tu conexión a internet');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      successTimeout.current = setTimeout(() => {
        setSuccessMessage('');
      }, 3000); // 3 segundos
    }
    return () => {
      if (successTimeout.current) clearTimeout(successTimeout.current);
    };
  }, [successMessage]);

  const now = new Date();

    const slotsLibres = slots.filter(slot => {
      if (ocupados.includes(String(slot.id))) return false;
      if (!selectedDate) return true; // Si no hay fecha seleccionada, muestra todos

      // Construye la fecha-hora de fin del turno
      const [h, m] = slot.end_time.split(":");
      const finTurno = new Date(selectedDate);
      finTurno.setHours(Number(h), Number(m), 0, 0);

      // Si la fecha seleccionada es hoy, solo muestra turnos cuyo fin es posterior a ahora
      const isToday = selectedDate.toDateString() === now.toDateString();
      if (isToday) {
        return finTurno > now;
      }
      // Si la fecha es futura, muestra todos
      return true;
    });
  const slotsOcupados = slots.filter(slot => {
        if (!ocupados.includes(String(slot.id))) return false;
      if (!selectedDate) return true; // Si no hay fecha seleccionada, muestra todos

      // Construye la fecha-hora de fin del turno
      const [h, m] = slot.end_time.split(":");
      const finTurno = new Date(selectedDate);
      finTurno.setHours(Number(h), Number(m), 0, 0);

      // Si la fecha seleccionada es hoy, solo muestra turnos cuyo fin es posterior a ahora
      const isToday = selectedDate.toDateString() === now.toDateString();
      if (isToday) {
        return finTurno > now;
      }
      // Si la fecha es futura, muestra todos
      return true;
    });

            return (
              <div style={{background: '#f6f8fa' }}>
                <Header showHomeIcon={true} showLogout={false} />
                <div className="container py-3 flex-grow-1" style={{ flex: 1, maxWidth: 480 }}>
                        <div className="card-welcome mb-4" style={{
        maxWidth: 420,
        margin: '0 auto',
        padding: '1.5rem 1.2rem 1.2rem 1.2rem',
        background: '#fff',
        boxShadow: "0 4px 20px rgba(31,38,135,0.08)",
          borderTop: "3px solid #c6ff00"
      }}>
                    <div className="card-reserva-header" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 18
          }}>
            <div style={{
              background: '#c6ff00',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              boxShadow: '0 2px 8px rgba(198,255,0,0.13)'
            }}>
              <i className="bi bi-calendar2-plus" style={{
                color: '#0e2340',
                fontSize: 26
              }}></i>
            </div>
            <div style={{
              fontWeight: 700,
              fontSize: 20,
              color: '#0e2340',
              marginBottom: 2,
              letterSpacing: 0.2
            }}>
              Nueva reserva
            </div>
            <div style={{
              color: '#7e8594',
              fontSize: 15,
              textAlign: 'center',
              maxWidth: 290,
              marginTop: 2
            }}>
              Elige fecha, pista y horario para reservar tu partido
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Fecha</label>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 8 }}>
                {diasDisponibles.map(dia => (
                  <button
                    key={dia.toISOString()}
                    type="button"
                    className={`btn-dia${selectedDate && dia.toDateString() === selectedDate.toDateString() ? ' selected' : ''}`}
                    onClick={() => setSelectedDate(new Date(dia))}
                  >
                    {dia.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Pista</label>
              <select
                className="form-select"
                value={selectedCourt}
                onChange={e => setSelectedCourt(e.target.value)}
                required
                disabled={courts.length === 1} // Deshabilita si solo hay una pista
              >
                <option value="">Selecciona pista</option>
                {courts.map(court => (
                  <option key={court.id} value={court.id}>{court.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Horario</label>
              <select
                className="form-select"
                value={selectedSlot}
                onChange={e => setSelectedSlot(e.target.value)}
                required
                disabled={!selectedCourt || !selectedDate}
              >
                <option value="">Selecciona horario</option>
                {slotsLibres.length > 0 && (
                  <optgroup label="Horarios disponibles">
                    {slotsLibres.map(slot => (
                      <option key={slot.id} value={slot.id}>
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </option>
                    ))}
                  </optgroup>
                )}
                {slotsOcupados.length > 0 && (
                  <optgroup label="No disponibles">
                    {slotsOcupados.map(slot => (
                      <option key={slot.id} value={slot.id} disabled>
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={isSubmitting}
              style={{ marginTop: 12 }}
            ><i className="bi bi-calendar-plus">   </i>
              {isSubmitting ? 'Reservando...' : 'Reservar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

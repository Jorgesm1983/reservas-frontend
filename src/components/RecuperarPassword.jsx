import React, { useState } from 'react';
import { solicitarResetPassword } from '../services/ApiService';
import { Link } from 'react-router-dom';

export default function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      await solicitarResetPassword({ email });
      setMensaje('Si el email existe, recibirás instrucciones para restablecer tu contraseña.');
    } catch (err) {
      setError('Error al solicitar el reseteo. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      {/* Logo y punto verde */}
      <div className="mb-4 text-center position-relative" style={{ width: '100%' }}>
        <span style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#fff',
          letterSpacing: '1px',
          position: 'relative',
          display: 'inline-block',
          paddingRight: 20
        }}>
          PistaReserva
          <span style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            background: '#c6ff00',
            borderRadius: '50%',
            position: 'absolute',
            right: -18,
            top: '50%',
            transform: 'translateY(-50%)'
          }}></span>
        </span>
      </div>
      <div className="mb-3 text-white-50 text-center" style={{ fontSize: '1.1rem' }}>
        Recuperar contraseña
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', maxWidth: 370 }}
        className="text-center"
        autoComplete="off"
      >
        <div className="mb-3">
          <input
            type="email"
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Introduce tu email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ background: 'rgba(255,255,255,0.95)' }}
          />
        </div>
        {mensaje && <div className="alert alert-success py-1">{mensaje}</div>}
        {error && <div className="alert alert-danger py-1">{error}</div>}
        <button
          type="submit"
          className="btn w-100 rounded-pill mb-2"
          style={{
            background: '#c6ff00',
            color: '#222',
            fontWeight: 'bold',
            border: 'none',
            fontSize: '1.1rem'
          }}
        >
          Enviar instrucciones
        </button>
        <div className="d-flex flex-column align-items-center mt-2">
          <Link to="/login" className="text-decoration-none mb-2" style={{ color: '#c6ff00', fontWeight: 500 }}>
            ¿Volver al login?
          </Link>
        </div>
      </form>
    </div>
  );
}

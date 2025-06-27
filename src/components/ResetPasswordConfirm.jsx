import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPasswordConfirm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      const response = await fetch('/api/password_reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error al cambiar la contraseña');
      setMensaje('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center" style={{ background: "#0e2340"}}>
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
        Restablece tu contraseña
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', maxWidth: 370 }}
        className="text-center"
        autoComplete="off"
      >
        <div className="mb-3">
          <input
            type="password"
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
}

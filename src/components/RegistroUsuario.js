import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function RegistroUsuario() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    vivienda_id: ''
  });
  const [viviendas, setViviendas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState({});

  useEffect(() => {
    fetch('/api/obtener_viviendas')
      .then(res => res.json())
      .then(data => setViviendas(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (!value.trim()) {
      setErrores(prev => ({ ...prev, [name]: 'Este campo es requerido' }));
    } else {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim() && key !== 'vivienda_id') {
        nuevosErrores[key] = 'Este campo es requerido';
      }
    });
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    try {
      const response = await fetch('/api/registro_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en el registro');
      setMensaje(data.message || 'Registro exitoso! Redirigiendo...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      setMensaje(error.message);
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
        Crea tu cuenta
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ width: '100%', maxWidth: 370 }}
        className="text-center"
        autoComplete="off"
      >
        <div className="mb-3">
          <input
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={{ background: 'rgba(255,255,255,0.95)' }}
            required
          />
          {errores.nombre && <small className="text-danger">{errores.nombre}</small>}
        </div>
        <div className="mb-3">
          <input
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            style={{ background: 'rgba(255,255,255,0.95)' }}
            required
          />
          {errores.apellido && <small className="text-danger">{errores.apellido}</small>}
        </div>
        <div className="mb-3">
          <input
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ background: 'rgba(255,255,255,0.95)' }}
            required
          />
          {errores.email && <small className="text-danger">{errores.email}</small>}
        </div>
        <div className="mb-3">
          <input
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ background: 'rgba(255,255,255,0.95)' }}
            required
          />
          {errores.password && <small className="text-danger">{errores.password}</small>}
        </div>
        <div className="mb-3">
          <select
            className="form-select form-select-lg rounded-pill border-0"
            name="vivienda_id"
            value={formData.vivienda_id}
            onChange={handleChange}
            style={{ background: 'rgba(255,255,255,0.95)' }}
            required
          >
            <option value="">Selecciona vivienda</option>
            {viviendas.map(v => (
              <option key={v.id} value={v.id}>{v.nombre}</option>
            ))}
          </select>
          {errores.vivienda_id && <small className="text-danger">{errores.vivienda_id}</small>}
        </div>
        {mensaje && <div className="alert alert-info">{mensaje}</div>}
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
          Registrarse
        </button>
        <div className="d-flex flex-column align-items-center mt-2">
          <Link to="/login" className="text-decoration-none mb-2" style={{ color: '#c6ff00', fontWeight: 500 }}>
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegistroUsuario;

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validación básica en tiempo real
    if (!value.trim()) {
      setErrores(prev => ({ ...prev, [name]: 'Este campo es requerido' }));
    } else {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación final antes de enviar
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
    <div className="container mt-5">
      <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Registro de Usuario</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Campos Nombre y Apellido */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className={`form-control ${errores.nombre && 'is-invalid'}`}
                    name="nombre"
                    placeholder="Ej: Juan"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                  {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    className={`form-control ${errores.apellido && 'is-invalid'}`}
                    name="apellido"
                    placeholder="Ej: Pérez"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                  />
                  {errores.apellido && <div className="invalid-feedback">{errores.apellido}</div>}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errores.email && 'is-invalid'}`}
                name="email"
                placeholder="tucorreo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errores.email && <div className="invalid-feedback">{errores.email}</div>}
            </div>

            {/* Contraseña */}
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className={`form-control ${errores.password && 'is-invalid'}`}
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                minLength="8"
                required
              />
              {errores.password && <div className="invalid-feedback">{errores.password}</div>}
            </div>

            {/* Selección de Vivienda */}
            <div className="mb-4">
              <label className="form-label">Vivienda</label>
              <select
                className={`form-select ${errores.vivienda_id && 'is-invalid'}`}
                name="vivienda_id"
                value={formData.vivienda_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione su vivienda</option>
                {viviendas.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
              {errores.vivienda_id && <div className="invalid-feedback">{errores.vivienda_id}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Registrarse
            </button>
          </form>

          <div className="mt-3 text-center">
            ¿Ya tienes cuenta? <Link to="/login" className="text-decoration-none">Inicia sesión</Link>
          </div>
          
          {mensaje && (
            <div className={`mt-3 alert ${mensaje.includes('exitoso') ? 'alert-success' : 'alert-danger'}`}>
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistroUsuario;

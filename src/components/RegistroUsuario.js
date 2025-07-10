import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function RegistroUsuario() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    codigo_comunidad: '',
    vivienda_id: ''
  });
  const [viviendas, setViviendas] = useState([]);
  const [codigoValido, setCodigoValido] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState({});
  const [comunidadNombre, setComunidadNombre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCodigoChange = async (e) => {
    const codigo = e.target.value;
    setFormData(prev => ({ ...prev, codigo_comunidad: codigo, vivienda_id: '' }));
    setCodigoValido(false);
    setViviendas([]);
    setComunidadNombre('');
    if (codigo.trim().length > 0) {
      const res = await fetch('/api/viviendas_por_codigo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo })
      });
      const data = await res.json();
      if (!data.error && Array.isArray(data.viviendas) && data.viviendas.length > 0) {
        setViviendas(data.viviendas);
        setCodigoValido(true);
        setComunidadNombre(data.comunidad_nombre || '');
        setErrores(prev => ({ ...prev, codigo_comunidad: '' }));
      } else {
        setViviendas([]);
        setComunidadNombre('');
        setCodigoValido(false);
        setErrores(prev => ({ ...prev, codigo_comunidad: data.error || 'Código no válido' }));
      }
    }
  };

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
    // Validación de contraseñas
    if (formData.password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
    }
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      nuevosErrores.email = 'Formato de email no válido';
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    try {
      // Excluye confirmPassword del objeto a enviar
      const { confirmPassword, ...payload } = formData;
      const response = await fetch('/api/registro_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en el registro');
      setMensaje(data.message || 'Registro exitoso! Redirigiendo...');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrores(prev => ({ ...prev, email: 'Formato de email no válido' }));
        return;
      }
    }
    setErrores(prev => ({ ...prev, [name]: '' }));
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
            onBlur={handleBlur}
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
            onBlur={handleBlur}
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
            onBlur={handleBlur}
            required
          />
          {errores.email && <small className="text-danger">{errores.email}</small>}
        </div>
        <div className="mb-3 position-relative">
          <input
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Contraseña"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <span
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#888",
              fontSize: 20,
              zIndex: 2,
            }}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
          </span>
          {errores.password && <small className="text-danger">{errores.password}</small>}
        </div>
        <div className="mb-3 position-relative">
          <input
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Confirmar contraseña"
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <span
            onClick={() => setShowConfirm(v => !v)}
            style={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#888",
              fontSize: 20,
              zIndex: 2,
            }}
            title={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <i className={`bi bi-eye${showConfirm ? "-slash" : ""}`}></i>
          </span>
          {errores.confirmPassword && <small className="text-danger">{errores.confirmPassword}</small>}
        </div>
        <div className="mb-3 position-relative">
          <input
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Código de comunidad"
            name="codigo_comunidad"
            value={formData.codigo_comunidad}
            onChange={handleCodigoChange}
            onBlur={handleBlur}
            required
            autoComplete="off"
          />
          {comunidadNombre && (
            <span
              className="position-absolute top-50 translate-middle-y end-0 me-3 px-3 py-1 text-dark"
              style={{
                fontSize: '1rem',
                borderRadius: '2rem',
                height: '70%',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'none',
                border: 'none',
                pointerEvents: 'none',
              }}
            >
              {comunidadNombre}
            </span>
          )}
          {errores.codigo_comunidad && <small className="text-danger">{errores.codigo_comunidad}</small>}
        </div>
        {codigoValido && (
          <div className="mb-3">
            <select
              className="form-select rounded-pill border-0"
              name="vivienda_id"
              value={formData.vivienda_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona vivienda</option>
              {viviendas.map(v => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
            {errores.vivienda_id && <small className="text-danger">{errores.vivienda_id}</small>}
          </div>
        )}
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

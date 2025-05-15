import React, { useState } from 'react';
import { login } from '../services/ApiService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Intentando login con:', nombre, password);

    try {
      const response = await login(nombre, password);

      console.log('Login correcto:', response.data);

      // Guarda datos adicionales si el backend los devuelve
      if (response.data.nombre) {
        localStorage.setItem('nombre', response.data.nombre);
      }
      if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id);
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      console.log('Tokens guardados:', {
        accessToken: localStorage.getItem('access'),
        refreshToken: localStorage.getItem('refresh'),
      });

      navigate('/');
    } catch (err) {
      let errorMessage = 'Usuario o contraseña incorrectos';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.detail || errorMessage;
      }
      setError(errorMessage);
      console.error('Error en login:', err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Usuario</label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='current-password'
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary">Entrar</button>
      </form>
      <Link to="/registro" className="btn btn-outline-secondary mt-3">
        Crear nueva cuenta
      </Link>
    </div>
  );
};

export default LoginPage;

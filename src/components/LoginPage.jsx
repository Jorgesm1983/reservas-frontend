import React, { useState } from 'react';
import { login } from '../services/ApiService';  // Usa la función de login de ApiService.js
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Intentando login con:', username, password); // 👈

    try {
      const response = await login(username, password); // Usa la función login desde ApiService.js

      console.log('Login correcto:', response.data); 

      localStorage.setItem('username', response.data.username);
      localStorage.setItem('user_id', response.data.user_id);

      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      console.log('Tokens guardados:', {
        accessToken: localStorage.getItem('access'),
        refreshToken: localStorage.getItem('refresh'),
      });

      navigate('/'); 
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      console.error('Error en login:', err); 
    }
  };

  return (
    <div className="container mt-5">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Usuario</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
    </div>
  );
};

export default LoginPage;

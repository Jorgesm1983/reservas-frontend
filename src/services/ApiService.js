// src/services/ApiService.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',  // ← /api/ es crítico
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  }
});

// Interceptor para tokens
API.interceptors.request.use(config => {
  // Token CSRF
  const csrfToken = document.cookie.match(/csrftoken=([\w-]+)/)?.[1];
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  // Token JWT
  const accessToken = localStorage.getItem('access');
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  
  return config;
});

API.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    return Promise.reject(error);
  }
);

// Endpoints
export const fetchCourts = () => API.get('courts/');
export const fetchTimeSlots = () => API.get('timeslots/');
export const fetchReservations = (params) => API.get('reservations/', { params });
export const createReservation = data => API.post('reservations/', data);
export const deleteReservation = id => API.delete(`reservations/${id}/`);  // ← Añadido
export const fetchUsers = () => API.get('users/');
export const createCourt = data => API.post('courts/', data);
export const createTimeSlot = data => API.post('timeslots/', data);
export const fetchViviendas = () => API.get('obtener_viviendas');
export const fetchUsuariosComunidad = () => API.get('usuarios-comunidad/');
export const invitarJugadores = (reservaId, data) => API.post(`/reservations/${reservaId}/invitar/`, data);
export const eliminarInvitacion = (invitacionId) => API.delete(`/invitaciones/${invitacionId}/`);
export const fetchInvitadosFrecuentes = () => API.get('invitaciones-frecuentes/');



// Autenticación
export const login = async (email, password) => {
  const response = await API.post('token/', { email, password });
  if (response.data.access) {
    localStorage.setItem('access', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
  }
  return response;
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');

  window.location.href = '/login';
};

API.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


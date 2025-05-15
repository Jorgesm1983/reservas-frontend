// src/services/ApiService.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',  // ← /api/ es crítico
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
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
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return config;
});

// Endpoints
export const fetchCourts = () => API.get('courts/');
export const fetchTimeSlots = () => API.get('timeslots/');
export const fetchReservations = () => API.get('reservations/');
export const createReservation = data => API.post('reservations/', data);
export const deleteReservation = id => API.delete(`reservations/${id}/`);  // ← Añadido
export const fetchUsers = () => API.get('users/');
export const createCourt = data => API.post('courts/', data);
export const createTimeSlot = data => API.post('timeslots/', data);

// Autenticación
export const login = async (nombre, password) => {
  const response = await API.post('token/', { nombre, password });
  if (response.data.access) {
    localStorage.setItem('access', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
  }
  return response;
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};

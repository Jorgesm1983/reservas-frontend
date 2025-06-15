// src/services/ApiService.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.37:8000/api/',  // ← /api/ es crítico
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


// Endpoints
export const fetchCourts = (communityId) =>
  communityId
    ? API.get(`courts/?community=${communityId}`)
    : API.get('courts/');
export const createCourt = (data) => API.post('courts/', data);
export const updateCourt = (id, data) => API.put(`courts/${id}/`, data);
export const deleteCourt = (id) => API.delete(`courts/${id}/`);

export const fetchTimeSlots = (communityId) =>
  communityId
    ? API.get(`timeslots/?community=${communityId}`)
    : API.get('timeslots/');
export const createTimeSlot = (data) => API.post('timeslots/', data);
export const updateTimeSlot = (id, data) => API.put(`timeslots/${id}/`, data);
export const deleteTimeSlot = (id) => API.delete(`timeslots/${id}/`);

export const fetchReservations = (params) =>
  API.get('reservations/', { params });
export const createReservation = data => API.post('reservations/', data);
export const deleteReservation = id => API.delete(`reservations/${id}/`);  // ← Añadido
export const updateReservation = (id, data) => API.put(`reservations/${id}/`, data);

export const fetchUsers = (communityId) =>
  communityId
    ? API.get(`users/?community=${communityId}`)
    : API.get('users/');
export const createUser = (data) => API.post('users/', data);
export const updateUser = (id, data) => API.put(`users/${id}/`, data);
export const deleteUser = (id) => API.delete(`users/${id}/`);
export const changeUserPassword = (userId, data) =>
  API.post(`usuarios/${userId}/cambiar_password/`, data);


export const fetchViviendas = (communityId) =>
  communityId
    ? API.get(`viviendas/?community=${communityId}`)
    : API.get('viviendas/');
export const createVivienda = (data) => API.post('viviendas/', data);
export const updateVivienda = (id, data) => API.put(`viviendas/${id}/`, data);
export const deleteVivienda = (id) => API.delete(`viviendas/${id}/`);

export const fetchUsuariosComunidad = () => API.get('usuarios-comunidad/');
export const invitarJugadores = (reservaId, data) => API.post(`/mis-reservas/${reservaId}/invitar/`, data);
export const eliminarInvitacion = (invitacionId) => API.delete(`/invitaciones/${invitacionId}/`);
export const fetchInvitadosFrecuentes = () => API.get('invitaciones-frecuentes/');
export const fetchMyReservations = (params) => API.get('mis-reservas/', { params });

export const fetchInvitaciones = (communityId) =>
  communityId
    ? API.get(`invitaciones/?community=${communityId}`)
    : API.get('invitaciones/');
export const createInvitacion = (data) => API.post('invitaciones/', data);
export const updateInvitacion = (id, data) => API.put(`invitaciones/${id}/`, data);
export const deleteInvitacion = (id) => API.delete(`invitaciones/${id}/`);

export const fetchInvitadosExternos = (communityId) =>
  communityId
    ? API.get(`invitados-externos/?community=${communityId}`)
    : API.get('invitados-externos/');
export const createInvitadoExterno = (data) => API.post('invitados-externos/', data);
export const updateInvitadoExterno = (email, data) => API.put(`invitados-externos/${encodeURIComponent(email)}/`, data);
export const deleteInvitadoExterno = (id) => API.delete(`invitados-frecuentes/${id}/`);
export const deleteInvitadoExternoByEmail = (email) => API.delete(`invitados-externos/${encodeURIComponent(email)}/`);

export const fetchComunidades = () => API.get('comunidades/');
export const createComunidad = (data) => API.post('comunidades/', data);
export const updateComunidad = (id, data) => API.put(`comunidades/${id}/`, data);
export const deleteComunidad = (id) => API.delete(`comunidades/${id}/`);
export async function fetchOcupados({ court, date }) {
  const params = new URLSearchParams({ court, date_after: date });
  const accessToken = localStorage.getItem('access');
  const response = await fetch(`/api/horarios-ocupados/?${params.toString()}`, {
    headers: {
      'Authorization': accessToken ? `Bearer ${accessToken}` : undefined,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Error al consultar horarios ocupados');
  return await response.json();
}


export const solicitarResetPassword = ({ email }) =>
  API.post('reset-password/', { email });

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

export { API };


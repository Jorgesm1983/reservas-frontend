// src/services/ApiService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// 2. Creamos instancia de axios configurada con la URL base
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Para enviar cookies (CSRF)
  headers: {
    'Content-Type': 'application/json',
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
    ? API.get(`api/courts/?community=${communityId}`)
    : API.get('api/courts/');
export const createCourt = (data) => API.post('api/courts/', data);
export const updateCourt = (id, data) => API.put(`api/courts/${id}/`, data);
export const deleteCourt = (id) => API.delete(`api/courts/${id}/`);

export const fetchTimeSlots = (communityId) =>
  communityId
    ? API.get(`api/timeslots/?community=${communityId}`)
    : API.get('api/timeslots/');
export const createTimeSlot = (data) => API.post('api/timeslots/', data);
export const updateTimeSlot = (id, data) => API.put(`api/timeslots/${id}/`, data);
export const deleteTimeSlot = (id) => API.delete(`api/timeslots/${id}/`);

export const fetchReservations = (params) =>
  API.get('api/reservations/', { params });
export const createReservation = data => API.post('api/reservations/', data);
export const deleteReservation = id => API.delete(`api/reservations/${id}/`);  // ← Añadido
export const updateReservation = (id, data) => API.put(`api/reservations/${id}/`, data);

export const fetchUsers = (communityId) =>
  communityId
    ? API.get(`api/users/?community=${communityId}`)
    : API.get('api/users/');
export const createUser = (data) => API.post('api/users/', data);
export const updateUser = (id, data) => API.put(`api/users/${id}/`, data);
export const deleteUser = (id) => API.delete(`api/users/${id}/`);
export const changeUserPassword = (userId, data) =>
  API.post(`api/usuarios/${userId}/cambiar_password/`, data);


export const fetchViviendas = (communityId) =>
  communityId
    ? API.get(`api/viviendas/?community=${communityId}`)
    : API.get('api/viviendas/');
export const createVivienda = (data) => API.post('api/viviendas/', data);
export const updateVivienda = (id, data) => API.put(`api/viviendas/${id}/`, data);
export const deleteVivienda = (id) => API.delete(`api/viviendas/${id}/`);

export const fetchUsuariosComunidad = () => API.get('api/usuarios-comunidad/');
export const invitarJugadores = (reservaId, data) => API.post(`api/mis-reservas/${reservaId}/invitar/`, data);
export const eliminarInvitacion = (invitacionId) => API.delete(`api/invitaciones/${invitacionId}/`);
export const fetchInvitadosFrecuentes = () => API.get('api/invitaciones-frecuentes/');
export const fetchMyReservations = (params) => API.get('api/mis-reservas/', { params });

export const fetchInvitaciones = (communityId) =>
  communityId
    ? API.get(`api/invitaciones/?community=${communityId}`)
    : API.get('api/invitaciones/');
export const createInvitacion = (data) => API.post('api/invitaciones/', data);
export const updateInvitacion = (id, data) => API.put(`api/invitaciones/${id}/`, data);
export const deleteInvitacion = (id) => API.delete(`api/invitaciones/${id}/`);

export const fetchInvitadosExternos = (communityId) =>
  communityId
    ? API.get(`api/invitados-externos/?community=${communityId}`)
    : API.get('api/invitados-externos/');
export const createInvitadoExterno = (data) => API.post('api/invitados-externos/', data);
export const updateInvitadoExterno = (email, data) => API.put(`api/invitados-externos/${encodeURIComponent(email)}/`, data);
export const deleteInvitadoExterno = (id) => API.delete(`api/invitados-frecuentes/${id}/`);
export const deleteInvitadoExternoByEmail = (email) => API.delete(`api/invitados-externos/${encodeURIComponent(email)}/`);

export const fetchComunidades = () => API.get('api/comunidades/');
export const createComunidad = (data) => API.post('api/comunidades/', data);
export const updateComunidad = (id, data) => API.put(`api/comunidades/${id}/`, data);
export const deleteComunidad = (id) => API.delete(`api/comunidades/${id}/`);

// 5. Funciones convertidas de fetch a axios
export const fetchOcupados = async ({ court, date }) => {
  const params = { court, date_after: date };
  const response = await API.get('/api/horarios-ocupados/', { params });
  return response.data;
};


export const solicitarResetPassword = async ({ email }) => {
  const response = await API.post('/api/password_reset/', { email });
  return response.data;
};

// Autenticación
export const login = async (email, password) => {
  const response = await API.post('api/token/', { email, password });
  if (response.data.access) {
    localStorage.setItem('access', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
  }
  return response;
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');

  window.location.href = 'api//login';
};

export { API };


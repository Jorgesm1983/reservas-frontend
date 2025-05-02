import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000/api/',
    withCredentials: true,                // ← envía cookies de sesión
    headers: {
      'X-Requested-With': 'XMLHttpRequest' // para que Django reconozca petición AJAX
    }
  });
  
  // Extra: captura el CSRF token de la cookie y lo inyecta
  API.interceptors.request.use(config => {
    const match = document.cookie.match(/csrftoken=([\w-]+)/);
    if (match) {
      config.headers['X-CSRFToken'] = match[1];
    }

    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }else {
      console.warn("Token no encontrado en localStorage");
    }

    console.log("🔐 Headers enviados:", config.headers); // <-- añade esto
    return config;
  });

export const fetchCourts       = () => API.get('courts/');
export const fetchTimeSlots    = () => API.get('timeslots/');
export const fetchReservations = () => API.get('reservations/');
export const createReservation = data => API.post('reservations/', data);
export const fetchUsers        = () => API.get('users/');
export const createCourt       = data => API.post('courts/', data);
export const createTimeSlot    = data => API.post('timeslots/', data);

// Login: obtén el token
export function login(username, password) {
  return API.post('token/', { username, password })
    .then(res => {
      const access = res.data.access;
      const refresh = res.data.refresh;

      if (access && refresh) {
        localStorage.setItem('access', access);
        localStorage.setItem('refresh_token', refresh);
        API.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        console.log("✅ Token guardado en localStorage:", access);
      } else {
        console.warn("⚠️ No se recibió token válido");
      }

      return res;
    });
}

// Logout: limpia tokens
export function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh_token');
  delete API.defaults.headers.common['Authorization'];
}
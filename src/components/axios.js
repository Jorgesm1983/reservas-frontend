// axios.js

import axios from 'axios';

// Configura Axios con el token almacenado en localStorage
axios.defaults.baseURL = 'http://localhost:8000';  // Asegúrate de que la URL base esté correctamente configurada
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;

export default axios;

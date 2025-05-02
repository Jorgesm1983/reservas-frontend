import axios from 'axios';

// Configura la baseURL y el token en los encabezados de Axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',  // Asegúrate de que esta sea la URL base correcta
});

axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('access')}`;

// Funciones para Courts
export const fetchCourts = async () => {
  try {
    const response = await axiosInstance.get('/courts');  // Endpoint para obtener las pistas
    return response.data;
  } catch (error) {
    console.error('Error al obtener las pistas:', error);
    throw error;
  }
};

export const createCourt = async (courtData) => {
  try {
    const response = await axiosInstance.post('/courts', courtData);  // Endpoint para crear una pista
    return response.data;
  } catch (error) {
    console.error('Error al crear la pista:', error);
    throw error;
  }
};

// Funciones para Time Slots
export const fetchTimeSlots = async () => {
  try {
    const response = await axiosInstance.get('/timeslots');  // Endpoint para obtener las franjas horarias
    return response.data;
  } catch (error) {
    console.error('Error al obtener las franjas horarias:', error);
    throw error;
  }
};

export const createTimeSlot = async (timeSlotData) => {
  try {
    const response = await axiosInstance.post('/timeslots', timeSlotData);  // Endpoint para crear una franja horaria
    return response.data;
  } catch (error) {
    console.error('Error al crear la franja horaria:', error);
    throw error;
  }
};

// Funciones para Reservas
export const fetchReservations = async () => {
  try {
    const response = await axiosInstance.get('/reservations');  // Endpoint para obtener la lista de reservas
    return response.data;
  } catch (error) {
    console.error('Error al obtener las reservas:', error);
    throw error;
  }
};

export const createReservation = async (reservationData) => {
  try {
    const response = await axiosInstance.post('/reservations', reservationData);  // Endpoint para crear una reserva
    return response.data;
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    throw error;
  }
};

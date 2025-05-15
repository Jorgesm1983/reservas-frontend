import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReservationForm from './components/ReservationForm';
import AdminCourts     from './components/AdminCourts';
import AdminTimeSlots  from './components/AdminTimeSlots';
import LoginPage from './components/LoginPage';
import ReservationList from './components/ReservationList';
import RegistroUsuario from './components/RegistroUsuario';



function PrivateRoute({ children }) {
  const token = localStorage.getItem('access');
  console.log("Token en PrivateRoute:", token);  // Verifica que el token se recupere correctamente
  if (!token) {
    return <Navigate to="/login" replace />;}
  return token ? children : <Navigate to="/login" replace/>;}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <ReservationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/list"
          element={
            <PrivateRoute>
              <ReservationList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/courts"
          element={
            <PrivateRoute>
              <AdminCourts />
            </PrivateRoute>
          }
        />

        <Route path="/registro" 
        element={
     
              <RegistroUsuario />

          }
        />

    
          <Route path="/admin/slots"
          element={
            <PrivateRoute>
              <AdminTimeSlots />
            </PrivateRoute>
          }
        />
      </Routes>

    </Router>
  );
}


export default App;
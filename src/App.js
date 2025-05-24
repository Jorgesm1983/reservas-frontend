import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ReservationForm from './components/ReservationForm';
import AdminCourts     from './components/AdminCourts';
import AdminTimeSlots  from './components/AdminTimeSlots';
import LoginPage from './components/LoginPage';
import ReservationList from './components/ReservationList';
import RegistroUsuario from './components/RegistroUsuario';
import MisReservas from './components/MisReservas';

import AdminDashboard from './admin/AdminDashboard';
import AdminUsuarios from './admin/AdminUsuarios';
import AdminPistas from './admin/AdminPistas';
import AdminTurnos from './admin/AdminTurnos';
import AdminReservas from './admin/AdminReservas';
import AdminViviendas from './admin/AdminViviendas';
import AdminInvitaciones from './admin/AdminInvitaciones';
import AdminInvitadosExternos from './admin/AdminInvitadosExternos';
import AdminComunidades from './admin/AdminComunidades';


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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/pistas" element={<AdminPistas />} />
            <Route path="/admin/turnos" element={<AdminTurnos />} />
            <Route path="/admin/reservas" element={<AdminReservas />} />
            <Route path="/admin/viviendas" element={<AdminViviendas />} />
            <Route path="/admin/invitaciones" element={<AdminInvitaciones />} />
            <Route path="/admin/invitados" element={<AdminInvitadosExternos />} />
            <Route path="/admin/comunidades" element={<AdminComunidades />} />
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
      <Route path="/mis-reservas" element={
            <PrivateRoute>
              <MisReservas />
            </PrivateRoute>
          } />
          
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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import ReservationForm from './components/ReservationForm';
import LoginPage from './components/LoginPage';
import ReservationList from './components/ReservationList';
import RegistroUsuario from './components/RegistroUsuario';
import MisReservas from './components/MisReservas';
import RecuperarPassword from './components/RecuperarPassword';

import RequireStaff from './services/RequireStaff';

import AdminDashboard from './admin/AdminDashboard';
import AdminUsuarios from './admin/AdminUsuarios';
import AdminPistas from './admin/AdminPistas';
import AdminTurnos from './admin/AdminTurnos';
import AdminReservas from './admin/AdminReservas';
import AdminViviendas from './admin/AdminViviendas';
import AdminInvitaciones from './admin/AdminInvitaciones';
import AdminInvitadosExternos from './admin/AdminInvitadosExternos';
import AdminComunidades from './admin/AdminComunidades';

import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access');
  return token ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const location = useLocation();
  const fondoAzul = ['/login', '/registro', '/recuperar-password'].includes(location.pathname);

  return (
    <div className="d-flex flex-column main-wrapper">
      {!fondoAzul && <Navbar />}
      {/* Fondo azul solo en login, registro y recuperar */}
      <main className={`flex-grow-1 d-flex flex-column${fondoAzul ? ' login-bg' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroUsuario />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />

          <Route path="/" element={
            <PrivateRoute>
              <ReservationList />
            </PrivateRoute>
          } />
          <Route path="/reservar" element={
            <PrivateRoute>
              <ReservationForm />
            </PrivateRoute>
          } />
          <Route path="/mis-reservas" element={
            <PrivateRoute>
              <MisReservas />
            </PrivateRoute>
          } />

          {/* Rutas de administración solo para staff */}
          <Route path="/admin" element={<RequireStaff><AdminDashboard /></RequireStaff>} />
          <Route path="/admin/usuarios" element={<RequireStaff><AdminUsuarios /></RequireStaff>} />
          <Route path="/admin/pistas" element={<RequireStaff><AdminPistas /></RequireStaff>} />
          <Route path="/admin/turnos" element={<RequireStaff><AdminTurnos /></RequireStaff>} />
          <Route path="/admin/reservas" element={<RequireStaff><AdminReservas /></RequireStaff>} />
          <Route path="/admin/viviendas" element={<RequireStaff><AdminViviendas /></RequireStaff>} />
          <Route path="/admin/invitaciones" element={<RequireStaff><AdminInvitaciones /></RequireStaff>} />
          <Route path="/admin/invitados-externos" element={<RequireStaff><AdminInvitadosExternos /></RequireStaff>} />
          <Route path="/admin/comunidades" element={<RequireStaff><AdminComunidades /></RequireStaff>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer fondoAzul={fondoAzul} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;



import { BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import ResponseInterceptor from "./services/ResponseInterceptor";

// import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { CommunityProvider } from './context/CommunityContext';



import ReservationForm from './components/ReservationForm';
import LoginPage from './components/LoginPage';
import ReservationList from './components/ReservationList';
import RegistroUsuario from './components/RegistroUsuario';
import MisReservas from './components/MisReservas';
import RecuperarPassword from './components/RecuperarPassword';
import AceptarInvitacionPage from './components/AceptarInvitacionPage';
import RechazarInvitacionPage from './components/RechazarInvitacionPage'; 

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
import ResetPasswordConfirm from './components/ResetPasswordConfirm';


import Home from './components/Home'


import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
// import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access');
  return token ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const location = useLocation();
  const fondoAzul = ['/login', '/registro', '/recuperar-password', '/reset-password-confirm/'].includes(location.pathname);

  // console.log(location.pathname, fondoAzul);




  return (
    <div className="app-root d-flex flex-column min-vh-100" style={{ background: '#f6f8fa' }}>
      {!fondoAzul}
      {/* Fondo azul solo en login, registro y recuperar */}
      <main className={`flex-grow-1 d-flex flex-column${fondoAzul ? ' login-bg' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroUsuario />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />


          <Route path="/list" element={
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
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/invitaciones/:token/aceptar" element={<AceptarInvitacionPage />} />
          <Route path="/invitaciones/:token/rechazar" element={<RechazarInvitacionPage />} />
          <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </main>
              <Footer fondoAzul={fondoAzul} />
    </div>
  );
}

function App() {
  return (
    <CommunityProvider>
      <Router>
        <ResponseInterceptor />
        <AppLayout />
      </Router>
    </CommunityProvider>
  );
}
export default App;
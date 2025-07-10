import React, { useState } from 'react';
import { login } from '../services/ApiService';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(email, password);
      if (response.data.nombre) localStorage.setItem('nombre', response.data.nombre);
      if (response.data.email) localStorage.setItem('email', response.data.email);
      if (response.data.user_id) localStorage.setItem('user_id', response.data.user_id);
      if (response.data.is_staff !== undefined) localStorage.setItem('is_staff', response.data.is_staff ? 'true' : 'false');
      navigate('/');
    } catch (err) {
      let errorMessage = 'Usuario o contraseña incorrectos';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.detail || errorMessage;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      <div className="mb-4 text-center position-relative">
        <span style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#fff',
          letterSpacing: '1px',
          position: 'relative',
          display: 'inline-block',
          paddingRight: 20
        }}>
          PistaReserva
          <span style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            background: '#c6ff00',
            borderRadius: '50%',
            position: 'absolute',
            right: -18,
            top: '50%',
            transform: 'translateY(-50%)'
          }}></span>
        </span>
      </div>
      <div className="mb-3 text-white-50 text-center" style={{ fontSize: '1.1rem' }}>
        Inicia sesión en tu cuenta
      </div>
      <form
        onSubmit={handleLogin}
        style={{ width: '100%', maxWidth: 370 }}
        className="text-center"
        autoComplete="off"
      >
        <div className="mb-3">
          <input
            type="text"
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Usuario"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            style={{ background: 'rgba(255,255,255,0.95)' }}
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control form-control-lg rounded-pill border-0"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.95)' }}
          />
        </div>
        {error && <div className="alert alert-danger py-1">{error}</div>}
        <button
          type="submit"
          className="btn w-100 rounded-pill mb-2"
          style={{
            background: '#c6ff00',
            color: '#222',
            fontWeight: 'bold',
            border: 'none',
            fontSize: '1.1rem'
          }}
        >
          Iniciar sesión
        </button>
        <div className="d-flex flex-column align-items-center mt-2">
          <Link to="/registro" className="text-decoration-none mb-2" style={{ color: '#c6ff00', fontWeight: 500 }}>
            ¿No tienes cuenta? Regístrate
          </Link>
          <Link to="/recuperar-password" className="text-decoration-none" style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.98rem' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;


// import React, { useState } from 'react';
// import { login } from '../services/ApiService';
// import { useNavigate, Link } from 'react-router-dom';

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const response = await login(email, password);
//       if (response.data) {
//         // Guarda el usuario completo (añade community_id y community_name si tu backend los devuelve)
//         localStorage.setItem('user', JSON.stringify({
//           id: response.data.user_id,
//           nombre: response.data.nombre,
//           email: response.data.email,
//           is_staff: response.data.is_staff,
//           community_id: response.data.community_id,      // ← si tu backend lo envía
//           community_name: response.data.community_name   // ← si tu backend lo envía
//         }));
//       }
//       navigate('/');
//       // Opcional: window.location.reload(); si necesitas forzar recarga del contexto
//     } catch (err) {
//       let errorMessage = 'Usuario o contraseña incorrectos';
//       if (err.response && err.response.data) {
//         errorMessage = err.response.data.detail || errorMessage;
//       }
//       setError(errorMessage);
//     }
//   };

//   return (
//     <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
//       <div className="mb-4 text-center position-relative">
//         <span style={{
//           fontFamily: 'Montserrat, Arial, sans-serif',
//           fontSize: '2.5rem',
//           fontWeight: 'bold',
//           color: '#fff',
//           letterSpacing: '1px',
//           position: 'relative',
//           display: 'inline-block',
//           paddingRight: 20
//         }}>
//           PistaReserva
//           <span style={{
//             display: 'inline-block',
//             width: 14,
//             height: 14,
//             background: '#c6ff00',
//             borderRadius: '50%',
//             position: 'absolute',
//             right: -18,
//             top: '50%',
//             transform: 'translateY(-50%)'
//           }}></span>
//         </span>
//       </div>
//       <div className="mb-3 text-white-50 text-center" style={{ fontSize: '1.1rem' }}>
//         Inicia sesión en tu cuenta
//       </div>
//       <form
//         onSubmit={handleLogin}
//         style={{ width: '100%', maxWidth: 370 }}
//         className="text-center"
//         autoComplete="off"
//       >
//         <div className="mb-3">
//           <input
//             type="text"
//             className="form-control form-control-lg rounded-pill border-0"
//             placeholder="Usuario"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             autoFocus
//             style={{ background: 'rgba(255,255,255,0.95)' }}
//           />
//         </div>
//         <div className="mb-3">
//           <input
//             type="password"
//             className="form-control form-control-lg rounded-pill border-0"
//             placeholder="Contraseña"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             style={{ background: 'rgba(255,255,255,0.95)' }}
//           />
//         </div>
//         {error && <div className="alert alert-danger py-1">{error}</div>}
//         <button
//           type="submit"
//           className="btn w-100 rounded-pill mb-2"
//           style={{
//             background: '#c6ff00',
//             color: '#222',
//             fontWeight: 'bold',
//             border: 'none',
//             fontSize: '1.1rem'
//           }}
//         >
//           Iniciar sesión
//         </button>
//         <div className="d-flex flex-column align-items-center mt-2">
//           <Link to="/registro" className="text-decoration-none mb-2" style={{ color: '#c6ff00', fontWeight: 500 }}>
//             ¿No tienes cuenta? Regístrate
//           </Link>
//           <Link to="/recuperar-password" className="text-decoration-none" style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.98rem' }}>
//             ¿Olvidaste tu contraseña?
//           </Link>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;

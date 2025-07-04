import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API } from "../services/ApiService";

export default function ResponseInterceptor() {
  const navigate = useNavigate();
  const location = useLocation();
  const interceptorId = useRef(null);
  const publicPaths = [
  '/invitacion/',
  '/invitaciones/',
  '/registro',
  '/recuperar-password',
  '/reset-password-confirm',
  '/login'
];

  useEffect(() => {
    interceptorId.current = API.interceptors.response.use(
      response => response,
      error => {
        const isPublic = publicPaths.some(path => location.pathname.startsWith(path));
        if (
          error.response?.status === 401 &&
          !isPublic
        ) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate("/login", { replace: true });
          return new Promise(() => {});
        }
        return Promise.reject(error);
      }
    );
    return () => {
      API.interceptors.response.eject(interceptorId.current);
    };
  }, [navigate, location]);

  return null;
}

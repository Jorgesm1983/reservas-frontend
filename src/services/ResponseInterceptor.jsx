import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API } from "../services/ApiService";

export default function ResponseInterceptor() {
  const navigate = useNavigate();
  const location = useLocation();
  const interceptorId = useRef(null);

  useEffect(() => {
    interceptorId.current = API.interceptors.response.use(
      response => response,
      error => {
        if (
          error.response?.status === 401 &&
          location.pathname !== "/login"
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

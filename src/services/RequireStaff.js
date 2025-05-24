import { Navigate } from 'react-router-dom';

export default function RequireStaff({ children }) {
  const isStaff = localStorage.getItem('is_staff') === 'true';
  if (!isStaff) {
    return <Navigate to="/" replace />;
  }
  return children;
}

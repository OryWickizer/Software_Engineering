import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
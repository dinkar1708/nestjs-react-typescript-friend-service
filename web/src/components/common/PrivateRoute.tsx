import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../../lib/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

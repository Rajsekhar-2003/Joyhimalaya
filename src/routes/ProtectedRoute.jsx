import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/ui';
export default function ProtectedRoute({ children }) {
  const { loading, isAdmin } = useAuth();
  if (loading) return <Spinner />;
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

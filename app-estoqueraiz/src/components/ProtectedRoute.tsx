import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('@EstoqueRaiz:token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

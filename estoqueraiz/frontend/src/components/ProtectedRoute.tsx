import { Navigate } from 'react-router-dom';
import { type CargoPermitido } from '../data/modulos';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  cargosPermitidos?: CargoPermitido[];
}


export function ProtectedRoute({ children, cargosPermitidos }: ProtectedRouteProps) {
  const token = localStorage.getItem('@EstoqueRaiz:token');
  const usuarioString = localStorage.getItem('@EstoqueRaiz:usuario'); 

  if (!token || !usuarioString) {
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(usuarioString);

  if (cargosPermitidos && cargosPermitidos.length > 0) {
    if (!usuario.cargo || !cargosPermitidos.includes(usuario.cargo as CargoPermitido)) {
      return <Navigate to="/dashboard" replace />; 
    }
  }

  return <>{children}</>;
}

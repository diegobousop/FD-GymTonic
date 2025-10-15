import React from 'react'
import { Navigate } from 'react-router-dom';
import { UserContext } from './user-provider';

const ProtectedPath = ({ 
  path, 
  role = null, 
  roleMessage = "No tienes permisos para acceder a esta página" 
}) => {
  const { user, loading } = React.useContext(UserContext);

  // Función para verificar si el usuario tiene alguno de los roles permitidos
  const hasRequiredRole = (userRole, requiredRoles) => {
    if (!requiredRoles) return true;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userRole);
    }
    
    return userRole === requiredRoles;
  };

  // Mientras está cargando, mostrar pantalla de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white"></div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, redirigir
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Verificar rol
  if (!hasRequiredRole(user.role, role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-white">{roleMessage}</p>
        </div>
      </div>
    );
  }

  return path;
}

export default ProtectedPath
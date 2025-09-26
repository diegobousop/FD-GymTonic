import React from 'react'
import { UserContext } from './user-provider';
import { Navigate } from "react-router-dom";

const ProtectedPath = ({path}) => {
  const { user, loading } = React.useContext(UserContext);

  
  if (loading) {
    return null; 
  }

  if (!user) {
    return <Navigate to="/" />;
  }
  return path;
}

export default ProtectedPath
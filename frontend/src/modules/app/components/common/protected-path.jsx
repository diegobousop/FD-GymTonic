import React from 'react'
import { UserContext } from './user-provider';
import { Navigate } from "react-router-dom";

const ProtectedPath = ({path}) => {
  const { user, loading } = React.useContext(UserContext);

  // While we're checking localStorage or trying to re-authenticate, don't redirect.
  if (loading) {
    return null; // or a spinner component if you have one
  }

  if (!user) {
    return <Navigate to="/" />;
  }
  return path;
}

export default ProtectedPath
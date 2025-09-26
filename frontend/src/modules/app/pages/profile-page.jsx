import React, { useState,  useContext } from 'react'
import NavBar from '../components/common/navbar'
import SideMenu from '../components/common/side-menu'
import { Link, Navigate } from 'react-router-dom'
import SendButton from '../components/common/send-button'
import { getProfile } from "../../../backend/userService"

import { UserContext } from '../components/common/user-provider';




const ProfilePage = () => {
  const { user, setUser, handleLogout } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('profile');

  React.useEffect(() => {
    if (user) {
      getProfile(user, (data) => {
        setProfile(data);
      }, (err) => {
        setError('Error al cargar el perfil');
      });
    }
  }, [user]);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-auto ">

      <SendButton children="Cerrar sesión" isLoading={false} onClick={() => {
        handleLogout();
      }}/>

      <h2 className="text-xl font-bold mt-8 mb-4 text-white">Datos de usuario</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {user ? (
        <div className="space-y-2 text-white">
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Nombre:</strong> {user.firstname}</div>
          <div><strong>Apellido:</strong> {user.lastname}</div>

        </div>
      ) : (
        <div>Cargando datos...</div>
      )}
    </div>
  );
}

export default ProfilePage
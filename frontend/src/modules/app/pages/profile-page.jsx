import React, {useState, useContext, useEffect} from 'react'
import NavBar from '../components/common/navbar'
import SideMenu from '../components/common/side-menu'
import { Link, Navigate } from 'react-router-dom'
import SendButton from '../components/common/send-button'
import { getProfile, getFollowersCount } from "../../../backend/userService"

import { UserContext } from '../components/common/user-provider';

import { useNavigate } from 'react-router-dom'




const ProfilePage = () => {
  const navigate = useNavigate()

  const { user, setUser, handleLogout } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);

  React.useEffect(() => {
    if (user) {
      getProfile(user, (data) => {
        setProfile(data);
      }, (err) => {
        setError('Error al cargar el perfil');
      });

      // Solo mostrar contador si no es admin
      if (user.role !== 'ADMIN') {
        setLoadingCount(true);
        getFollowersCount(
          (count) => {
            setFollowersCount(count);
            setLoadingCount(false);
          },
          (err) => {
            setLoadingCount(false);
            console.error('Error al cargar contador de seguidores:', err);
          }
        );
      }
    }
  }, [user]);

  const getFollowersLabel = () => {
    if (user?.role === 'USER') {
      return 'Seguidores';
    } else if (user?.role === 'TRAINER') {
      return 'Subscriptores';
    }
    return '';
  };

  return (
    <div className="w-full mx-auto mt-10 p-6 bg-auto ">

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {user ? (
        <div className="flex flex-col space-y-4 text-white">
          <div className="flex flex-row space-y-2 text-white justify-start gap-4 items-center">
            <div className="flex flex-col">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Nombre:</strong> {user.firstName}</div>
              <div><strong>Apellido:</strong> {user.lastName}</div>
              {/* Mostrar contador de seguidores/subscriptores solo si no es admin */}
              {user.role !== 'ADMIN' && (
                <div>
                  <Link 
                    to="/profile/followers" 
                    className="underline cursor-pointer hover:text-blue-400"
                    style={{ textDecoration: 'underline' }}
                  >
                    <strong>{getFollowersLabel()}:</strong> {loadingCount ? '...' : followersCount}
                  </Link>
                </div>
              )}
            </div>

            <SendButton
            children="Editar perfil"
            onClick={
              () => {
                navigate('/profileUpdate');
              }
            }
            />

            <SendButton
            children="Cambiar contraseña"
            onClick={
              () => {
                navigate('/change-password');
              }
            }
            />

          </div>
        </div>
      ) : (
        <div>Cargando datos...</div>
      )}

      <SendButton children="Cerrar sesión" isLoading={false} onClick={() => {
        handleLogout();
      }}/>
    </div>
  );
}

export default ProfilePage
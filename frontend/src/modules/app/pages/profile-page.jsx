import React, {useState, useContext} from 'react'

import SendButton from '../components/common/send-button'
import { getProfile, getFollowersCount } from "../../../backend/userService"

import { UserContext } from '../components/common/user-provider';

import { Link } from 'react-router-dom'

import { useNavigate, useParams } from 'react-router-dom'


const ProfilePage = () => {
  const navigate = useNavigate()

  const { id } = useParams();
  
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);

  React.useEffect(() => {

      getProfile({id}, (data) => {
        setProfile(data);
      }, (err) => {
        setError('Error al cargar el perfil');
      });


    if (profile) {
      getProfile({id: profile.id}, (data) => {
        setProfile(data);
      }, (err) => {
        setError('Error al cargar el perfil');
      });

      // Solo mostrar contador si no es admin
      if (profile.role !== 'ADMIN') {
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
  }, [id]);                     // añade dependencia

  const getFollowersLabel = () => {
    if (profile?.role === 'USER') {
      return 'Seguidores';
    } else if (profile?.role === 'TRAINER') {
      return 'Subscriptores';
    }
    return '';
  };

  return (
    <div className="w-full mx-auto mt-10 p-6 bg-auto ">

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {profile ? (
        <div className="flex flex-col space-y-4 text-white">
          <div className="flex flex-row space-y-2 text-white justify-start gap-4 items-center">
            <div className="flex flex-col">
              <div><strong>Email:</strong> {profile.email}</div>
              <div><strong>Nombre:</strong> {profile.firstName}</div>
              <div><strong>Apellido:</strong> {profile.lastName}</div>
              {/* Mostrar contador de seguidores/subscriptores solo si no es admin */}
              {profile.role !== 'ADMIN' && (
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

      
    </div>
  );
}

export default ProfilePage
import React, { useEffect, useState } from 'react';

import Spinner from '../components/common/spinner';

import { getProfile, getFollowersCount } from '../../../backend/userService';
import { Link, useNavigate, useParams } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [edad, setEdad] = useState(0);

  useEffect(() => {
    setError('');
    setProfile(null);

    getProfile(
      { id },
      (data) => {
        setProfile(data);

        if (data?.birthDate) {
          setEdad(calcularEdad(data.birthDate));
        }

        if (data?.role !== 'ADMIN') {
          setLoadingCount(true);
          getFollowersCount(
            (count) => {
              setFollowersCount(count);
              setLoadingCount(false);
            },
            () => {
              setLoadingCount(false);
            }
          );
        }
      },
      () => {
        setError('Error al cargar el perfil');
      }
    );
  }, [id]);

  const getFollowersLabel = () => {
    if (profile?.role === 'USER') return 'Seguidores';
    if (profile?.role === 'TRAINER') return 'Subscriptores';
    return '';
  };

  return (
    <div className="w-full mt-5 py-5 bg-auto ">
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {profile ? (
        <div className="flex flex-col text-white pb-5">
          <div className="flex flex-row border-b border-b-[#990000] items-center px-5 pb-10">
            <img src={profile.avatar.avatarBase64} alt="Profile" className="w-24 h-24 object-cover ml-5 "/>
            <h1 className="ml-5">{profile.userName}</h1>
          </div>

          <div className="flex flex-row space-y-2 text-white justify-start gap-4 items-center p-10">
            <div className="flex flex-col">
              <div>
                <strong>Email:</strong> {profile.email}
              </div>
              <div>
                <strong>Nombre:</strong> {profile.firstName}
              </div>
              <div>
                <strong>Apellido:</strong> {profile.lastName}
              </div>
              <div>
                <strong>Edad:</strong> {edad}
              </div>
              <div>
                <strong>Fecha Nacimiento:</strong> {profile.birthDate}
              </div>

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
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );

  function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 0;

    const [diaStr, mesStr, anoStr] = fechaNacimiento.split('-');
    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10) - 1;
    const ano = parseInt(anoStr, 10);

    const fechaNac = new Date(ano, mes, dia);
    const hoy = new Date();

    let edadCalc = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth();
    const diaActual = hoy.getDate();

    if (mesActual < mes || (mesActual === mes && diaActual < dia)) {
      edadCalc--;
    }

    return edadCalc;
  }
};

export default ProfilePage;
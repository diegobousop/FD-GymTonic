import React, { useEffect, useState } from 'react';

import SendButton from '../components/common/send-button';
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
    <div className="w-full mx-auto mt-10 p-6 bg-auto ">
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {profile ? (
        <div className="flex flex-col space-y-4 text-white">
          <div className="flex flex-row space-y-2 text-white justify-start gap-4 items-center">
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

          <div className="flex flex-row space-x-4 mt-6">
            <SendButton
              children="Editar perfil"
              onClick={() => {
                navigate('/profileUpdate');
              }}
            />
            <SendButton
              children="Cambiar contraseña"
              onClick={() => {
                navigate('/change-password');
              }}
            />
          </div>
        </div>
      ) : (
        <div>Cargando datos...</div>
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
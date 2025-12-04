import React, { useEffect, useState } from 'react';

import Spinner from '../components/common/spinner';

import {
    getProfile,
    getFollowersCount,
} from '../../../backend/userService';

import { viewUserTrainings } from '../../../backend/routineService';
import BadgesList from '../components/profile/BadgesList';

import { Link, useParams } from 'react-router-dom';

const ProfilePage = () => {
    const { id } = useParams();

    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [followersCount, setFollowersCount] = useState(0);
    const [loadingCount, setLoadingCount] = useState(false);
    const [edad, setEdad] = useState(0);

    const [trainings, setTrainings] = useState([]);
    const [loadingTrainings, setLoadingTrainings] = useState(false);

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

                //  Cargar entrenamientos del usuario
                setLoadingTrainings(true);
                viewUserTrainings(
                    id,
                    0,
                    20,
                    (data) => {
                        setTrainings(data.items);
                        setLoadingTrainings(false);
                    },
                    () => {
                        setTrainings([]);
                        setLoadingTrainings(false);
                    }
                );
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
                        <img
                            src={profile.avatar.avatarBase64}
                            alt="Profile"
                            className="w-24 h-24 object-cover ml-5"
                        />
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

        {profile && <BadgesList userId={profile.id} />}

                    <div className="px-10 mt-5 text-white">
                        <h2 className="text-xl font-bold mb-3">Entrenamientos</h2>

                        {loadingTrainings && <Spinner />}

                        {!loadingTrainings && trainings.length === 0 && (
                            <p>No hay entrenamientos disponibles o no sigues a este usuario.</p>
                        )}

                        {!loadingTrainings && trainings.length > 0 && (
                            <>
                                <div className="flex flex-row items-center mt-10 ml-10 gap-10">
                                    <p className="font-semibold text-white text-[18px]">
                                        Últimos entrenamientos
                                    </p>
                                </div>

                                {trainings.map((training) => (
                                    <div key={training.id} className="flex flex-col mb-4 p-8 pt-4 m-10 shadow-lg rounded-md w-full">
                                        <div className="flex flex-row gap-5">

                                            <img
                                                src={profile.avatar.avatarBase64}
                                                alt={training.name}
                                                className="w-[40px] h-[40px] my-2"
                                            />

                                            <div className="flex flex-col w-full">
                                                <p className="inline-block w-fit text-white hover:text-[#CA0D0A]">
                                                    {training.creatorUserName}
                                                </p>

                                                <p className="mb-5">{new Date(training.creationDate).toLocaleDateString()}</p>

                                                <Link
                                                    to={`/trainings/${training.id}/details`}
                                                    className="font-semibold text-[25px] text-white mb-3 hover:text-[#CA0D0A]"
                                                >
                                                    {training.name}
                                                </Link>

                                                <p className="mb-3 text-white">{training.description}</p>

                                                <div className="flex flex-row gap-10">
                                                    <p className="text-[12px] w-[12%]">Duración</p>
                                                    <p className="text-[12px] w-[10%]">Ejercicios</p>
                                                    <p className="text-[12px] w-[40%] ml-4">Rutina</p>
                                                </div>

                                                <div className="flex flex-row gap-10">
                                                    <p className="text-[25px] w-[12%] text-white">
                                                        {training.duration} min
                                                    </p>

                                                    <p className="text-[25px] w-[10%] text-white">
                                                        {training.exercises.length}
                                                    </p>

                                                    <Link
                                                        to={`/routines/${training.routineId}`}
                                                        className="text-[25px] w-[40%] ml-4 text-white overflow-hidden text-ellipsis whitespace-nowrap hover:text-[#CA0D0A] cursor-pointer"
                                                    >
                                                        {training.routineName}
                                                    </Link>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="bg-[#262626] rounded-md p-5 mt-10 w-fit self-start inline-block">
                                            <div className="flex flex-col">
                                                <div className="flex flex-row">
                                                    {training.exercises.map((exercise, index) => (
                                                        <div key={index} className="flex flex-row items-center">
                                                            <div className="flex flex-col justify-center items-center p-2 text-center ">
                                                                <img
                                                                    src={exercise.exerciseImageBase64}
                                                                    alt={exercise.name}
                                                                    className="w-[50px] h-auto rounded-md"
                                                                />
                                                                <p className="text-white mt-2">{exercise.name}</p>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <Spinner/>
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
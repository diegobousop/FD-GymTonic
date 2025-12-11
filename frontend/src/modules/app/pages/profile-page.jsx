import React, { useEffect, useState, useContext } from 'react';

import Spinner from '../components/common/spinner';
import { UserContext } from "../components/common/user-provider";
import { useToast } from "../components/common/toast-provider.jsx";


import {
    getProfile,
    getFollowersCount,
    getRequestSended,
    getStats
} from '../../../backend/userService';


import BadgesList from '../components/profile/BadgesList';
import TrainingHistory from '../components/training/training-history';
import UserStatsPanel from '../components/profile/user-stats-panel';
import CalendarCard from '../components/profile/calendar-card';

import { Link, useParams } from 'react-router-dom';
import backend from '../../../backend';

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return 0;

  const [diaStr, mesStr, anoStr] = fechaNacimiento.split('-');
  const dia = Number.parseInt(diaStr, 10);
  const mes = Number.parseInt(mesStr, 10) - 1;
  const ano = Number.parseInt(anoStr, 10);

  const fechaNac = new Date(ano, mes, dia);
  const hoy = new Date();

  let edadCalc = hoy.getFullYear() - fechaNac.getFullYear();
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();

  if (mesActual < mes || (mesActual === mes && diaActual < dia)) {
    edadCalc--;
  }

  return edadCalc;
};

const ProfilePage = () => {
  const { user, refreshUser } = useContext(UserContext);
  const { id } = useParams();
  const { showToast } = useToast();

  const [isFollowing, setIsFollowing] = useState(false);
  const [requestIsSended, setRequestIsSended] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [edad, setEdad] = useState(0);


  //stats
  const [activeTab, setActiveTab] = useState('userStats');
  const [selectedReps, setSelectedReps] = useState(0);
  const [selectedTime, setSelectedTime] = useState('YEAR');
  const [stats , setStats] = useState(null);
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [dayFilterActivated, setDayFilterActivated] = useState(false);
  const [statsForbidden, setStatsForbidden] = useState(true);


  const handleUnfollowUser = (userId) => {
    const name = profile.firstName;
      backend.userService.unfollowUser(
        userId,
        () => {
          showToast(`Has dejado de seguir a ${name}`, "success");
        },
        () => showToast("Error al dejar de seguir al usuario.", "error")
      );
  };


  const handleFollowUser = (userId) => {
    if (profile.role === "TRAINER"){
      backend.userService.followUser(
        userId,
        () => {
          refreshUser()
          showToast(`Has comenzado a seguir a ${profile.firstName}`, "success");
        },
        () => showToast("Error al seguir al usuario.", "error")
      );
      return;
    }

    if(profile.role === "USER") {
      backend.userService.sendFollowRequest(
        userId, 
        () => {
          refreshUser()
          showToast(`Solicitud enviada a ${profile.firstName}`, "error");
        },
        () => showToast("Error al enviar la solicitud.", "Error")
      );
      return;
    }
    showToast("No se puede seguir a este usuario.", "error");
  };

  const handleBlockUser = (userId) => {
    const name = profile.firstName;

    backend.userService.blockUser(
      userId,
      () => {
        user.idBlocked.push(Number(id));
        showToast(`Has bloqueado a ${name}`, "success");
      },
      () => showToast("Error al bloquear al usuario", "error")
    );
  };

  const checkIsSended = (array, id) => {
    return array.some(element => element.receiverId == id)
  };


  const renderFollowButton = (id) => {
    let label = "Seguir";
    let className = "bg-green-600 hover:bg-green-700";

    const isBlocked = user.idBlocked?.includes(Number(id));
    if(isBlocked){
      return null;
    }

    if(isFollowing) {
      label = "Dejar de seguir";
      className = "bg-gray-600 hover:bg-gray-700";
    } else if(requestIsSended) {
      label = "Solicitud enviada";
      className = "bg-yellow-700 cursor-not-allowed";
    }

    return ( 
      <button
        onClick={() => 
          isFollowing 
            ? handleUnfollowUser(id)
            : !requestIsSended && handleFollowUser(id)
        }
        disabled={requestIsSended}
        className={`${className} text-white px-3 py-1 rounded-md text-sm`}
      >
        {label}
      </button>

    );
  };


  const renderBlockButton = (id) => {
    const isBlocked = user.idBlocked?.includes(Number(id));
    const label = isBlocked ? "Bloqueado" : "Bloquear";
    const className = isBlocked ? "bg-red-900 cursor-not-allowed" : "bg-red-600 hover:bg-red-700";

    return (
      <button
        onClick={() => handleBlockUser(id)}
        disabled={isBlocked}
        className={`${className} text-white px-3 py-1 rounded-md text-sm`}
      >
        {label}
      </button>
    );
  }
  
  useEffect(() => {
    setError('');
    setProfile(null);
    setIsFollowing(user.followingList?.includes(Number(id)));
    refreshUser();

    getRequestSended(
      (data) => {
        setRequestIsSended(checkIsSended(data, id));
      },
      (error) => {
        console.error("Error:", error);
      }
    );

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

  useEffect(() => {
    
    if (profile) {
      
        getStats(
            {
                userProfileId: profile.id,
                numReps: selectedReps,
                period: selectedTime
            },
            (data) => {
                setStats(data);
                setStatsForbidden(false);
                console.log("Stats cargadas:", data);
            },
            (err) => {
                console.error("Error fetching stats", err);
                setStatsForbidden(true);
            }
        );
    }
  }, [profile, selectedReps, selectedTime]);

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

                      <div className="flex flex-row space-y-2 text-white justify-start gap-4 items-center p-10">
                      <div className="flex flex-row gap-2">
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
                      
                      {id != user.id && (
                        <div className="ml-auto flex gap-3">
                          {!user.idBlocked?.includes(Number(id)) && renderFollowButton(id)}
                          {renderBlockButton(id)}
                        </div>
                      )}
                  </div>

        

      <div className="flex flex-row justify-between h-full">
        {(() => {
          if (activeTab === 'trainingHistory') {
            return (
              <TrainingHistory
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={profile}
                selectedDay={selectedDay}
                dayFilterActivated={dayFilterActivated}
                setFilterActivated={setDayFilterActivated}
                ariaLabel="Historial de entrenamientos"
                forbidden={statsForbidden}
              />
            );
          }
          if (activeTab === 'badges') {
            return (
              <BadgesList
                  userId={profile?.id}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  forbidden={statsForbidden}
              />
            );
          }
          return (
            <UserStatsPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedReps={selectedReps}
              setSelectedReps={setSelectedReps}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              stats={stats}
              forbidden={statsForbidden}
            />
          );
        })()}

        <CalendarCard
          user={profile}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          setDayFilterActivated={setDayFilterActivated}
          forbidden={statsForbidden}
        />
      </div>


              </div>
          ) : (
              <Spinner/>
          )}
      </div>
  );
};

export default ProfilePage;
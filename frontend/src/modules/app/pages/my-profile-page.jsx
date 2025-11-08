import React, {useState, useContext} from 'react'

import TrainingHistory from '../components/training/training-history'
import SendButton from '../components/common/send-button'
import CalendarCard from '../components/profile/calendar-card'

import { getProfile } from "../../../backend/userService"

import { UserContext } from '../components/common/user-provider';

import { useNavigate } from 'react-router-dom'




const MyProfilePage = () => {
  const navigate = useNavigate()
  

  const { user, setUser, handleLogout } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  //Historial
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [dayFilterActivated, setDayFilterActivated] = useState(false);


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
    <div className="flex flex-col w-full mx-auto mt-10 py-6 bg-auto h-full">

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {user ? (
        <div className="flex flex-row  items-center text-white gap-5 border-b border-b-[#990000] pb-5">
          <div className="flex flex-col ml-5">
            
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Nombre:</strong> {user.firstName}</div>
            <div><strong>Apellido:</strong> {user.lastName}</div>
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

          <SendButton children="Cerrar sesión" isLoading={false} onClick={() => {
            handleLogout();
          }}/>

        </div>
      ) : (
        <div>Cargando datos...</div>
      )}
      <div className="flex flex-row justify-between h-full">
        <TrainingHistory 
          user={user} 
          selectedDay={selectedDay}
          dayFilterActivated={dayFilterActivated}
          setFilterActivated={setDayFilterActivated}
        />
        <CalendarCard 
          user={user}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          setDayFilterActivated={setDayFilterActivated}
        />
      </div>


    </div>
  );
}

export default MyProfilePage
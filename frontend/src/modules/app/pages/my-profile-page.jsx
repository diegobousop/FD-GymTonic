import React, {useState, useContext} from 'react'
import TrainingHistory from '../components/training/training-history'
import BubbleButton from '../components/common/bubble-button'
import CalendarCard from '../components/profile/calendar-card'

import { getProfile, getFollowersCount } from "../../../backend/userService"
import { UserContext } from '../components/common/user-provider';
import { useNavigate } from 'react-router-dom'

import { SVG_ICONS } from '../../../config/constants'


const MyProfilePage = () => {
  const navigate = useNavigate()

  const { user, setUser, handleLogout } = useContext(UserContext);
  const [followerCount, setFollowerCount] = useState(0);
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

      getFollowersCount(
        (count) => {
        setFollowerCount(count);
      }, (err) => {
        setError('Error al cargar el número de seguidores');
      });
    }
  }, [user]);

  return (
    <div className="flex flex-col w-full mx-auto mt-10  bg-auto h-full">

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {user ? (
        <div className="flex flex-row  items-center text-white gap-5 border-b border-b-[#990000] pb-5">
          <img src={user.avatar.avatarBase64} alt="Profile" className="w-24 h-24 object-cover ml-10 "/>
          <div className="flex flex-col ml-5 w-[50%]">
            
            <h1>{user.userName}</h1>
            <p className="text-white">{followerCount} seguidores   </p>
          </div>

          { user && (user.role === 'ADMIN' || user.role === 'TRAINER') &&
            <button
              className="bg-[#262626] p-3 rounded-full px-5 hover:bg-[#3a3a3a]"
              onClick={() => { navigate('/routines/my-routines'); }}
              >
              Mis rutinas
            </button>
          }

          <BubbleButton 
            icon={<SVG_ICONS.CreateRoutineIcon />}
            ariaLabel="Editar perfil"
            onClick={() => { navigate('/profileUpdate'); }}
          />

          <BubbleButton 
            icon={<SVG_ICONS.PasswordIcon />}
            ariaLabel="Cambiar contraseña"
            onClick={() => { navigate('/change-password'); }}
          />

          <BubbleButton 
            icon={<SVG_ICONS.LogoutIcon />}
            ariaLabel="Cerrar sesión"
            onClick={() => { handleLogout(); }}
          />

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
          ariaLabel="Historial de entrenamientos"
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
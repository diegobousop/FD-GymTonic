import React, {useState, useContext} from 'react'

import TrainingHistory from '../components/training/training-history'
import SendButton from '../components/common/send-button'
import CalendarCard from '../components/profile/calendar-card'

import { getProfile } from "../../../backend/userService"

import { UserContext } from '../components/common/user-provider';

import { useNavigate, useParams } from 'react-router-dom'

import backend from "../../../backend";


const ProfilePage = () => {
  const navigate = useNavigate()

  const { id } = useParams();
  
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (id) {
      backend.userService.getProfile(
        { id },                 // corregido: objeto con id
        (data) => setProfile(data),
        (err) => setError(err || 'Error al cargar el perfil del usuario')
      );
    }
  }, [id]);                     // añade dependencia

  return (
    <div className="flex flex-col w-full mx-auto mt-10 py-6 bg-auto h-full">
       {profile ? (
          <div className="flex flex-row mt-2 text-[12px] items-center">
            <p className="ml-2">{profile.userName}</p>
          </div>
        ) : <p>Cargando perfil...</p>}
    </div>
  );
}

export default ProfilePage
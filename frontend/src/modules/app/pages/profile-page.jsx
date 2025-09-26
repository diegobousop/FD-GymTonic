import React, { useState,  useContext } from 'react'
import NavBar from '../components/common/navbar'
import SideMenu from '../components/common/side-menu'
import { Link, Navigate } from 'react-router-dom'
import SendButton from '../components/common/send-button'

import { UserContext } from '../components/common/user-provider';



const ProfilePage = () => {

  const { setUser, handleLogout } = useContext(UserContext);
  

  const [activePage, setActivePage] = useState('profile')

  return (
    <div>
      <Link to="/routines/createRoutine" className='no-underline'>
        <div>
          <button className="px-14 py-8 text-white bg-black text-2xl">
            <h1 className="text-[36px]">Crea tu rutina</h1>
          </button>

         
        </div>
      </Link>

       <SendButton children="Cerrar sesión" isLoading={false} onClick={() => {
            handleLogout();
          }}/>

    </div>
  )
}

export default ProfilePage
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { SVG_ICONS } from '../../../../config/constants'


const { HomeIcon, ProfileIcon } = SVG_ICONS



const SideMenu = ({ activePage, setActivePage }) => {
  const navigate = useNavigate()
  const [homePressed, setHomePressed] = useState(false)
  const [profilePressed, setProfilePressed] = useState(false)
  const [createRoutinePressed, setCreateRoutinePressed] = useState(false)

  const isActive = (page) => activePage === page

  const go = (page, path) => {
    if (setActivePage) setActivePage(page)
    if (path) navigate(path)
  }


  return (
    <div className="flex flex-col w-[252px] border-r border-[#ff0000] h-full items-center px-8">
        
        <button
          type="button"
          onClick={() => go('home', '/home')}
          onPointerDown={() => setHomePressed(true)}
          onPointerUp={() => setHomePressed(false)}
          style={{ transform: homePressed ? 'translateY(1px) scale(0.970)' : undefined }}
          className={`flex w-full items-center justify-center py-3 px-3 mt-5 relative transform transition-all duration-150
             active:translate-y-[1px] active:scale-[0.970]  ${isActive('home') ? 'bg-[#241515]' : 'bg-transparent hover:bg-[#241515]'}`}
        >
          <HomeIcon className={`absolute left-4 w-[30px] h-auto ${isActive('home') ? 'text-[#ff0000]' : 'text-white'}`} />
          <h1 className={`text-[16px] ${isActive('home') ? 'text-[#ff0000]' : 'text-white'}`}>Inicio</h1>
        </button>

        <button
          type="button"
          onClick={() => go('profile', '/profile')}
          onPointerDown={() => setProfilePressed(true)}
          onPointerUp={() => setProfilePressed(false)}
          style={{ transform: profilePressed ? 'translateY(1px) scale(0.970)' : undefined }}
          className={`flex w-full items-center justify-center py-3 px-3 mt-5 relative transform transition-all duration-150
             active:translate-y-[1px] active:scale-[0.970]  ${isActive('profile') ? 'bg-[#241515]' : 'bg-transparent hover:bg-[#241515]'}`}
        >
          <ProfileIcon className={`absolute left-4 w-[30px] h-auto ${isActive('profile') ? 'text-[#ff0000]' : 'text-white'}`} />
          <h1 className={`text-[16px] ${isActive('profile') ? 'text-[#ff0000]' : 'text-white'}`}>Ver perfil</h1>
        </button>

        <button
          type="button"
          onClick={() => go('create-routine', '/routines/create-routine')}
          onPointerDown={() => setCreateRoutinePressed(true)}
          onPointerUp={() => setCreateRoutinePressed(false)}
          style={{ transform: profilePressed ? 'translateY(1px) scale(0.970)' : undefined }}
          className={`flex w-full items-center justify-center py-3 px-3 mt-5 relative transform transition-all duration-150
             active:translate-y-[1px] active:scale-[0.970]  ${isActive('profile') ? 'bg-[#241515]' : 'bg-transparent hover:bg-[#241515]'}`}
        >
          <ProfileIcon className={`absolute left-4 w-[30px] h-auto ${isActive('create-routine') ? 'text-[#ff0000]' : 'text-white'}`} />
          <h1 className={`text-[16px] ${isActive('create-routine') ? 'text-[#ff0000]' : 'text-white'}`}>Crear Rutina</h1>
        </button>


    </div>
  )
}

export default SideMenu

SideMenu.propTypes = {
  activePage: PropTypes.string,
  setActivePage: PropTypes.func,
}


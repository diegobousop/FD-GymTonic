import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { SVG_ICONS } from '../../../../config/constants'
import MenuItem from './menu-item'


const { HomeIcon, ProfileIcon, CreateRoutineIcon } = SVG_ICONS




const SideMenu = ({ activePage, setActivePage }) => {
  const navigate = useNavigate()

  // Leer la última página activa de localStorage al montar
  useEffect(() => {
    const lastPage = localStorage.getItem('sideMenuActivePage')
    if (lastPage && setActivePage) {
      setActivePage(lastPage)
    }
  }, [setActivePage])

  const isActive = (page) => activePage === page

  const go = (page, path) => {
    if (setActivePage) setActivePage(page)
    localStorage.setItem('sideMenuActivePage', page)
    if (path) navigate(path)
  }


  return (
    <div className="flex flex-col w-[252px] border-r border-[#ff0000] h-full items-center px-8">
      <MenuItem title="Inicio" activePage={isActive} page={'home'} onClick={() => go('home', '/home')} icon={HomeIcon} />
      <MenuItem title="Ver perfil" activePage={isActive} page={'profile'} onClick={() => go('profile', '/profile')} icon={ProfileIcon} />
      <MenuItem title="Crear rutina" activePage={isActive} page={'create-routine'} onClick={() => go('create-routine', '/routines/create-routine')} icon={CreateRoutineIcon} />
      <MenuItem title="Editar perfil" activePage={isActive} page={'user-edit'} onClick={() => go('user-edit', '/profileUpdate')} icon={ProfileIcon} />
      <MenuItem title="Crear Ejercicio" activePage={isActive} page={'add-exercise'} onClick={() => go('add-exercise', '/admin/addExercise')} icon={CreateRoutineIcon} />
      <MenuItem title="Cambiar contraseña" activePage={isActive} page={'change-password'} onClick={() => go('change-password', '/change-password')} icon={ProfileIcon} />
    </div>
  )
}

export default SideMenu

SideMenu.propTypes = {
  activePage: PropTypes.string,
  setActivePage: PropTypes.func,
}


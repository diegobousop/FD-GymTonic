import { useEffect, useContext } from 'react'

import SearchBar from './searchbar'
import { UserContext } from './user-provider'

import { GENERAL_ICONS } from '../../../../config/constants'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const PAGE_TITLES = {
  home: 'Inicio',
  profile: 'Perfil',
  userEdit: 'Editar Perfil',
  createRoutine: 'Crear Rutina',
  myRoutines: 'Mis rutinas',
  createExercise: 'Crear Ejercicio',
  'change-password': 'Cambiar Contraseña',
}

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const Navbar = ({activePage}) => {

  const { user } = useContext(UserContext);

  const title = PAGE_TITLES[activePage] || capitalize(activePage) || 'Inicio'

  return (
    <div className="flex flex-row items-center justify-start h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">
        <Link to="/home">
          <img
            src={GENERAL_ICONS.APP_LOGO}
            alt="logo"
            className="h-12 ml-12"
          />
        </Link>

        <div className="flex flex-row  ml-4 items-center w-full">
            <div className="flex flex-row grow w-full">
                <h1 className="text-white ml-24">{title}</h1>
            </div>
            <div className="flex flex-row items-center justify-between gap-4 mr-2">
                <SearchBar />
              {user &&  
                <Link to="/profile">
                    <img src={user.avatar.avatarBase64} alt="user avatar" className=" w-[52px] h-auto" />
                </Link>
              }
            </div>
        </div>
        
    </div>
  )
}

Navbar.propTypes = {
  activePage: PropTypes.string
}

export default Navbar
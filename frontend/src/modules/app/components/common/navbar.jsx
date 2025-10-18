import { useEffect, useContext,useState } from 'react'

import SearchBar from './searchbar'
import { UserContext } from './user-provider'

import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import backend from '../../../../backend'

const PAGE_TITLES = {
  home: 'Inicio',
  profile: 'Perfil',
  userEdit: 'Editar Perfil',
  createRoutine: 'Crear Rutina',
  myRoutines: 'Mis rutinas',
  createExercise: 'Crear Ejercicio',
  'change-password': 'Cambiar Contraseña',
  validateExercises: 'Validar Ejercicios'
}

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const Navbar = ({activePage}) => {

  const { user } = useContext(UserContext);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      backend.imageService.getImageByName('logo',
        (response) => {
          setLogo(response);
        },
        (error) => {
          console.error(error);
        });
    }
    fetchLogo();
  },[])

  const title = PAGE_TITLES[activePage] || capitalize(activePage) || 'Inicio'

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-row items-center justify-start h-[77px] z-[20] border-b-[1px] border-[#ff0000] bg-[#000000]">
        <Link to="/home">
          <img
            src={logo?.base64}
            alt="logo"
            className="h-12 ml-12"
          />
        </Link>

        <div className="flex flex-row  ml-4 items-center w-full">
            <div className="flex flex-row grow w-full">
                <h1 className="text-white ml-32">{title}</h1>
            </div>
            <div className="flex flex-row items-center justify-between gap-4 mr-4">
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
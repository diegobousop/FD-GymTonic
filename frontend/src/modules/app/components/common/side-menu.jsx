import React, { useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { svgIcons } from '../../../../config/constants'
import MenuItem from './menu-item'
import { UserContext } from "./user-provider"


const { HomeIcon, ProfileIcon, CreateRoutineIcon, CreateExerciseIcon, TrainingIcon, leaderBoardIcon} = svgIcons

const SideMenu = ({ activePage, setActivePage }) => {
  const navigate = useNavigate()
  const { user } = useContext(UserContext)

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
    <div className="fixed left-0 flex flex-col w-[270px] border-r border-[#990000] h-full items-center px-4 py-20">
      <MenuItem title="Inicio" activePage={isActive} page={'home'} onClick={() => go('home', '/home')} icon={HomeIcon} />
      <MenuItem title="Ver perfil" activePage={isActive} page={'profile'} onClick={() => go('profile', '/profile')} icon={ProfileIcon} />
      <MenuItem title="Crear Entrenamiento" activePage={isActive} page={'createTraining'} onClick={() => go('createTraining', '/trainings/create-training')} icon={TrainingIcon} />
      <MenuItem title="Ver Rankings" activePage={isActive} page={'leaderboardsPage'} onClick={()=>go ('leaderboardsPage', '/leaderboard')} icon={ProfileIcon} />
      { user && (user.role === 'USER') &&
      <MenuItem title="Solicitudes" activePage={isActive} page={'ViewFollowRequestsPage'} onClick={() => go('ViewFollowRequestsPage', '/profile/follow-request')} icon={ProfileIcon} />
      }
      { user && (user.role === 'ADMIN' || user.role === 'TRAINER') &&
        <MenuItem title="Crear rutina" activePage={isActive} page={'createRoutine'} onClick={() => go('createRoutine', '/routines/create-routine')} icon={CreateRoutineIcon} />
      }
      { user && (user.role === 'ADMIN' || user.role === 'TRAINER') &&
        <MenuItem title="Crear Ejercicio" activePage={isActive} page={'createExercise'} onClick={() => go('createExercise', '/admin/addExercise')} icon={CreateRoutineIcon} />
      }
      { user && user.role === 'ADMIN' &&
        <MenuItem title="Validar Ejercicios" activePage={isActive} page={'validateExercises'} onClick={() => go('validateExercises', '/admin/validateExercises')} icon={CreateExerciseIcon} />
      }     
      { user && user.role === 'ADMIN' &&
        <MenuItem title="Ver Usuarios" activePage={isActive} page={'seeUsers'} onClick={() => go('seeUsers', '/admin/seeUsers')} icon={ProfileIcon} />
      }
      { user && user.role === 'ADMIN' &&
        <MenuItem title="Bloquear Ejercicios" activePage={isActive} page={'blockExercises'} onClick={() => go('blockExercises', '/admin/blockExercises')} icon={CreateExerciseIcon} />
      }
      { user && user.role === 'TRAINER' &&
        <MenuItem title="Seguidores" activePage={isActive} page={'myFollowers'} onClick={() => go('myFollowers', '/routines/my-followers')} icon={ProfileIcon} />
      }
    </div>
  )
}

export default SideMenu

SideMenu.propTypes = {
  activePage: PropTypes.string,
  setActivePage: PropTypes.func,
}


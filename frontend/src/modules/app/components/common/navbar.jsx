import { useEffect, useContext, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import SearchBar from './searchbar';
import { UserContext } from './user-provider';
import NotificationBell from '../notification/NotificationBell';
import PropTypes from 'prop-types';
import backend from '../../../../backend';

const PAGE_TITLES = {
  home: 'Inicio',
  profile: 'Perfil',
  userEdit: 'Editar Perfil',
  createRoutine: 'Crear Rutina',
  myRoutines: 'Mis rutinas',
  createExercise: 'Crear Ejercicio',
  'change-password': 'Cambiar Contraseña',
  validateExercises: 'Validar Ejercicios',
  search: 'Resultados de Búsqueda',
  blockExercises: 'Bloquear Ejercicios',
  createTraining: 'Crear Entrenamiento',
  myFollowers: 'Control de Seguidores'
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const Navbar = ({ activePage }) => {
  const { user } = useContext(UserContext);
  const [logo, setLogo] = useState(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ trainerName: '', muscleGroup: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const title = PAGE_TITLES[activePage] || capitalize(activePage) || 'Inicio';

  useEffect(() => {
    const fetchLogo = async () => {
      backend.imageService.getImageByName(
        'logo',
        (response) => setLogo(response),
        (error) => console.error(error)
      );
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    const text = searchParams.get('text') || '';
    const trainerName = searchParams.get('trainerName') || '';
    const muscleGroup = searchParams.get('muscleGroup') || '';
    setQuery(text);
    setFilters({ trainerName, muscleGroup });
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.append('text', query);
    if (filters.trainerName.trim()) params.append('trainerName', filters.trainerName);
    if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
    navigate(`/search/full?${params.toString()}`);
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-row items-center justify-start h-[77px] z-[20]
     border-b-[1px] border-[#990000] bg-[#000000]">
      <Link to="/home">
        <img src={logo?.base64} alt="logo" className="h-12 ml-16" />
      </Link>

      <div className="flex flex-row ml-4 items-center w-full">
        <div className="flex flex-row grow w-full">
          <h1 className="text-white ml-32">{title}</h1>
        </div>
        <div className="flex flex-row items-center justify-between gap-4 mr-4">
          <SearchBar
            query={query}
            setQuery={setQuery}
            filters={filters}
            setFilters={setFilters}
            onSearch={handleSearch}
          />

          {user && <NotificationBell />}

          {user && (
            <Link to="/profile">
              <img src={user.avatar.avatarBase64} alt="user avatar" className="w-[52px] h-auto" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  activePage: PropTypes.string
};

export default Navbar;

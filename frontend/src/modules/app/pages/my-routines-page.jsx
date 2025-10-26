import { useState, useEffect, useContext } from 'react';
import backend from "../../../backend";
import { UserContext } from "../components/common/user-provider";
import Pager from '../components/common/pager';
import RoutineCard from '../components/routine/routine-card';


const MyRoutines = () => {
  const { user } = useContext(UserContext);
  const [page, setPage] = useState(0);
  const [existMoreItems, setExistMoreItems] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const size = 4;

  const viewRoutines = (pageNumber) => {
    setLoading(true);
    backend.routineService.searchRoutines(
        user.id, null,
      { page: pageNumber, size },
      (data) => {
        setRoutines(data.items);
        setExistMoreItems(data.existMoreItems);
        setPage(pageNumber);
        setLoading(false);
      },
      (err) => {
        setError(err || "Error inesperado al cargar rutinas");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    viewRoutines(0);
  }, []);

  
  if (loading) return <p className="text-white">Cargando rutinas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!loading && !error && routines.length === 0) return <p className="text-red-100 mt-10 ml-10">No has creado ninguna rutina</p>;

  return (
    <div className="flex flex-col mt-10 justify-start ml-10 mr-10">
      <div className="flex flex-col space-y-4">
        {routines.map(routine => (
          <RoutineCard Routine routine={routine} key={routine.id}/>
        ))}
      </div>

      <Pager back={{ enabled: page > 0, onClick: () => viewRoutines(page - 1) }} next={{ enabled: existMoreItems, onClick: () => viewRoutines(page + 1) }}/>
    </div>
  );
};

export default MyRoutines;

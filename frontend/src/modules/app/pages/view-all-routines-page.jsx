import React, { useState, useEffect, useContext } from 'react';
import backend from "../../../backend";
import { UserContext } from "../components/common/user-provider";
import Pager from '../components/common/pager';
import Routine from '../components/common/routine';

const ViewAllRoutines = () => {
  const { user } = useContext(UserContext);
  const [page, setPage] = useState(0);
  const [existMoreItems, setExistMoreItems] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [permissionError, setPermissionError] = useState("");

  const size = 4;

  const viewRoutines = (pageNumber) => {
    setLoading(true);
    backend.routineService.viewAllRoutines(
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
  if (!loading && !error && routines.length === 0) return <p className="text-red-100 mt-10 ml-10">Todavía no hay rutinas disponibles</p>;

  return (
    <div className="flex flex-col mt-10 justify-start ml-10 mr-10">

      {successMessage && <div className="bg-green-500 text-white p-3 rounded mb-4">{successMessage}</div>}
      {deleteMessage && <div className="bg-blue-500 text-white p-3 rounded mb-4">{deleteMessage}</div>}
      {permissionError && <div className="bg-red-500 text-white p-3 rounded mb-4">⚠️ {permissionError}</div>}

      <div className="flex flex-col space-y-4">
        {routines.map(routine => (
          <Routine Routine routine={routine} key={routine.id}/>
        ))}
      </div>

      <Pager back={{ enabled: page > 0, onClick: () => viewRoutines(page - 1) }} next={{ enabled: existMoreItems, onClick: () => viewRoutines(page + 1) }}/>
    </div>
  );
};

export default ViewAllRoutines;

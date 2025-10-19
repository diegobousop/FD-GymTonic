import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import backend from "../../../backend";
import { UserContext } from "../components/common/user-provider";
import Pager from '../components/common/pager';
import { viewAllUsers } from '../../../backend/userService';

const ViewAllUsers = () => {

  const { user } = useContext(UserContext);
  const [page, setPage] = useState(0);  
	const [existMoreItems, setExistMoreItems] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [userBlockedErr, setUserBlockedErr] = useState("");

    
  const size = 4;

	const viewListOfUsers = (pageNumber) => {
    setLoading(true);
    backend.userService.viewAllUsers(
        {page: pageNumber, size}, 
        (data) => {
          setUsers(data.items);
          setExistMoreItems(data.existMoreItems);
          setPage(pageNumber);
          setLoading(false);
        },
        (err) => {
          setError(err || "Error inesperado al cargar usuarios");
          setLoading(false);
        }
    )
	};

  const handleBlockUser = (userId) => {
    backend.userService.blockUser(
      userId,
      () => {
        setBlockedUsers(prev => [...prev, userId]);
        setUserBlockedErr(null);
      },
      (err) =>{
        let message = "Error al bloquear usuario";
        if (typeof err === "string") message = err;
        else if (err?.globalError) message = err.globalError.replace(/"/g, "");
        setUserBlockedErr(message);
      }
    )
  };

  useEffect(() => {
    viewListOfUsers(0);
  }, []);

  return (
    <div className="flex flex-col mt-10 justify-start ml-10 mr-10">
      <h2 className="text-white">Usuarios</h2>

      {successMessage && <div className="bg-green-500 text-white p-3 rounded mb-4">{successMessage}</div>}
      {userBlockedErr && <div className="bg-red-500 text-white p-3 rounded mb-4">⚠️ {userBlockedErr}</div>}

      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr" }}>
      {users.map(user => (
        <div key={user.id} className="bg-[#262626] p-4 rounded-lg shadow-md flex items-center justify-between">
          {/* Columna 1: info usuario */}
          <div>
            <Link to={`/users/${user.id}`}>
              <h3 className="text-xl text-white">
                <strong>{user.userName}</strong> <small>{user.firstName}</small> <small>{user.lastName}</small>
              </h3>
            </Link>
            <p className="text-white">{user.email}</p>
          </div>

          {/* Columna 2: rol */}
          <div className="text-white text-center">
            <strong>{user.role}</strong>
          </div>

          {/* Columna 3: botón */}
          <button
            onClick={() => handleBlockUser(user.id)}
            disabled={blockedUsers.includes(user.id)} // desactiva si ya está bloqueado
            className={`px-3 py-1 rounded text-sm transition ${
              blockedUsers.includes(user.id)
                ? "bg-gray-600 text-white cursor-not-allowed"
                : "bg-red-800 text-white hover:bg-red-900"
            }`}
          >
            {blockedUsers.includes(user.id) ? "Bloqueado" : "Bloquear"}
          </button>
        </div>
      ))}
      </div>

      <Pager back={{ enabled: page > 0, onClick: () => viewListOfUsers(page - 1) }} next={{ enabled: existMoreItems, onClick: () => viewListOfUsers(page + 1) }}/>
    </div>
  );
};
export default ViewAllUsers;
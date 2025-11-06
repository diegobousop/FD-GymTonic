import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../components/common/user-provider';
import { getFollowers } from '../../../backend/userService';
import SendButton from '../components/common/send-button';

const UserFollowersPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const size = 10;

  const loadFollowers = useCallback(() => {
    setLoading(true);
    getFollowers(
      { page, size },
      (data) => {
        if (page === 0) {
          setFollowers(data.items || []);
        } else {
          setFollowers(prev => [...prev, ...(data.items || [])]);
        }
        setHasMore(data.existMoreItems || false);
        setLoading(false);
      },
      (err) => {
        console.error('Error al cargar seguidores:', err);
        setLoading(false);
      }
    );
  }, [page, size]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      loadFollowers();
    }
  }, [user, loadFollowers]);

  const getPageTitle = () => {
    if (user?.role === 'USER') {
      return 'Mis Seguidores';
    } else if (user?.role === 'TRAINER') {
      return 'Mis Subscriptores';
    }
    return 'Seguidores';
  };

  if (user?.role === 'ADMIN') {
    return (
      <div className="p-6 text-white">
        <p>Los administradores no tienen seguidores.</p>
        <button
          onClick={() => navigate('/profile')}
          className="text-white underline hover:text-blue-400 cursor-pointer"
        >
          ← Volver al perfil
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="mb-4">
        <button
          onClick={() => navigate('/profile')}
          className="text-white underline hover:text-blue-400 cursor-pointer"
        >
          ← Volver al perfil
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">{getPageTitle()}</h2>

      {loading && followers.length === 0 ? (
        <p>Cargando...</p>
      ) : followers.length > 0 ? (
        <>
          <ul className="space-y-2 mb-4">
            {followers.map((follower) => (
              <li
                key={follower.id}
                className="border border-gray-700 p-2 rounded-md shadow-sm flex items-center gap-3"
              >
                <div className="flex items-center gap-3">
                  {follower.avatarBase64 ? (
                    <img
                      src={follower.avatarBase64}
                      alt={follower.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                      {follower.userName ? follower.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span>{follower.userName}</span>
                </div>
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="flex justify-center">
              <SendButton
                children={loading ? 'Cargando...' : 'Cargar más'}
                onClick={() => setPage(prev => prev + 1)}
                isLoading={loading}
              />
            </div>
          )}
        </>
      ) : (
        <p>No tienes seguidores aún.</p>
      )}
    </div>
  );
};

export default UserFollowersPage;


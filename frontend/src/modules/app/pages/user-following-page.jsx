import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../components/common/user-provider';
import { getFollowing } from '../../../backend/userService';
import SendButton from '../components/common/send-button';

const UserFollowingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const size = 10;

  const loadFollowing = useCallback(() => {
    setLoading(true);
    getFollowing(
      { page, size },
      (data) => {
        if (page === 0) {
          setFollowing(data.items || []);
        } else {
          setFollowing(prev => [...prev, ...(data.items || [])]);
        }
        setHasMore(data.existMoreItems || false);
        setLoading(false);
      },
      (err) => {
        console.error('Error al cargar seguidos:', err);
        setLoading(false);
      }
    );
  }, [page, size]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      loadFollowing();
    }
  }, [user, loadFollowing]);

  if (user?.role === 'ADMIN') {
    return (
      <div className="p-6 text-white">
        <p>Los administradores no siguen a otros usuarios.</p>
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

      <h2 className="text-2xl font-bold mb-4">
        {user?.role === 'TRAINER' ? 'Usuarios a los que sigo' : 'Personas que sigo'}
      </h2>

      {loading && following.length === 0 ? (
        <p>Cargando...</p>
      ) : following.length > 0 ? (
        <>
          <ul className="space-y-2 mb-4">
            {following.map((followed) => (
              <li
                key={followed.id}
                className="border border-gray-700 p-2 rounded-md shadow-sm flex items-center gap-3"
              >
                <div className="flex items-center gap-3">
                  {followed.avatarBase64 ? (
                    <img
                      src={followed.avatarBase64}
                      alt={followed.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                      {followed.userName ? followed.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span>{followed.userName}</span>
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
        <p>No sigues a nadie aún.</p>
      )}
    </div>
  );
};

export default UserFollowingPage;


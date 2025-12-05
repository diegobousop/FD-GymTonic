import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../common/user-provider';
import backend from '../../../../backend';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
  const { user } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = () => {
    backend.notificationService.getUnreadCount(
      (data) => {
        setUnreadCount(data);
      },
      (error) => console.error('Error al cargar contador:', error)
    )
  };

  // Cerrar el panel si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showPanel &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPanel]);

  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

  const handleNotificationClick = (notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      backend.notificationService.readNotification(
        notification.id,
        () => {
          setUnreadCount(prev => Math.max(prev - 1, 0));
          //solo navegamos a la rutina o entrenamiento si la notificación no estaba leida
          if(notification.routineId!=null) navigate(`/routines/${notification.routineId}`)
          else if(notification.trainingId!=null) navigate(`/trainings/${notification.trainingId}/details`);
        },
        (error) => console.error('Error al marcar notificación:', error)
      );
      setShowPanel(false);
      //Solicitamos las notificaciones de nuevo para actualizar el panel
      loadUnreadCount();

    }

    else{ //Si está leída, la marcamos como no leída al hacer click y dejamos el panel abierto
      backend.notificationService.unreadNotification(
        notification.id,
        () => {
          setUnreadCount(prev => prev + 1);
        },
        (error) => console.error('Error al marcar notificación como no leída:', error)
      );
    }

  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Notificaciones"
        onClick={togglePanel}
        className="relative p-2 rounded hover:bg-white/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <NotificationPanel
          ref={panelRef}
          onNotificationClick={handleNotificationClick}
          onClose={() => setShowPanel(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;

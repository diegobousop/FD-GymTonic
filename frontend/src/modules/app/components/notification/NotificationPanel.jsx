import { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import backend from '../../../../backend';
import NotificationItem from './NotificationItem';
import Pager from '../common/pager';
import Spinner from '../common/spinner';

const NotificationPanel = forwardRef(({ onNotificationClick, onClose }, ref) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [existMoreItems, setExistMoreItems] = useState(false);
  const size = 5;

  useEffect(() => {
    loadNotifications(page);
  }, [page]);

  const loadNotifications = (pageNumber) => {
    setLoading(true);
    backend.notificationService.getNotifications(
      { page: pageNumber, size },
      (data) => {
        setNotifications(data.items || []);
        setExistMoreItems(data.existMoreItems || false);
        setLoading(false);
      },
      (error) => {
        console.error('Error al cargar notificaciones:', error);
        setLoading(false);
      }
    );
  };

  const handleNotificationClick = (notification) => {
    onNotificationClick(notification);
    // Recargar la página actual después de marcar como leída
    loadNotifications(page);
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-96 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-50"
    >
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-white font-semibold">Notificaciones</h3>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">No hay notificaciones</div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </>
        )}
      </div>

      {!loading && notifications.length > 0 && (
        <div className="p-2 border-t border-gray-700">
          <Pager
            back={{
              enabled: page > 0,
              onClick: () => setPage(page - 1)
            }}
            next={{
              enabled: existMoreItems,
              onClick: () => setPage(page + 1)
            }}
          />
        </div>
      )}
    </div>
  );
});

NotificationPanel.displayName = 'NotificationPanel';

NotificationPanel.propTypes = {
  onNotificationClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default NotificationPanel;

import PropTypes from 'prop-types';

const NotificationItem = ({ notification, onClick }) => {
  return (
    <button
      type="button"
      className={`w-full text-left p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition ${
        !notification.read ? 'bg-gray-900' : 'bg-[#1a1a1a]'
      }`}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-2">
        {!notification.read && (
          <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
        )}
        <div className="flex-1">
          <p className="text-white text-sm break-words">{notification.message}</p>
          <p className="text-gray-500 text-xs mt-1">{notification.date}</p>
        </div>
      </div>
    </button>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export default NotificationItem;

import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const TrainingCard = ({ training }) => {
  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const avatar = training.creatorAvatarBase64 || null;

  return (
    <div className="bg-[#1E1E1E] p-6 rounded-xl shadow-md w-full">
      <div className="flex items-center gap-4">
        {avatar ? (
          <Link to={`/profile/${training.creatorId}`}>
            <img
              src={avatar}
              className="w-[40px] h-[40px] rounded-full object-cover"
              alt="avatar"
            />
          </Link>
        ) : (
          <div className="w-[40px] h-[40px] rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
            ?
          </div>
        )}

        <div>
          <Link
            to={`/profile/${training.creatorId}`}
            className="text-white font-semibold hover:text-[#CA0D0A]"
          >
            {training.creatorUserName}
          </Link>
          <p className="text-gray-400 text-sm">{formatDate(training.creationDate)}</p>
        </div>
      </div>

      {training.routineId ? (
        <Link
          to={`/routines/${training.routineId}`}
          className="text-white text-xl mt-4 inline-block hover:text-[#CA0D0A]"
        >
          {training.name}
        </Link>
      ) : (
        <p className="text-white text-xl mt-4">{training.name}</p>
      )}

      {training.description && <p className="text-gray-300 mt-2">{training.description}</p>}

      <p className="text-gray-400 mt-3">
        {training.duration} min · {training.exercises?.length || 0} ejercicios
      </p>
    </div>
  );
};

TrainingCard.propTypes = {
  training: PropTypes.shape({
    creatorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    creatorUserName: PropTypes.string.isRequired,
    creatorAvatarBase64: PropTypes.string,
    creationDate: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    duration: PropTypes.number.isRequired,
    exercises: PropTypes.array,
    routineId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

export default TrainingCard;

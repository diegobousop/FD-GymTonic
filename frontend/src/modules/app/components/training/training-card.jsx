import PropTypes from "prop-types";

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

  return (
    <div className="bg-[#1E1E1E] p-6 rounded-xl shadow-md w-full">
      {/* Cabecera con avatar + usuario + fecha */}
      <div className="flex items-center gap-4">
        {training.creatorAvatarBase64 ? (
          <img
            src={training.creatorAvatarBase64}
            className="w-[40px] h-[40px] rounded-full object-cover"
            alt="avatar"
          />
        ) : (
          <div className="w-[40px] h-[40px] rounded-full bg-gray-700" />
        )}

        <div>
          <p className="text-white font-semibold">
            {training.creatorUserName}
          </p>
          <p className="text-gray-400 text-sm">
            {formatDate(training.creationDate)}
          </p>
        </div>
      </div>

      {/* Nombre del entrenamiento */}
      <p className="text-white text-xl mt-4">{training.name}</p>

      {/* Descripción */}
      {training.description && (
        <p className="text-gray-300 mt-2">{training.description}</p>
      )}

      {/* Duración y nº ejercicios */}
      <p className="text-gray-400 mt-3">
        {training.duration} min · {training.exercises?.length || 0} ejercicios
      </p>
    </div>
  );
};

TrainingCard.propTypes = {
  training: PropTypes.object.isRequired,
};

export default TrainingCard;

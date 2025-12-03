import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backend from "../../../backend";
import Exercise from "../components/exercise/exercise";
import CommentSection from "../components/comments/comment-section";
import { Link } from "react-router-dom";
import {svgIcons} from "../../../config/constants";
import BubbleButton from "../components/common/bubble-button";

const TrainingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(null);

  const loadTrainingDetails = () => {
    setLoading(true);
    backend.routineService.getTrainingDetails(
      id,
      (data) => {
        if (!data) {
          setTraining(null);
          setLoading(false);
          return;
        }
        setTraining(data);
        setLoading(false);
      },
      (err) => {
        setError(err || "Error al cargar el entrenamiento");
        setLoading(false);
      }
    );
  };

  const loadIsLikedStatus = () => {
    backend.routineService.isLikedTraining(
      id,
      (data) => {
        setIsLiked(data);
      },
      (err) => {
        console.error("Error al verificar si el entrenamiento está marcada como me gusta", err);
      }
    );
  }

  const loadLikesCount = () => {
    backend.routineService.getTrainingLikesCount(
      id,
      (data) => {
        setLikes(data);
      },
      (err) => {
        console.error("Error al ver el numero de likes", err);
      }
    );
  }

  useEffect(() => {
    loadTrainingDetails();
    loadIsLikedStatus();
    loadLikesCount();
  }, [id]);

  const handleLikeTraining = () => {
    const action = isLiked
      ? backend.routineService.unlikeTraining
      : backend.routineService.likeTraining;
    
    action(
      id,
      () => {
        setIsLiked(!isLiked);
        setLikes((prevLikes) => prevLikes + (isLiked ? -1 : 1));
      },
      (err) => {
        console.error("Error al actualizar like", err);
      }
    );
  };

  if (loading) return <p>Cargando entrenamiento...</p>;
  if (error) return <p>{error}</p>;
  if (!training) return <p>No se encontró el entrenamiento</p>;

  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          {training.isPublic !== undefined && (
            <span className={`text-sm py-1 text-gray-400 rounded`}>
              {training.isPublic ? "Entrenamiento público" : "Entrenamiento privado"}
            </span>
          )}
          <h2 className="text-3xl font-bold text-white">{training.name}</h2>
          {training.description && (
            <p className="text-gray-400 mt-2">{training.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-row items-center self-start mt-5 mb-5 flex-wrap">
        {training.creatorUserName && (
          <>
            <p className="mx-3">{training.creatorUserName}</p>
            <span className="text-white">•</span>
          </>
        )}
        <p className="mx-3">{training.duration} minutos</p>
        {training.creationDate && (
          <>
            <span className="text-white">•</span>
            <p className="mx-3">{new Date(training.creationDate).toLocaleDateString()}</p>
          </>
        )}
        <span className="text-white mr-3">•</span>
        <BubbleButton 
          icon={<svgIcons.LikeIcon
          className={isLiked ? "text-[#FF0000]" : "text-[#000000]"}
          />}
          ariaLabel={isLiked ? "Unlike Training" : "Like Training"}
          size = {45}
          onClick={() => handleLikeTraining()}
          />
          <p className="mx-3">{likes ? likes : 0} Likes</p>
      </div>

      {training.routineName && (
        <div className="mb-5">
          <p className="text-gray-300">
            <span className="font-semibold">Rutina:</span>{" "}
                <Link to={`/routines/${training.routineId}`}
                className="font-semibold text-[18px] text-white mb-3 hover:text-[#CA0D0A]">
                    {training.routineName}
                </Link>
          </p>
        </div>
      )}

      {training.exercises && training.exercises.length > 0 && (
        <ul className="list-disc list-inside space-y-3">
          {training.exercises.map((ex) => (
            <Exercise
              ex={ex}
              routineId={null}
              routineCreator={null}
              onExerciseUpdated={() => {}}
              initialSeries={ex.series || []}
              key={ex.id}
            />
          ))}
        </ul>
      )}

      <CommentSection trainingId = {id}/>     

      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white font-semibold transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default TrainingDetailsPage;

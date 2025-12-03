import { useEffect, useState, useContext } from "react"
import { Link } from "react-router-dom";
import { getProfileById } from "../../../../backend/userService"
import { deleteComment } from "../../../../backend/commentService"
import { UserContext } from "../common/user-provider";
import BubbleButton from '../common/bubble-button'
import { svgIcons } from '../../../../config/constants'

// Comment tiene id, mensaje, fecha, trainingId, userId
const Comment = ({ comment, trainingId, onDelete }) => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);

    const handleDelete = () => {

        if (window.confirm(`¿Seguro que quieres eliminar el comentario?`)) {
            deleteComment(
                comment.id,
                trainingId,
                () => { onDelete(); },
                (err) => {
                    setError(err.globalError || "Error al eliminar el comentario");
                }
            );
        }
    };

    useEffect(() => {
        getProfileById(
            comment.userId, 
            (profile) => {
                setProfile(profile);
            },
            (err) => {
                setError(err || "Error inesperado al cargar comentarios");
            }
        );
    }, [comment.userId]);

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!profile) {
        return <p className="text-gray-400 mx-3">Cargando usuario...</p>;
    }

    return (
        <div className="flex flex-row items-center justify-between border border-red-900 text-white w-full">
            
            {/* Contenedor de avatar + texto */}
            <div className="flex flex-row items-center">
                <img src={profile.avatar.avatarBase64} className="mx-2 w-[40px] h-[40px]"/>
                
                <div className="flex flex-col">
                    <p className="mx-3">
                        <Link
                            to={`/profile/${comment.userId}`}
                            className="text-white hover:text-[#CA0D0A]"
                        >
                            {profile.userName}
                        </Link>
                        <span className="text-sm ml-2">
                            ({comment.fecha?.substring(0, 10)} • {comment.fecha?.substring(11, 16)})
                        </span>
                    </p>

                    <p className="text-white mx-3">{comment.mensaje}</p>
                </div>
            </div>

            {/* Botón alineado a la derecha */}
            {(user?.role === "ADMIN" || user?.userName === profile.userName) && (
                <BubbleButton 
                    icon={<svgIcons.RoutineDeleteIcon className="text-[#ff0000]"/>}
                    ariaLabel="Eliminar comentario"
                    size={40}
                    onClick={handleDelete}
                />
            )}
        </div>
    )}

  export default Comment
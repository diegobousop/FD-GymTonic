import { useState } from "react";
import SendButton from "../common/send-button";
import { addComment } from "../../../../backend/commentService";

const CommentForm = ({ trainingId, onCommentAdded }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setError("El comentario no puede estar vacío");
            return;
        }

        setLoading(true);
        setError(null);

        addComment(
            trainingId,
            message,
            () => {
                setMessage("");
                setLoading(false);
                if (onCommentAdded) onCommentAdded();
            },
            (err) => {
                setError(err || "Error al enviar el comentario");
                setLoading(false);
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col mt-5 space-y-3">
            <textarea
                className="bg-[#262626] text-[#f4f4f4] text-xs w-full px-4  py-4 
                border-b border-[#3d3d3d] focus:outline-none focus:border-[#ff0000] resize-none"
                placeholder="Escribe un comentario..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
            />
            <SendButton onClick={handleSubmit}>Publicar</SendButton>
            
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-white">Enviando comentario...</p>}

            
        </form>
    );
};

export default CommentForm;

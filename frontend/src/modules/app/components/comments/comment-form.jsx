import { useState } from "react";
import SendButton from "../common/send-button";
import { addComment } from "../../../../backend/commentService";
import PropTypes from 'prop-types'

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
            <div className="w-full">
                <textarea
                    className="bg-[#262626] text-[#f4f4f4] text-xs w-full px-4 py-4 
                    border-b border-[#3d3d3d] focus:outline-none focus:border-[#ff0000] resize-none"
                    placeholder="Escribe un comentario..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={500}
                />

                <p
                    className={
                        "text-right text-xs mt-1 " +
                        (message.length >= 500 ? "text-red-500" : "text-gray-400")
                    }
                >
                    {message.length}/500
                </p>
            </div>
            <SendButton onClick={handleSubmit}>Publicar</SendButton>
            
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p className="text-white">Enviando comentario...</p>}

            
        </form>
    );
};

CommentForm.propTypes = {
  trainingId: PropTypes.number.isRequired,
  onCommentAdded: PropTypes.func,
}

export default CommentForm;

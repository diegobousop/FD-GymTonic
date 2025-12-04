import { useState, useEffect } from 'react';
import { getComments } from "../../../../backend/commentService"
import Pager from '../common/pager';
import Comment from "./comment"
import CommentForm from "./comment-form"
import PropTypes from 'prop-types'

const CommentSection = ({ trainingId }) => {
    const [page, setPage] = useState(0);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [existMoreItems, setExistMoreItems] = useState(false);
    const [error, setError] = useState(null);

    const size = 5;

    const handleDelete = (id) => {
        setComments(prev => prev.filter(x => x.id !== id));
    };

    const loadComments = (pageNumber) => {
        setLoading(true);
        getComments(
            trainingId,
            { page: pageNumber, size },
            (data) => {
                setComments(data.items);
                setExistMoreItems(data.existMoreItems);
                setPage(pageNumber);
                setLoading(false);
            },
            (err) => {
                setError(err || "Error inesperado al cargar comentarios");
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        loadComments(0);
    }, []);

    if (loading) return <p className="text-white">Cargando comentarios...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!loading && !error && comments.length === 0)
        return <p className="text-red-100 mt-10 ml-10">
            <div className="mb-5">
                <CommentForm trainingId={trainingId} onCommentAdded={() => loadComments(page)} />
            </div>
            Sé tú el primero en comentar algo!
            </p>;

    return (
        <div className="mt-5 ml-5 mr-5">
            <span className="text-2xl text-white font-bold">Comentarios:</span>
            <div className="">
                <CommentForm trainingId={trainingId} onCommentAdded={() => loadComments(page)} />
            </div>
            

            <div className="mt-4 flex flex-col gap-4">
                {comments.map((comment) => (
                    <Comment key={comment.id} 
                    comment={comment} 
                    trainingId={trainingId} 
                    onDelete={() => handleDelete(comment.id)}
                    />
                ))}
            </div>

            <div className="mt-4">
                <Pager
                    back={{
                        enabled: page > 0,
                        onClick: () => loadComments(page - 1),
                    }}
                    next={{
                        enabled: existMoreItems,
                        onClick: () => loadComments(page + 1),
                    }}
                />
            </div>
        </div>
    );
};

CommentSection.propTypes = {
  trainingId: PropTypes.number.isRequired,
}

export default CommentSection;

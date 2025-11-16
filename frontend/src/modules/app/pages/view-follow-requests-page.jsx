import { useState, useEffect } from "react";
import backend from "../../../backend";

const ViewFollowRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // Cargar solicitudes pendientes
    const loadRequests = () => {
        setLoading(true);
        backend.userService.getFollowRequests(
            (data) => {
                setRequests(data || []);
                setLoading(false);
            },
            (err) => {
                console.error("Error cargando solicitudes:", err);
                setLoading(false);
            }
        );
    };

    // Aceptar solicitud
    const handleAccept = (requestId) => {
        setProcessingId(requestId);
        backend.userService.acceptFollowRequest(
            requestId,
            () => {
                setRequests((prev) => prev.filter((r) => r.id !== requestId));
                setProcessingId(null);
            },
            (err) => {
                console.error("Error al aceptar solicitud:", err);
                setProcessingId(null);
            }
        );
    };

    // Rechazar solicitud
    const handleReject = (requestId) => {
        setProcessingId(requestId);
        backend.userService.rejectFollowRequest(
            requestId,
            () => {
                setRequests((prev) => prev.filter((r) => r.id !== requestId));
                setProcessingId(null);
            },
            (err) => {
                console.error("Error al rechazar solicitud:", err);
                setProcessingId(null);
            }
        );
    };

    useEffect(() => {
        loadRequests();
    }, []);

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Solicitudes de seguimiento
            </h1>

            {loading ? (
                <div className="flex justify-center py-10">
                    <p className="text-gray-500 text-lg">Cargando solicitudes...</p>
                </div>
            ) : requests.length === 0 ? (
                <p className="text-center text-gray-500">
                    No tienes solicitudes pendientes.
                </p>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            className="border border-gray-700 p-2 rounded-md shadow-sm flex items-center justify-between"
                        >
                            <div>
                                <p className="text-lg font-semibold">{req.senderUserName}</p>
                                <p className="text-sm text-white-500">quiere seguirte</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAccept(req.id)}
                                    disabled={processingId === req.id}
                                    className={`px-4 py-2 rounded-lg text-white font-medium ${
                                        processingId === req.id
                                            ? "bg-green-400 cursor-wait"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {processingId === req.id ? "Aceptando..." : "Aceptar"}
                                </button>
                                <button
                                    onClick={() => handleReject(req.id)}
                                    disabled={processingId === req.id}
                                    className={`px-4 py-2 rounded-lg text-white font-medium ${
                                        processingId === req.id
                                            ? "bg-red-400 cursor-wait"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {processingId === req.id ? "Rechazando..." : "Rechazar"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewFollowRequestsPage;

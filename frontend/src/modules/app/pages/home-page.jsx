import { useState, useEffect } from "react";
import backend from "../../../backend";
import Pager from "../components/common/pager";
import RoutineCard from "../components/routine/routine-card";
import TrainingCard from "../components/training/training-card";
import Spinner from "../components/common/spinner";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("routines"); // "routines" | "feed"

  // ---- Rutinas ----
  const [page, setPage] = useState(0);
  const [existMoreItems, setExistMoreItems] = useState(false);
  const [routines, setRoutines] = useState([]);

  // ---- Feed ----
  const [feedPage, setFeedPage] = useState(0);
  const [feedMoreItems, setFeedMoreItems] = useState(false);
  const [feedItems, setFeedItems] = useState([]);

  // ---- Loading / Error ----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const size = 4;

  // Cargar rutinas
  const viewRoutines = (pageNumber) => {
    setLoading(true);
    backend.routineService.viewAllRoutines(
      { page: pageNumber, size },
      (data) => {
        setRoutines(data.items);
        setExistMoreItems(data.existMoreItems);
        setPage(pageNumber);
        setLoading(false);
      },
      (err) => {
        setError(err || "Error inesperado al cargar rutinas");
        setLoading(false);
      }
    );
  };

  // Cargar feed
  const viewFeed = (pageNumber) => {
    setLoading(true);
    backend.routineService.viewFeed(
      pageNumber,
      size,
      (data) => {
        setFeedItems(data.items);
        setFeedMoreItems(data.existMoreItems);
        setFeedPage(pageNumber);
        setLoading(false);
      },
      (err) => {
        setError(err || "Error inesperado al cargar feed");
        setLoading(false);
      }
    );
  };

  // Inicialmente carga rutinas
  useEffect(() => {
    viewRoutines(0);
  }, []);

  // Cambio de tab → cargar feed si no está cargado
  useEffect(() => {
    if (activeTab === "feed" && feedItems.length === 0 && !loading) {
      viewFeed(0);
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col mt-10 ml-10 mr-10">

      {/* ---------- SELECTOR SUPERIOR ---------- */}
      <div className="flex gap-6 mb-6 text-lg font-semibold">
        <button
          className={`pb-2 ${
            activeTab === "routines"
              ? "text-white border-b-2 border-[#CA0D0A]"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("routines")}
        >
          Rutinas
        </button>

        <button
          className={`pb-2 ${
            activeTab === "feed"
              ? "text-white border-b-2 border-[#CA0D0A]"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("feed")}
        >
          Feed
        </button>
      </div>

      {/* ---------- CONTENIDO ---------- */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : activeTab === "routines" ? (
        <>
          {routines.length === 0 ? (
            <p className="text-red-100">Todavía no hay rutinas disponibles</p>
          ) : (
            <>
              <div className="flex flex-col space-y-4">
                {routines.map((routine) => (
                  <RoutineCard routine={routine} key={routine.id} />
                ))}
              </div>

              <Pager
                back={{ enabled: page > 0, onClick: () => viewRoutines(page - 1) }}
                next={{
                  enabled: existMoreItems,
                  onClick: () => viewRoutines(page + 1),
                }}
              />
            </>
          )}
        </>
      ) : (
        /* ---------- FEED ---------- */
        <>
          {feedItems.length === 0 ? (
            <p className="text-gray-200">No hay actividades de tus seguidos.</p>
          ) : (
            <>
              <div className="flex flex-col space-y-6">
                {feedItems.map((t) => (
                  <TrainingCard key={t.id} training={t} />
                ))}
              </div>

              <Pager
                back={{
                  enabled: feedPage > 0,
                  onClick: () => viewFeed(feedPage - 1),
                }}
                next={{
                  enabled: feedMoreItems,
                  onClick: () => viewFeed(feedPage + 1),
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;

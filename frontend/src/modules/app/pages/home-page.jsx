import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import backend from "../../../backend";
import Pager from "../components/common/pager";
import RoutineCard from "../components/routine/routine-card";
import TrainingCard from "../components/training/training-card";
import Spinner from "../components/common/spinner";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "routines";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [page, setPage] = useState(0);
  const [existMoreItems, setExistMoreItems] = useState(false);
  const [routines, setRoutines] = useState([]);

  const [feedPage, setFeedPage] = useState(0);
  const [feedMoreItems, setFeedMoreItems] = useState(false);
  const [feedItems, setFeedItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const size = 4;

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

  useEffect(() => {
    viewRoutines(0);
  }, []);

  useEffect(() => {
    if (activeTab === "feed" && feedItems.length === 0 && !loading) {
      viewFeed(0);
    }
  }, [activeTab, feedItems.length, loading]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const renderRoutinesTab = () => {
    if (routines.length === 0) {
      return <p className="text-red-100">Todavía no hay rutinas disponibles</p>;
    }

    return (
      <>
        <div className="flex flex-col space-y-4">
          {routines.map((routine) => (
            <RoutineCard
              routine={routine}
              key={routine.id}
              className="whitespace-nowrap"
            />
          ))}
        </div>

        <Pager
          back={{ enabled: page > 0, onClick: () => viewRoutines(page - 1) }}
          next={{ enabled: existMoreItems, onClick: () => viewRoutines(page + 1) }}
        />
      </>
    );
  };

  const renderFeedTab = () => {
    if (feedItems.length === 0) {
      return <p className="text-gray-200">No hay actividades de tus seguidos.</p>;
    }

    return (
      <>
        <div className="flex flex-col space-y-6">
          {feedItems.map((t) => (
            <TrainingCard key={t.id} training={t} />
          ))}
        </div>

        <Pager
          back={{ enabled: feedPage > 0, onClick: () => viewFeed(feedPage - 1) }}
          next={{ enabled: feedMoreItems, onClick: () => viewFeed(feedPage + 1) }}
        />
      </>
    );
  };

  const renderContent = () => {
    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;

    return activeTab === "routines" ? renderRoutinesTab() : renderFeedTab();
  };

  return (
    <div className="flex flex-col mt-10 ml-10 mr-10">
      <div className="flex items-center gap-6 mb-6 text-lg font-semibold">
        <button
          className={`pb-2 ${
            activeTab === "routines"
              ? "text-white border-b-2 border-[#CA0D0A]"
              : "text-gray-400"
          }`}
          onClick={() => handleTabChange("routines")}
        >
          Rutinas
        </button>

        <span className="text-gray-500">|</span>

        <button
          className={`pb-2 ${
            activeTab === "feed"
              ? "text-white border-b-2 border-[#CA0D0A]"
              : "text-gray-400"
          }`}
          onClick={() => handleTabChange("feed")}
        >
          Siguiendo
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default HomePage;

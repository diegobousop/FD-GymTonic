import {useEffect, useState} from 'react'
import backend from "../../../../backend";
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import MyProfileTabSelector from '../profile/my-profile-tab-selector';
import Spinner from '../common/spinner';
import Pager from '../common/pager';

import { svgIcons } from '../../../../config/constants'; 

const TrainingHistory = ({activeTab, setActiveTab, user, dayFilterActivated, setFilterActivated, selectedDay, forbidden}) => {

    //control
    const [isLoading, setIsLoading] = useState(true);

    //recientes
    const [page, setPage] = useState(0);
    const [existMoreItems, setExistMoreItems] = useState(false);
    const size = 5;

    //filtro
    const [filterPage, setFilterPage] = useState(0);
    const [filterExistMoreItems, setFilterExistMoreItems] = useState(false);
    const filterSize = 5;


    const [trainingData, setTrainingData] = useState([]);

    const viewLastTrainings = (pageNumber) => {
        setIsLoading(true);
        if(user!=null){
        backend.routineService.viewUserTrainings(
            user.id,
        pageNumber,
        size,
          (data) => {
            setTrainingData(data.items);
            setExistMoreItems(data.existMoreItems);
            setPage(pageNumber);
            setIsLoading(false);
          },
          (err) => {
            setIsLoading(false);
          }
        );}
      };

    const viewDayTrainings = (pageNumber) => {
        setIsLoading(true);
        if (user) {
          backend.routineService.viewDayTrainingsForUser(
            user.id,
            pageNumber,
            filterSize,
            selectedDay.getDate(),
            selectedDay.getMonth() + 1,
            selectedDay.getFullYear(),
            (data) => {
              setTrainingData(data.items);
              setFilterExistMoreItems(data.existMoreItems);
              setFilterPage(pageNumber);
              setIsLoading(false);
            },
            (err) => {
              setIsLoading(false);
            }
          );
        }
      };
    
    useEffect(() => {
      if (!dayFilterActivated) {
        viewLastTrainings(page);
      }
      else {
        viewDayTrainings(filterPage);
      }
    }, [dayFilterActivated, selectedDay]);

    const formatDate = (iso) => {
        if (!iso) return ''
        const d = typeof iso === 'string' ? new Date(iso) : iso instanceof Date ? iso : new Date(iso)
        if (Number.isNaN(d.getTime())) return iso
        const datePart = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        const timePart = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
        return `${datePart} a las ${timePart}`
    }

  if (isLoading) return <Spinner />;

  if (forbidden) {
          return (
            <div className="flex flex-col w-full px-5">
                <MyProfileTabSelector 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab}
                />
                <div className="flex flex-col items-center justify-center h-full mt-20">
                    <p className="text-xl text-gray-400">Debes seguir al usuario para ver sus entrenamientos.</p>
                </div>
            </div>
          );
        }

  let content;
  if (trainingData.length === 0 && !dayFilterActivated) {
    content = (
      <div className="flex flex-col items-center justify-center">
        <svgIcons.CancelIcon className="w-16 h-16 text-white mt-20 ml-10"/>
        <p className="text-white text-center items-center ml-10">Ningún entrenamiento registrado</p>
      </div>
    );
  } else if (trainingData.length === 0 && dayFilterActivated) {
    content = (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row items-center mt-10 ml-10 gap-10">
          <p className="flex flex-row bg-[#262626] text-white p-2 rounded-full px-5 border items-center ">
            <button onClick={() => {
              setFilterActivated(false);
            }}>
              <svgIcons.CancelIcon className="w-8 h-8 text-white mr-3"/>
            </button>
            Entrenos el {selectedDay.toLocaleDateString('es-ES', { day: '2-digit' , month: 'long', year: 'numeric' })}
          </p>
        </div>
        <svgIcons.CancelIcon className="w-16 h-16 text-white mt-20 ml-10"/>
        <p className="text-white text-center items-center ml-10">
          Ningún entrenamiento registrado para el {selectedDay.toLocaleDateString('es-ES', { day: '2-digit' , month: 'long', year: 'numeric' })}.
        </p>
      </div>
    );
  } else {
    content = (
      <>
        <div className="flex flex-row items-center mt-10 ml-10 gap-10">
          <p className="font-semibold text-white text-[18px]">Últimos entrenamientos</p>
          {dayFilterActivated && (
            <p className="flex flex-row bg-[#262626] text-white p-2 rounded-full px-5 border items-center ">
              <button onClick={() => {
                setFilterActivated(false);
              }}>
                <svgIcons.CancelIcon className="w-8 h-8 text-white mr-3"/>
              </button>
              Entrenos el {selectedDay.toLocaleDateString('es-ES', { day: '2-digit' , month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {trainingData.map((training) => (
          <div key={training.id} className="flex flex-col mb-4 p-8 pt-4  m-10 shadow-lg rounded-md w-full">
            <div className="flex flex-row gap-5">
              <img src={user.avatar.avatarBase64} alt={training.name} className="w-[40px] h-[40px]  my-2" />
              <div className="flex flex-col w-full">
                <p className="inline-block w-fit text-white hover:text-[#CA0D0A]">{training.creatorUserName}</p>
                <p className="mb-5">{formatDate(training.creationDate)}</p>
                <Link 
                  to={`/trainings/${training.id}/details`} 
                  className="font-semibold text-[25px] text-white mb-3 hover:text-[#CA0D0A]">
                  {training.name}
                </Link>
                <p className="mb-3 text-white">{training.description}</p>
                <div className="flex flex-row gap-10">
                  <p className="text-[12px] w-[12%]">Duración</p>
                  <p className="text-[12px] w-[10%]">Ejercicios</p>
                  <p className="text-[12px] w-[40%] ml-4">Rutina</p> 
                </div>
                <div className="flex flex-row gap-10">
                  <p className="text-[25px] text-left w-[12%] text-white">{training.duration} min</p>
                  <p className="text-[25px] text-left w-[10%] text-white">{training.exercises.length}</p>
                  <Link
                    to={`/routines/${training.routineId}`}
                    className="text-[25px] text-left w-[40%] ml-4 text-white overflow-hidden text-ellipsis whitespace-nowrap hover:text-[#CA0D0A] cursor-pointer"
                  >
                    {training.routineName}
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-[#262626] rounded-md p-5 mt-10 w-fit self-start inline-block">
              <div className="flex flex-col">
                <div className="flex flex-row">
                  <svgIcons.SeparationExerciseIcon className="w-6 h-6 text-[#CA0D0A] self-center mb-7" />
                  {training.exercises.map((exercise, index) => (
                    <div key={index} className="flex flex-row items-center">
                      <div className="flex flex-col justify-center items-center p-2 text-center ">
                        <img src={exercise.exerciseImageBase64} alt={exercise.name} className="w-[50px] h-auto rounded-md"/>
                        <p className="text-white mt-2">{exercise.name}</p>
                      </div>
                      {index !== training.exercises.length - 1 ? (
                        <svgIcons.NextExerciseIcon className="w-6 h-6 text-[#CA0D0A] self-center mb-7" />
                      ) : (
                        <svgIcons.SeparationExerciseIcon className="w-6 h-6 text-[#CA0D0A] self-center mb-7" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {!training.public ? (
              <div className="flex flex-row mt-2 text-[12px] items-center">
                <svgIcons.LockIcon className="text-white h-[24px] w-[24px]"/>
                <p className="ml-2">Solo tú puedes ver este entrenamiento.</p>
              </div>
            ) : null}
          </div>
        ))}
        {dayFilterActivated ? (
          <Pager 
            back={{ enabled: filterPage > 0, onClick: () => viewDayTrainings(filterPage - 1) }} 
            next={{ enabled: filterExistMoreItems, onClick: () => viewDayTrainings(filterPage + 1) }}
          />
        ) : (
          <Pager 
            back={{ enabled: page > 0, onClick: () => viewLastTrainings(page - 1) }} 
            next={{ enabled: existMoreItems, onClick: () => viewLastTrainings(page + 1) }}
          />
        )}
      </>
    );
  }

  return (
    <div className="w-[65%]">
      <MyProfileTabSelector 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      {content}
    </div>
  );
}

TrainingHistory.propTypes = {
  selectedDay: PropTypes.instanceOf(Date).isRequired,
  dayFilterActivated: PropTypes.bool.isRequired,
  setFilterActivated: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
  forbidden: PropTypes.bool,
};

export default TrainingHistory
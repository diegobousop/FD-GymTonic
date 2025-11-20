import { useState, useEffect } from 'react'

import { Route, Routes, useLocation } from "react-router-dom";

import NavBar from '../components/common/navbar'
import SideMenu from '../components/common/side-menu'

import IntroPage from "../pages/intro-page";
import LoginPage from "../pages/login-page";
import RegisterPage from "../pages/register-page";
import HomePage from "../pages/home-page";
import MyProfilePage from "../pages/my-profile-page";
import ProfilePage from "../pages/profile-page";
import CreateRoutine  from "../pages/create-routine-page";
import UserEdit from "../pages/user-edit";
import ChangePasswordPage from "../pages/changePassword-page"; 
import ProtectedPath from './common/protected-path';
import RoutineDetails from "../pages/routine-details-page";
import CreateExercise from '../pages/create-exercise-page';
import MyRoutines from '../pages/my-routines-page';
import ValidateExercises from '../pages/validate-exercises-page';
import ViewAllUsers from '../pages/viewAllUsers-page';
import BlockExercises from '../pages/block-exercises-page';
import SearchResultsPage from "../pages/search-results-page";
import CreateTraining from '../pages/create-training-page';
import UserFollowersPage from '../pages/user-followers-page';
import UserFollowingPage from '../pages/user-following-page';
import MyRoutineFollowersPage from "../pages/my-routine-followers-page";
import ViewFollowRequestsPage from "../pages/view-follow-requests-page";
import { EXACT_ROUTE_TO_PAGE, PREFIX_ROUTE_TO_PAGE, DEFAULT_ACTIVE_PAGE } from '../../../config/constants';

const Body = () => {

  const [activePage, setActivePage] = useState('intro')
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname;

    if (EXACT_ROUTE_TO_PAGE.has(path)) {
      setActivePage(EXACT_ROUTE_TO_PAGE.get(path));
      return;
    }

    const match = PREFIX_ROUTE_TO_PAGE.find(([prefix]) => path.startsWith(prefix));
    setActivePage(match ? match[1] : DEFAULT_ACTIVE_PAGE);
  }, [location.pathname])

  // Mostrar Nav/Side por ruta real (no por activePage)
  const currentPath = location.pathname;
  const showNavAndMenu = !['/', '/start', '/login', '/register'].includes(currentPath);

  return (
    <div>
      {/* Renderiza NavBar solo si activePage no es 'intro' */}
      {showNavAndMenu && <NavBar activePage={activePage} />}
      <div className="flex flex-row h-full">
        {/* Renderiza SideMenu solo si activePage no es 'intro' */}
        {showNavAndMenu && (
          <SideMenu activePage={activePage} setActivePage={setActivePage} />
        )}  
        <div className={`w-full ${showNavAndMenu ? 'pt-[77px] pl-[270px]' : ''}`}>
          <Routes>
            <Route index exact element={<IntroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/start" element={<IntroPage />} />
            <Route path="/intro" element={<IntroPage />} />
            <Route path="/home" element={<ProtectedPath path={<HomePage />} />} />
            <Route path="/profile" element={<ProtectedPath path={<MyProfilePage />} />} />
            <Route path="/profile/:id" element={
              <ProtectedPath path={<ProfilePage />} />
            } />
            <Route path="/routines/create-routine" element={
              <ProtectedPath role={["TRAINER", "ADMIN"]} path={<CreateRoutine />} />
            } />
            <Route path='/admin/addExercise' element={
              <ProtectedPath role={["ADMIN","TRAINER"]} path={<CreateExercise />} />
            } />
            <Route path="/admin/validateExercises" element={
              <ProtectedPath role={["ADMIN","TRAINER"]} path={<ValidateExercises />} />
            } />
            <Route path="/admin/seeUsers" element={
              <ProtectedPath role={["ADMIN"]} path={<ViewAllUsers />} />
            } />
            <Route path="/admin/blockExercises" element={
              <ProtectedPath role={["ADMIN"]} path={<BlockExercises />} />
            } />
            <Route path="/routines/:id" element={
              <ProtectedPath path={<RoutineDetails />} />
            } />
            <Route path="/profileUpdate" element={<ProtectedPath path={<UserEdit />} />} />
            <Route path="/change-password" element={<ProtectedPath path={<ChangePasswordPage />} />} />
            <Route path="/routines/my-routines" element={<ProtectedPath path={<MyRoutines />} />} />
            <Route path="/search/full" element={<ProtectedPath path={<SearchResultsPage />} />} />
            <Route path="/trainings/create-training" element={<ProtectedPath path={<CreateTraining />} />} />
            <Route path="/routines/my-followers" element={<ProtectedPath role={["TRAINER"]} path={<MyRoutineFollowersPage />} />} />
            <Route path="/profile/followers" element={<ProtectedPath path={<UserFollowersPage />} />} />
            <Route path="/profile/following" element={<ProtectedPath path={<UserFollowingPage />} />} />
            <Route path="/profile/follow-request" element={<ProtectedPath path={<ViewFollowRequestsPage />} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Body;
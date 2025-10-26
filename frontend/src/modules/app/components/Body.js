import { useState, useEffect } from 'react'


import { Route, Routes, useLocation } from "react-router-dom";

import NavBar from '../components/common/navbar'
import SideMenu from '../components/common/side-menu'

import Home from "./Home";
import Test from "./Test";
import IntroPage from "../pages/intro-page";
import LoginPage from "../pages/login-page";
import RegisterPage from "../pages/register-page";
import HomePage from "../pages/home-page";
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
import SearchResultsPage from "../pages/search-results-page";
import BlockExercises from '../pages/block-exercises-page';
import CreateTraining from '../pages/create-training-page';

const Body = () => {

  const [activePage, setActivePage] = useState('intro')
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    if (path === '/' || path === '/start' || path === '/intro') {setActivePage('intro');return}
    if (path.startsWith('/login')) { setActivePage('login'); return }
    if (path.startsWith('/register')) { setActivePage('register'); return }
    if (path.startsWith('/home')) { setActivePage('home'); return }
    if (path.startsWith('/admin/addExercise')) {setActivePage('createExercise'); return}
    if (path.startsWith('/profile')) { setActivePage('profile'); return }
    if (path.startsWith('/routines/create-routine')) { setActivePage('createRoutine'); return }
    if (path.startsWith('/test')) { setActivePage('test'); return }
    if (path.startsWith("/profileUpdate")) { setActivePage('profileUpdate'); return }
    if (path.startsWith("/change-password")) { setActivePage('change-password'); return }
    if (path.startsWith("/my-routines")) { setActivePage('my-routines'); return }
    if (path.startsWith("/admin/validateExercises")) { setActivePage('validateExercises'); return }
    if (path.startsWith("/admin/seeUsers")) { setActivePage('viewAllUsers'); return }
    if (path.startsWith("/search/full")) { setActivePage('search'); return }
    if (path.startsWith("/admin/blockExercises")) { setActivePage('blockExercises'); return }
    if (path.startsWith("/trainings/create-training")) { setActivePage('createTraining'); return }

  }, [location.pathname])

  const showNavAndMenu = activePage !== 'intro' && activePage !== 'login' && activePage !== 'register';

  return (
    <div>
      {/* Renderiza NavBar solo si activePage no es 'intro' */}
      {showNavAndMenu && <NavBar activePage={activePage} />}
      <div className="flex flex-row h-screen">
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
            <Route path="/home" element={<ProtectedPath path={<HomePage />} />} />
            <Route path="/profile" element={<ProtectedPath path={<ProfilePage />} />} />
            <Route path="/test" element={<ProtectedPath path={<Test />} />} />
            <Route path="/routines/create-routine" element={
              <ProtectedPath role={["TRAINER", "ADMIN"]} path={<CreateRoutine />} />
            } />
            <Route path='/admin/addExercise' element={
              <ProtectedPath role={["ADMIN","TRAINER"]} path={<CreateExercise />} />
            } />
            <Route path="/admin/validateExercises" element={
              <ProtectedPath role={["ADMIN"]} path={<ValidateExercises />} />
            } />
            <Route path="/admin/blockExercises" element={
              <ProtectedPath role={["ADMIN"]} path={<BlockExercises />} />
            } />
            <Route path="/admin/seeUsers" element={
              <ProtectedPath role={["ADMIN"]} path={<ViewAllUsers />} />
            } />
            <Route path="/routines/:id" element={
              <ProtectedPath path={<RoutineDetails />} />
            } />
            <Route path="/profileUpdate" element={<ProtectedPath path={<UserEdit />} />} />
            <Route path="/change-password" element={<ProtectedPath path={<ChangePasswordPage />} />} />
            <Route path="/routines/my-routines" element={<ProtectedPath path={<MyRoutines />} />} />
            <Route path="/search/full" element={<ProtectedPath path={<SearchResultsPage />} />} />
            <Route path="/trainings/create-training" element={<ProtectedPath path={<CreateTraining />} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Body;

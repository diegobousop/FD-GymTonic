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
import { CreateRoutine } from "../../routine";

const Body = () => {

  const [activePage, setActivePage] = useState('intro')
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    if (path === '/' || path === '/start' || path === '/intro') {setActivePage('intro');return}
    if (path.startsWith('/home')) { setActivePage('home'); return }
    if (path.startsWith('/profile')) { setActivePage('profile'); return }
    if (path.startsWith('/create-routine')) { setActivePage('create-routine'); return }
    if (path.startsWith('/test')) { setActivePage('test'); return }
  }, [location.pathname])

  return (
    <div>
      {/* Renderiza NavBar solo si activePage no es 'intro' */}
      {activePage !== 'intro' && <NavBar activePage={activePage} />}
      <div className="flex flex-row h-screen">
        {/* Renderiza SideMenu solo si activePage no es 'intro' */}
        {activePage !== 'intro' && (
          <SideMenu activePage={activePage} setActivePage={setActivePage} />
        )}
        <div className="w-full">
          <Routes>
              <Route index exact element={<IntroPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/start" element={<IntroPage  />} />
              <Route path="/home" element={<HomePage activePage={activePage} />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/test" element={<Test />} />
              <Route path="/routines/create-routine" element={<CreateRoutine />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Body;

import React from "react";

import { Route, Routes } from "react-router-dom";

import Home from "./Home";
import Test from "./Test";
import IntroPage from "../pages/intro-page";
import LoginPage from "../pages/login-page";
import RegisterPage from "../pages/register-page";
import HomePage from "../pages/home-page";
import ProfilePage from "../pages/profile-page";
import { CreateRoutine } from "../../routine";

const Body = () => {
  return (
    <Routes>
        <Route index exact element={<IntroPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/start" element={<IntroPage  />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/test" element={<Test />} />
        <Route path="/routines/create-routine" element={<CreateRoutine />} />
    </Routes>
  );
};

export default Body;

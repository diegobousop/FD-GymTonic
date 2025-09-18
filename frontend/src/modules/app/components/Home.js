import React, { useState, useEffect } from "react";
import "./App.css";
import { config } from "../../../config/constants.js";
import { Link } from "react-router-dom";

function rot13(s) {
  return s.replace(
    /[A-Z]/gi,
    (c) =>
      "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm"[
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c)
      ]
  );
}

const Home = () => {
  const [message, setMessage] = useState("");
  const [someText, setSomeText] = useState("Sreenzragnf");
  const [answer, setAnswer] = useState(null);

  useEffect(() => {
    fetch(config.BASE_PATH + "/hello")
      .then((response) => response.text())
      .then((error) => {
        setMessage(error);
      });
  }, []);

  const onSubmit = (ev) => {
    ev.preventDefault();
    setAnswer(rot13(someText));
  };

  return (
    <div className="App ">
      <header className="App-header bg-[#000000] border-b-red-500 border-b-2">
        <img
          src={process.env.PUBLIC_URL + "/assets/GymTonicLogo.png"}
          className="App-logo"
          alt="logo"
        />
        <h1 className="App-title">{message}</h1>
      </header>
      <div className="flex-1 h-full bg-[#515151]">
              <p className="text-white text-xl font-semibold">Welcome to GymTonic Frontend</p>
      </div>
  
    </div>
  );
};

export default Home;

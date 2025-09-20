import React, { useState, useEffect } from "react";
import "./App.css";
import { config } from "../../../config/constants.js";
import { Link } from "react-router-dom";
import NavBar from "./common/navbar";


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
    <div className="flex h-full flex-col bg-[#515151]">
      <NavBar />
  
    </div>
  );
};

export default Home;

import React from "react";

import { HashRouter as Router } from "react-router-dom";

import { UserProvider } from "./common/user-provider";

import Body from "./Body";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Body />
      </Router>
    </UserProvider>
  );
};

export default App;

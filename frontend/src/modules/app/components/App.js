import React from "react";

import { HashRouter as Router } from "react-router-dom";

import { UserProvider } from "./common/user-provider";
import { ToastProvider } from "./common/toast-provider";

import Body from "./Body";

const App = () => {
  return (
    <UserProvider>
      <ToastProvider>
        <Router>
          <Body />
        </Router>
    </ToastProvider>
    </UserProvider>
  );
};

export default App;

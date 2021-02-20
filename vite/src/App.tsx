import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import MainLayout from "./pages/main";

import LoginPage from "./pages/main/login";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:projectId">
          <MainLayout />
        </Route>
        <Route path="/">
          <LoginPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

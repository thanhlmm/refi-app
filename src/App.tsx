import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import MainLayout from "./pages/main";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <div>Login here</div>
        </Route>
        <Route path="/:projectId">
          <MainLayout />
        </Route>
        <Route path="/">
          <div>Default page</div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

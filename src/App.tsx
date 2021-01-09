import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
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
          <div>
            <p>Default page</p>
            <Link to="/refi-client">Go to my project</Link>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

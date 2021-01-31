import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import MainLayout from "./pages/main";

import Modal from "@/components/Modal";
import DocForm from "@/components/DocForm";

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
            <Link to="/refi-client">Go to my project</Link>
            <Modal showing title="Create document">
              <DocForm />
            </Modal>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

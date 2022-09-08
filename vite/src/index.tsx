import React from "react";
import ReactDOM from "react-dom";
import "./styles/tailwind.css";
import App from "./App";
import { RecoilRoot } from "recoil";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import AppTheme, { setTheme } from "./styles/theme";
import { RecoilExternalStatePortal } from "./atoms/RecoilExternalStatePortal";
import Notifier from "./components/Notifier";
import "./config";
import "./firebase";

try {
  const userSettings = JSON.parse(
    localStorage.getItem("user-settings") || "{}"
  );
  setTheme(userSettings["ui/appTheme"]);
} catch (error) {
  console.log(error);
}

ReactDOM.render(
  <BrowserRouter>
    <RecoilRoot>
      <AppTheme>
        <RecoilExternalStatePortal />
        <Notifier />
        <App />
      </AppTheme>
    </RecoilRoot>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

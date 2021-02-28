import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
import { RecoilRoot } from "recoil";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@zendeskgarden/react-theming";
import { theme } from "./styles/theme";
import { RecoilExternalStatePortal } from "./atoms/RecoilExternalStatePortal";

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <RecoilRoot>
        <RecoilExternalStatePortal />
        <App />
      </RecoilRoot>
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

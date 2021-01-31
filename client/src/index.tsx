import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
import { RecoilRoot } from "recoil";
import recoilPersist from "recoil-persist";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import 'shoelace/dist/shoelace/shoelace.css';
import { defineCustomElements, setAssetPath } from 'shoelace';

setAssetPath((document.currentScript as HTMLScriptElement).src);
defineCustomElements();

const { RecoilPersist, updateState } = recoilPersist();

ReactDOM.render(
  <BrowserRouter>
    <RecoilRoot initializeState={updateState}>
      <RecoilPersist />
      <App />
    </RecoilRoot>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

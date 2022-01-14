import React from "react";
import ReactDOM from "react-dom";
import "./styles/tailwind.css";
import * as serviceWorker from "./serviceWorker";
import { ThemeProvider } from "@zendeskgarden/react-theming";
import { theme } from "./styles/theme";
// import { RecoilExternalStatePortal } from "./atoms/RecoilExternalStatePortal";
import TabsPage from "./pages/Tabs";

ReactDOM.render(
  <ThemeProvider theme={theme} focusVisibleRef={null}>
    <TabsPage />
  </ThemeProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

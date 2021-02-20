import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
import { RecoilRoot } from "recoil";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import {
  ThemeProvider,
  DEFAULT_THEME,
  IGardenTheme,
} from "@zendeskgarden/react-theming";

const theme = {
  ...DEFAULT_THEME,
  space: {
    ...DEFAULT_THEME.space,
    base: 4,
  },
  components: {
    "modals.header": ({ theme }: { theme: IGardenTheme }) => ({
      padding: `${theme.space.base * 3}px ${theme.space.base * 4}px`,
    }),
  },
};

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <RecoilRoot>
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

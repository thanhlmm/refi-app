import { appThemeAtom } from "@/atoms/ui.action";
import {
  DEFAULT_THEME,
  IGardenTheme,
  ThemeProvider,
} from "@zendeskgarden/react-theming";

import React, { useEffect } from "react";
import { useRecoilState } from "recoil";

export const lightTheme = {
  name: "light",
  ...DEFAULT_THEME,
  space: {
    ...DEFAULT_THEME.space,
    base: 4,
  },
  borderRadii: {
    sm: "0px",
    md: "0px",
  },
  borderWidths: {
    sm: "1px",
    md: "2px",
  },
  shadowWidths: {
    sm: "1px",
    md: "2px",
  },
  shadows: {
    sm: (color: string) => `0 0 0 1px ${color}`,
    md: (color: string) => `0 0 0 2px ${color}`,
    lg: (offsetY: string, blurRadius: string, color: string) =>
      `0 ${offsetY} ${blurRadius} 0 ${color}`,
  },
  components: {
    "modals.header": ({
      theme,
    }: {
      theme: IGardenTheme;
    }): Record<string, string | number> => ({
      padding: `${theme.space.base * 3}px ${theme.space.base * 4}px`,
    }),
    "tables.cell": (): Record<string, string | number> => ({
      padding: 0,
    }),
    "forms.input": () => ({
      transition: "none",
      paddingLeft: "0.375rem",
      paddingRight: "0.375rem",
    }),
  },
};

export const darkTheme = {
  ...lightTheme,
  name: "dark",
  colors: {
    ...lightTheme.colors,
    background: "#1F2937",
    foreground: "white",
    primaryHue: "#3B82F6",
    // dangerHue: "red",
    // warningHue: "yellow",
    // successHue: "green",
    neutralHue: "#374151",
    // chromeHue: "kale",
  },
};

export const setTheme = (theme: boolean) => {
  if (theme) {
    document.documentElement.classList.remove("dark");
    window.document.body.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
    window.document.body.classList.add("dark");
  }
};

const AppTheme: React.FC = ({ children }) => {
  const [appTheme, setAppTheme] = useRecoilState(appThemeAtom);

  useEffect(() => {
    setTheme(appTheme);
  }, [appTheme]);

  return (
    <ThemeProvider
      theme={appTheme ? lightTheme : darkTheme}
      focusVisibleRef={null}
    >
      {children}
    </ThemeProvider>
  );
};

export default AppTheme;

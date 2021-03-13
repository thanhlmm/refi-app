import { DEFAULT_THEME, IGardenTheme } from "@zendeskgarden/react-theming";

export const theme = {
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

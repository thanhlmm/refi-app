import { DEFAULT_THEME, IGardenTheme } from "@zendeskgarden/react-theming";

export const theme = {
  ...DEFAULT_THEME,
  space: {
    ...DEFAULT_THEME.space,
    base: 4,
  },
  shadowWidths: {
    sm: "1px",
    md: "2px",
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
  },
};

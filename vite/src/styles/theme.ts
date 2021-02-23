import {
  ThemeProvider,
  DEFAULT_THEME,
  IGardenTheme,
} from "@zendeskgarden/react-theming";

export const theme = {
  ...DEFAULT_THEME,
  space: {
    ...DEFAULT_THEME.space,
    base: 4,
  },
  components: {
    "modals.header": ({ theme }: { theme: IGardenTheme }) => ({
      padding: `${theme.space.base * 3}px ${theme.space.base * 4}px`,
    }),
    "tables.cell": () => ({
      padding: 0,
    }),
  },
};

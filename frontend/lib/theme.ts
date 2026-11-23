"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0F6B5C", contrastText: "#FFFFFF" },
    error: { main: "#A63A2B" },
    background: { default: "#F5F3EE", paper: "#FFFFFF" },
    text: { primary: "#1F1E1B", secondary: "#5C5A54" },
    divider: "#E3DFD5",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    h5: { fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600 },
    h6: { fontFamily: "var(--font-space-grotesk), sans-serif", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

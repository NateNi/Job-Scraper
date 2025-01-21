import React from "react";
import { TextField, createTheme, ThemeProvider } from "@mui/material";

// Custom theme for dark mode
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff", // White color for focus and active states
    },
    text: {
      primary: "#ffffff", // White text color
    },
    background: {
      default: "#121212", // Dark background
      paper: "#1e1e1e",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "#ffffff", // White text
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff", // White border
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff", // White border on hover
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff", // White border on focus
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#ffffff", // White label text
          "&.Mui-focused": {
            color: "#ffffff", // White label text on focus
          },
        },
      },
    },
  },
});

export default function DarkTextField({
  id,
  value,
  name,
  targetName,
  onChange,
  onFocusElement,
  label,
  setFocusedElement,
  targetId,
  handleEventChange,
  type,
}) {
  return (
    <ThemeProvider theme={darkTheme}>
      <TextField
        id={id}
        fullWidth
        name={name}
        label={label}
        variant="outlined"
        sx={{ display: "block", marginBottom: "2rem", borderColor: "white" }}
        onFocus={() =>
          setFocusedElement ? setFocusedElement(onFocusElement) : true
        }
        onBlur={() => (setFocusedElement ? setFocusedElement(null) : true)}
        onChange={
          handleEventChange
            ? (e) => handleEventChange(targetId, targetName, e.target.value)
            : onChange
        }
        value={value}
        type={type}
      />
    </ThemeProvider>
  );
}

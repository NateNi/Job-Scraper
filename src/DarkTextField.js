import React from "react";
import { TextField, createTheme, ThemeProvider } from "@mui/material";

// Custom theme for dark mode
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff",
    },
    text: {
      primary: "#ffffff",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          "&.Mui-focused": {
            color: "#ffffff",
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
  width,
}) {
  return (
    <ThemeProvider theme={darkTheme}>
      <TextField
        id={id}
        fullWidth
        name={name}
        label={label}
        variant="outlined"
        sx={{
          display: "block",
          marginBottom: "32px",
          borderColor: "white",
          width: width,
        }}
        onFocus={() =>
          setFocusedElement ? setFocusedElement(onFocusElement) : true
        }
        // onBlur={() => (setFocusedElement ? setFocusedElement(null) : true)}
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

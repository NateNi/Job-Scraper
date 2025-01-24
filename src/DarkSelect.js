import React, { useState } from "react";
import {
  MenuItem,
  Select,
  createTheme,
  ThemeProvider,
  FormControl,
  InputLabel,
} from "@mui/material";

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
          color: "#ffffff", // White text for input
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
            color: "#ffffff", // White label on focus
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#ffffff", // White text for dropdown items
          "&:hover": {
            backgroundColor: "#333333", // Darker hover color for dropdown items
          },
        },
      },
    },
  },
});

export default function DarkSelect({
  id,
  label,
  handleFilterChange,
  onChange,
  name,
  filterId,
  options,
  value,
}) {
  return (
    <ThemeProvider theme={darkTheme}>
      <FormControl fullWidth variant="outlined" sx={{ margin: "0" }}>
        <InputLabel id="dark-mode-select-label">{label}</InputLabel>
        <Select
          name={name}
          labelId="filter-type-label"
          id={id}
          label={label}
          sx={{ display: "block", marginBottom: "2rem" }}
          onChange={
            handleFilterChange
              ? (e) => handleFilterChange(filterId, name, e.target.value)
              : onChange
          }
          value={value}
        >
          {options.map((option) => (
            <MenuItem
              value={option["value"]}
              selected={option["value"] == value ? "true" : "false"}
            >
              {option["name"]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </ThemeProvider>
  );
}

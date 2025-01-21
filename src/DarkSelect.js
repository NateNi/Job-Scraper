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
      main: "#ffffff", // White color for focus and active states
    },
    text: {
      primary: "#ffffff", // White text
    },
    background: {
      default: "#121212", // Dark background
      paper: "#1e1e1e", // Slightly lighter dark for dropdown items
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

import React, { useMemo, useCallback } from "react";
import {
  MenuItem,
  Select,
  createTheme,
  ThemeProvider,
  FormControl,
  InputLabel,
} from "@mui/material";

const useDarkTheme = () =>
  useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: { main: "#ffffff" },
          text: { primary: "#ffffff" },
          background: { default: "#121212", paper: "#1e1e1e" },
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
              root: { color: "#ffffff", "&.Mui-focused": { color: "#ffffff" } },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                color: "#ffffff",
                "&:hover": { backgroundColor: "#333333" },
              },
            },
          },
        },
      }),
    []
  );

export default function DarkSelect({
  id,
  label,
  handleFilterChange,
  onChange,
  name,
  filterId,
  options = [],
  value,
}) {
  const darkTheme = useDarkTheme();

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      if (handleFilterChange) {
        handleFilterChange(filterId, name, newValue);
      } else if (onChange) {
        onChange(e);
      }
    },
    [handleFilterChange, onChange, filterId, name]
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <FormControl fullWidth variant="outlined" sx={{ margin: 0 }}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
          name={name}
          labelId={`${id}-label`}
          id={id}
          label={label}
          sx={{ display: "block", marginBottom: "2rem" }}
          onChange={handleChange}
          value={value}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </ThemeProvider>
  );
}

import React, { useMemo, useCallback } from "react";
import {
  ThemeProvider,
  createTheme,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

const useDarkTheme = () =>
  useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
          text: {
            primary: "#ffffff",
          },
        },
        components: {
          MuiFormControlLabel: {
            styleOverrides: {
              label: {
                color: "#ffffff",
              },
            },
          },
          MuiRadio: {
            styleOverrides: {
              root: {
                color: "#ffffff",
                "&.Mui-checked": {
                  color: "#ffffff",
                },
              },
            },
          },
        },
      }),
    []
  );

export default function DarkRadioGroup({ name, options, onChange, value }) {
  const darkTheme = useDarkTheme();

  const handleChange = useCallback((e) => onChange(e));

  return (
    <ThemeProvider theme={darkTheme}>
      <RadioGroup row name={name} onChange={handleChange}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
            checked={option.value == value}
          />
        ))}
      </RadioGroup>
    </ThemeProvider>
  );
}

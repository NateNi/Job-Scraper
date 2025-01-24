import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Typography, Box, Paper } from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  ArrowDropDown,
  Refresh,
  Home,
} from "@mui/icons-material";

export default function MockWebpage({ focusedElement }) {
  return (
    <Paper
      elevation={24}
      sx={{
        marginBottom: "40px",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid #1e1e1e",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          borderBottom: "1px solid #1e1e1e",
          backgroundColor: "#3e3e42",
        }}
      >
        <ArrowBack sx={{ padding: "0.5rem", color: "#1e1e1e" }} />
        <ArrowForward sx={{ padding: "0.5rem", color: "#1e1e1e" }} />
        <Refresh sx={{ padding: "0.5rem", color: "#1e1e1e" }} />
        <Home sx={{ padding: "0.5rem", color: "#1e1e1e" }} />

        <Box
          sx={{
            border: `2px solid ${
              focusedElement == "url" ? "white" : "#1e1e1e"
            }`,
            transition: "border-color 0.5s ease",
            flexGrow: 1,
            mx: 2,
            padding: "0.5rem",
            paddingLeft: "1rem",
            borderRadius: 50,
            color: `${focusedElement == "url" ? "white" : "#1e1e1e"}`,
          }}
        >
          Enter URL
        </Box>
      </Box>

      {/* Browser Content Area */}
      <Box
        sx={{
          height: "400px",
          padding: "3rem",
          backgroundColor: "#3e3e42",
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "#1e1e1e", marginBottom: "1rem" }}
        >
          Welcome to{" "}
          <span className={focusedElement == "company" ? "focusedElement" : ""}>
            COMPANY
          </span>
        </Typography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" sx={{ color: "#1e1e1e" }}>
            Job Results
          </Typography>
          <Box
            sx={{
              border: "1px solid #1e1e1e",
              borderRadius: "4px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "150px",
              marginBottom: "1rem",
              border: `2px solid ${
                ["filterXpath", "filterSelectValue"].includes(focusedElement)
                  ? "white"
                  : "#1e1e1e"
              }`,
            }}
          >
            <Typography
              variant="body1"
              color={
                ["filterXpath", "filterSelectValue"].includes(focusedElement)
                  ? "white"
                  : "#1e1e1e"
              }
            >
              Sort
            </Typography>
            <ArrowDropDown
              sx={{
                color: ["filterXpath", "filterSelectValue"].includes(
                  focusedElement
                )
                  ? "white"
                  : "#1e1e1e",
              }}
            />
          </Box>
        </Box>
        {[1, 2, 3].map((value, index) => (
          <Box
            key={value}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: `${
                focusedElement == "container"
                  ? "2px solid white"
                  : "1px solid #1e1e1e"
              }`,
              transition: "all 0.3s ease",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <h4
              className={
                (focusedElement == "titleAttribute" ||
                focusedElement == "titleXpath"
                  ? "focusedElement"
                  : "") + " mockWebElement"
              }
            >
              Job Title
            </h4>
            <p
              className={
                (focusedElement == "link" ? "focusedElement" : "") +
                " mockWebElement"
              }
            >
              <u>Click Here</u>
            </p>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

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

export default function MockWebpage({
  emphasizeURL,
  emphasizeCompany,
  emphasizeContainer,
  emphasizeTitle,
  emphasizeLink,
  emphasizeFilter,
}) {
  return (
    <Paper
      elevation={24}
      sx={{
        margin: "20px auto",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid #ccc",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          borderBottom: "1px solid #ccc",
        }}
      >
        <ArrowBack sx={{ padding: "0.5rem", color: "#ccc" }} />
        <ArrowForward sx={{ padding: "0.5rem", color: "#ccc" }} />
        <Refresh sx={{ padding: "0.5rem", color: "#ccc" }} />
        <Home sx={{ padding: "0.5rem", color: "#ccc" }} />

        <Box
          sx={{
            border: `2px solid ${emphasizeURL ? "blue" : "#ccc"}`,
            transition: "border-color 0.5s ease",
            flexGrow: 1,
            mx: 2,
            padding: "0.5rem",
            paddingLeft: "1rem",
            borderRadius: 50,
            color: "#ccc",
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
        }}
      >
        <Typography variant="h4" sx={{ color: "#ccc", marginBottom: "1rem" }}>
          Welcome to{" "}
          <span className={emphasizeCompany ? "focusedElement" : ""}>
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
          <Typography variant="h5" sx={{ color: "#ccc" }}>
            Job Results
          </Typography>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "150px",
              marginBottom: "1rem",
              border: `2px solid ${emphasizeFilter ? "blue" : "#ccc"}`,
            }}
          >
            <Typography variant="body1" color="#ccc">
              Sort
            </Typography>
            <ArrowDropDown color="action" />
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
                emphasizeContainer ? "2px solid blue" : "1px solid #ccc"
              }`,
              transition: "all 0.3s ease",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <h4
              className={
                (emphasizeTitle ? "focusedElement" : "") + " mockWebElement"
              }
            >
              Job Title
            </h4>
            <p
              className={
                (emphasizeLink ? "focusedElement" : "") + " mockWebElement"
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

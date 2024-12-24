import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";

export default function MockWebpage({
  emphasizeURL,
  emphasizeCompany,
  emphasizeContainer,
  emphasizeTitle,
  emphasizeLink,
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
        <ArrowBackIcon sx={{ padding: "0.5rem", color: "#ccc" }} />
        <ArrowForwardIcon sx={{ padding: "0.5rem", color: "#ccc" }} />
        <RefreshIcon sx={{ padding: "0.5rem", color: "#ccc" }} />
        <HomeIcon sx={{ padding: "0.5rem", color: "#ccc" }} />

        <Box
          sx={{
            border: `2px solid ${emphasizeURL ? "blue" : "#ccc"}`,
            transition: "border-color 0.5s ease",
            flexGrow: 1,
            mx: 2,
            padding: "0.5rem",
            paddingLeft: "1rem",
            borderRadius: 50,
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
        <Typography variant="h4" sx={{ color: "#ccc" }}>
          Welcome to{" "}
          <span className={emphasizeCompany ? "focusedElement" : ""}>
            COMPANY
          </span>
        </Typography>
        <Typography variant="h5" sx={{ color: "#ccc" }}>
          Job Results
        </Typography>
        {[...Array(3)].map((value, index) => (
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

import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";

function App() {
  //const [currentTime, setCurrentTime] = useState(0);

  // useEffect(() => {
  //   fetch('/time').then(res => res.json()).then(data => {
  //     setCurrentTime(data.time);
  //   });
  // }, []);

  const [isURLInputFocused, setIsURLInputFocused] = useState(false);
  const [isCompanyInputFocused, setIsCompanyInputFocused] = useState(false);
  const [isContainerInputFocused, setIsContainerInputFocused] = useState(false);
  const [isTitleInputFocused, setIsTitleInputFocused] = useState(false);
  const [isLinkInputFocused, setIsLinkInputFocused] = useState(false);

  return (
    <div className="App">
      <Paper
        elevation={24}
        sx={{
          padding: "4rem",
          maxWidth: "70%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Grid container spacing={6}>
          <Grid key={1} item xs={12} md={6}>
            <Paper elevation={24} sx={{ padding: "4rem" }}>
              <h2>Website Details</h2>

              <TextField
                id="outlined-basic"
                fullWidth
                label="Website Url"
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onFocus={() => setIsURLInputFocused(true)}
                onBlur={() => setIsURLInputFocused(false)}
              />

              <TextField
                id="outlined-basic"
                label="Company Name"
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onFocus={() => setIsCompanyInputFocused(true)}
                onBlur={() => setIsCompanyInputFocused(false)}
              />

              <TextField
                id="outlined-basic"
                label="Container Xpath"
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onFocus={() => setIsContainerInputFocused(true)}
                onBlur={() => setIsContainerInputFocused(false)}
              />

              <TextField
                id="outlined-basic"
                label="Title Xpath"
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onFocus={() => setIsTitleInputFocused(true)}
                onBlur={() => setIsTitleInputFocused(false)}
              />

              <TextField
                id="outlined-basic"
                label="Title Attribute"
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onFocus={() => setIsTitleInputFocused(true)}
                onBlur={() => setIsTitleInputFocused(false)}
              />

              <TextField
                id="outlined-basic"
                label="Link Xpath"
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onFocus={() => setIsLinkInputFocused(true)}
                onBlur={() => setIsLinkInputFocused(false)}
              />
            </Paper>
          </Grid>
          <Grid key={2} item xs={12} md={6}>
            <Paper
              elevation={24}
              sx={{
                width: "80%",
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
                <ArrowBackIcon sx={{ padding: "0.5rem" }} />
                <ArrowForwardIcon sx={{ padding: "0.5rem" }} />
                <RefreshIcon sx={{ padding: "0.5rem" }} />
                <HomeIcon sx={{ padding: "0.5rem" }} />

                <Box
                  className={isURLInputFocused ? "focusedOutline" : ""}
                  sx={{
                    border: `2px solid ${isURLInputFocused ? "blue" : "#ccc"}`,
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
                <h2>
                  Welcome to{" "}
                  <span
                    className={isCompanyInputFocused ? "focusedElement" : ""}
                  >
                    COMPANY
                  </span>
                </h2>
                <h3>Job Results</h3>
                {[...Array(3)].map((value, index) => (
                  <Box
                    key={value}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                      border: `1px solid ${
                        isContainerInputFocused ? "blue" : "#ccc"
                      }`,
                      transition: "border-color 0.3s ease",
                      borderRadius: "5px",
                      marginBottom: "10px",
                    }}
                  >
                    <h4
                      className={
                        (isTitleInputFocused ? "focusedElement" : "") +
                        " mockWebElement"
                      }
                    >
                      Job Title
                    </h4>
                    <p
                      className={
                        (isLinkInputFocused ? "focusedElement" : "") +
                        " mockWebElement"
                      }
                    >
                      <u>Click Here</u>
                    </p>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

export default App;

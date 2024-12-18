import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MockWebpage from "./MockWebpage.js";

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
            <MockWebpage
              emphasizeURL={isURLInputFocused}
              emphasizeCompany={isCompanyInputFocused}
              emphasizeContainer={isContainerInputFocused}
              emphasizeTitle={isTitleInputFocused}
              emphasizeLink={isLinkInputFocused}
            />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MockWebpage from "./MockWebpage.js";
import WebsiteForm from "./WebsiteForm.js";

function App() {
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
            <WebsiteForm
              setURLFocus={setIsURLInputFocused}
              setCompanyFocus={setIsCompanyInputFocused}
              setContainerFocus={setIsContainerInputFocused}
              setTitleFocus={setIsTitleInputFocused}
              setLinkFocus={setIsLinkInputFocused}
            />
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

import React, { useState } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MockWebpage from "./MockWebpage.js";
import WebsiteForm from "./WebsiteForm.js";
import Grow from "@mui/material/Grow";

export default function WebsiteRecord({
  setVisibleComponent,
  setOpenLoader,
  setJobs,
  setWebsiteFormData,
  setWebsiteFilterData,
  setWebsiteNewFilterData,
  websiteFormData,
  websiteFilterData,
  websiteNewFilterData,
  currentWebsiteRecordId = null,
}) {
  const [isURLInputFocused, setIsURLInputFocused] = useState(false);
  const [isCompanyInputFocused, setIsCompanyInputFocused] = useState(false);
  const [isContainerInputFocused, setIsContainerInputFocused] = useState(false);
  const [isTitleInputFocused, setIsTitleInputFocused] = useState(false);
  const [isLinkInputFocused, setIsLinkInputFocused] = useState(false);

  return (
    <Grow in={true}>
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
              setVisibleComponent={setVisibleComponent}
              setOpenLoader={setOpenLoader}
              setJobs={setJobs}
              setWebsiteFilterData={setWebsiteFilterData}
              setWebsiteNewFilterData={setWebsiteNewFilterData}
              setWebsiteFormData={setWebsiteFormData}
              currentWebsiteRecordId={currentWebsiteRecordId}
              websiteFormData={websiteFormData}
              websiteFilterData={websiteFilterData}
              websiteNewFilterData={websiteNewFilterData}
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
    </Grow>
  );
}

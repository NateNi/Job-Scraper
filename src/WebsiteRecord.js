import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Grid, Paper, Grow, Typography, Divider } from "@mui/material";
import MockWebpage from "./MockWebpage.js";
import WebsiteForm from "./WebsiteForm.js";

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
  setCurrentWebsiteRecordId,
  channels,
}) {
  const [focusedElement, setFocusedElement] = useState(null);
  useEffect(() => {
    const fetchWebsite = async () => {
      const response = await axios.get("/website/" + currentWebsiteRecordId);
      setWebsiteFormData(response.data.website);
      setWebsiteFilterData(response.data.filters);
    };
    if (currentWebsiteRecordId) {
      fetchWebsite();
    } else {
      setWebsiteFormData({
        url: "",
        company: "",
        containerXpath: "",
        titleXpath: "",
        titleAttribute: "",
        linkXpath: "",
      });
      setWebsiteFilterData([]);
    }
  }, []);

  return (
    <Grow in={true}>
      <Paper
        elevation={24}
        className="componentPage"
        sx={{
          padding: "4rem",
          maxWidth: "70%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            display: "inline-block",
            color: "white",
            fontWeight: "normal",
          }}
        >
          {currentWebsiteRecordId ? "Update" : "Create"} Website Scraper
        </Typography>
        <Divider
          orientation="horizontal"
          flexItem
          sx={{ marginTop: "1rem", marginBottom: "2rem", color: "white" }}
        />
        <Grid container spacing={6}>
          <Grid key={1} item xs={12} md={6}>
            <WebsiteForm
              setFocusedElement={setFocusedElement}
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
              setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
              channels={channels}
            />
          </Grid>
          <Grid key={2} item xs={12} md={6}>
            <MockWebpage
              focusedElement={focusedElement}
              // emphasizeURL={isURLInputFocused}
              // emphasizeCompany={isCompanyInputFocused}
              // emphasizeContainer={isContainerInputFocused}
              // emphasizeTitle={isTitleInputFocused}
              // emphasizeLink={isLinkInputFocused}
              // emphasizeFilter={isFilterInputFocused}
            />
          </Grid>
        </Grid>
      </Paper>
    </Grow>
  );
}

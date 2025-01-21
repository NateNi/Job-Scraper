import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import {
  Grid,
  Paper,
  Grow,
  Typography,
  Divider,
  Box,
  Fab,
  Tooltip,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import MockWebpage from "./MockWebpage.js";
import WebsiteForm from "./WebsiteForm.js";
import DescriptionBox from "./DescriptionBox.js";

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
  setErrorMessage,
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
        <Box sx={{ width: "100%", marginBottom: "2rem" }}>
          <Tooltip
            title={<span class="tooltipText">Cancel and return home</span>}
          >
            <Fab
              color="primary"
              onClick={() => {
                setVisibleComponent("WebsiteIndex");
                setWebsiteNewFilterData([]);
                setWebsiteFilterData([]);
                setWebsiteFormData({
                  url: "",
                  company: "",
                  containerXpath: "",
                  titleXpath: "",
                  titleAttribute: "",
                  linkXpath: "",
                });
                setCurrentWebsiteRecordId("");
              }}
            >
              <ArrowBack />
            </Fab>
          </Tooltip>
        </Box>

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
          className="whiteDivider"
          sx={{ marginTop: "1rem", marginBottom: "2rem" }}
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
              setErrorMessage={setErrorMessage}
            />
          </Grid>
          <Grid key={2} item xs={12} md={6}>
            <MockWebpage focusedElement={focusedElement} />
            <DescriptionBox focusedElement={focusedElement} />
          </Grid>
        </Grid>
      </Paper>
    </Grow>
  );
}

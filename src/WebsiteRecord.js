import React, { useState, useEffect, useCallback } from "react";
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
import { Close } from "@mui/icons-material";
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
  currentWebsiteRecordId,
  setCurrentWebsiteRecordId,
  channels,
  setSnackbar,
}) {
  const [focusedElement, setFocusedElement] = useState(null);

  const resetForm = useCallback(() => {
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
  }, [
    setWebsiteNewFilterData,
    setWebsiteFilterData,
    setWebsiteFormData,
    setCurrentWebsiteRecordId,
  ]);

  useEffect(() => {
    if (!currentWebsiteRecordId) return;

    const fetchWebsite = async () => {
      try {
        const response = await axios.get(`/website/${currentWebsiteRecordId}`);
        setWebsiteFormData(response.data.website);
        setWebsiteFilterData(response.data.filters);
      } catch (error) {
        setSnackbar({
          message:
            error.response?.data?.error || "Failed to fetch website data",
          type: "error",
          open: true,
        });
      }
    };

    fetchWebsite();
  }, [
    currentWebsiteRecordId,
    setWebsiteFormData,
    setWebsiteFilterData,
    setSnackbar,
  ]);

  return (
    <Grow in>
      <Paper
        elevation={24}
        className="componentPage"
        sx={{
          padding: "4rem",
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Tooltip title="Cancel and return home">
            <Fab
              color="primary"
              className="blueFab"
              onClick={() => {
                setVisibleComponent("WebsiteIndex");
                resetForm();
              }}
            >
              <Close />
            </Fab>
          </Tooltip>
        </Box>
        <Box sx={{ padding: "2rem 4rem 4rem" }}>
          <Typography
            variant="h3"
            sx={{ color: "white", fontWeight: "normal" }}
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
            <Grid item xs={12} md={6}>
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
                setSnackbar={setSnackbar}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MockWebpage focusedElement={focusedElement} />
              <DescriptionBox focusedElement={focusedElement} />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Grow>
  );
}

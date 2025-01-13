import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Typography, Box, Paper, Grow, Button } from "@mui/material";

export default function WebsiteTest({
  jobs,
  setOpenLoader,
  currentWebsiteRecordId = null,
  websiteFormData,
  setVisibleComponent,
  websiteFilterData,
  websiteNewFilterData,
  setWebsiteNewFilterData,
  setWebsiteFilterData,
  setWebsiteFormData,
  setCurrentWebsiteRecordId,
}) {
  const createWebsiteSubmit = async () => {
    setOpenLoader(true);
    try {
      let response = null;
      if (currentWebsiteRecordId) {
        response = await axios.put(
          "http://localhost:5000/website/" + currentWebsiteRecordId,
          {
            ...websiteFormData,
            filters: websiteFilterData,
            newFilters: websiteNewFilterData,
          }
        );
      } else {
        response = await axios.post("http://localhost:5000/website", {
          ...websiteFormData,
          filters: [...websiteFilterData, ...websiteNewFilterData],
        });
      }
      if (response.status == 200) {
        setVisibleComponent("WebsiteIndex");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setOpenLoader(false);
  };
  return (
    <Grow in={true}>
      <Paper
        elevation={24}
        sx={{
          padding: "4rem",
          maxWidth: "70%",
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "right",
        }}
      >
        {[...jobs].map((job, index) => (
          <Box
            sx={{
              padding: "24px 24px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginBottom: "24px",
              textAlign: "start",
            }}
          >
            <Typography variant="h4" sx={{ display: "inline-block" }}>
              <a target="_blank" href={job.link}>
                {job.title}
              </a>
            </Typography>
          </Box>
        ))}
        <Button
          variant="contained"
          onClick={() => createWebsiteSubmit()}
          sx={{ marginRight: "1rem" }}
        >
          Save
        </Button>
        <Button
          variant="contained"
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
          Cancel
        </Button>
      </Paper>
    </Grow>
  );
}

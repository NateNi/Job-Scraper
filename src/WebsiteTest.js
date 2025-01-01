import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";
import Button from "@mui/material/Button";

export default function WebsiteTest({
  jobs,
  setOpenLoader,
  currentWebsiteRecordId = null,
  websiteFormData,
  setVisibleComponent,
  websiteFilterData,
}) {
  const createWebsiteSubmit = async () => {
    setOpenLoader(true);
    try {
      let response = null;
      if (currentWebsiteRecordId) {
        response = await axios.put(
          "http://localhost:5000/website/" + currentWebsiteRecordId,
          { ...websiteFormData, filters: websiteFilterData }
        );
      } else {
        response = await axios.post("http://localhost:5000/website", {
          ...websiteFormData,
          filters: websiteFilterData,
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
  console.log(jobs);
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
        <Button variant="contained">Cancel</Button>
      </Paper>
    </Grow>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import {
  Typography,
  Box,
  Paper,
  Fab,
  Grow,
  Divider,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Add,
  List,
  Delete,
  PlayArrow,
  Settings,
} from "@mui/icons-material";

export default function WebsiteIndex({
  setVisibleComponent,
  setCurrentWebsiteRecordId,
  setOpenLoader,
  setChannels,
  setSuccessMessage,
}) {
  const [websites, setWebsites] = useState([]);

  const setEditView = (websiteId) => {
    setVisibleComponent("WebsiteEdit");
    setCurrentWebsiteRecordId(websiteId);
  };

  const setLinkListView = (websiteId) => {
    setVisibleComponent("LinkList");
    setCurrentWebsiteRecordId(websiteId);
  };

  const runScraper = async (websiteId) => {
    setOpenLoader(true);
    let response = null;
    response = await axios.get(
      "http://localhost:5000/website/" + websiteId + "/run"
    );
    if (response.status === 200) {
      setOpenLoader(false);
      fetchWebsites();
      setSuccessMessage(response.data.newJobsCount + " new jobs found");
    }
  };

  const deleteWebsite = async (websiteId) => {
    setOpenLoader(true);
    let response = null;
    response = await axios.delete("http://localhost:5000/website/" + websiteId);
    if (response.status === 200) {
      setOpenLoader(false);
      fetchWebsites();
      setSuccessMessage("Website scraper deleted successfully");
    }
  };

  const fetchWebsites = async () => {
    setOpenLoader(true);
    const response = await axios.get("/index");
    setWebsites(response.data.websites);
    setChannels(response.data.channels);
    setOpenLoader(false);
  };

  useEffect(() => {
    fetchWebsites();
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
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <Box>
            {/* <img
              src={`${process.env.PUBLIC_URL}/ScraperLogo.png`}
              className="websiteLogo"
            /> */}
            <Typography
              variant="h2"
              component="h1"
              sx={{
                display: "inline-block",
                textAlign: "left",
                color: "white",
                fontWeight: "600",
              }}
            >
              JOB SCRAPER
            </Typography>
          </Box>
          <Tooltip title={<span class="tooltipText">Open settings</span>}>
            <Fab
              color="primary"
              className="blueFab"
              aria-label="settings"
              onClick={() => setVisibleComponent("Settings")}
            >
              <Settings />
            </Fab>
          </Tooltip>
        </Box>
        <Divider
          orientation="horizontal"
          flexItem
          className="whiteDivider"
          sx={{
            marginTop: "1rem",
            marginBottom: "2rem",
          }}
        />
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
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
            Websites
          </Typography>
          <Tooltip
            title={<span class="tooltipText">Add new website scraper</span>}
          >
            <Fab
              color="primary"
              className="blueFab"
              sx={{ mb: "14px" }}
              onClick={() => setVisibleComponent("WebsiteCreate")}
            >
              <Add sx={{ fontSize: "2rem" }} />
            </Fab>
          </Tooltip>
        </Box>

        {websites.length == 0 ? (
          <Typography
            variant="h4"
            sx={{
              display: "block",
              width: "100%",
              textAlign: "center",
              color: "white",
            }}
          >
            No Websites Added
          </Typography>
        ) : (
          [...websites].map((website, index) => (
            <Box
              key={website.id}
              sx={{
                padding: "24px 34px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginTop: "24px",
                textAlign: "start",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "2rem",
                color: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <img
                  src={
                    website.favicon
                      ? `data:image/png;base64,${website.favicon}`
                      : `${process.env.PUBLIC_URL}/ScraperLogo.png`
                  }
                  className="indexWebsiteIcon"
                />
                <Typography variant="h4" sx={{ display: "inline-block" }}>
                  {website.company}
                </Typography>
              </Box>
              <Box>
                <Tooltip title={<span class="tooltipText">Run scraper</span>}>
                  <Fab
                    color="primary"
                    aria-label="run"
                    className="greenFab"
                    sx={{
                      backgroundColor: "#22bb33",
                      color: "white",
                      marginRight: "1.5rem",
                    }}
                    onClick={() => runScraper(website.id)}
                  >
                    <PlayArrow />
                  </Fab>
                </Tooltip>
                <Tooltip
                  title={<span class="tooltipText">View scraped jobs</span>}
                >
                  <Badge
                    overlap="circular"
                    badgeContent={website.numLinksFound}
                    color="primary"
                  >
                    <Fab
                      color="primary"
                      className="blueFab"
                      aria-label="history"
                      sx={{ marginRight: "1.5rem" }}
                      onClick={() => setLinkListView(website.id)}
                    >
                      <List />
                    </Fab>
                  </Badge>
                </Tooltip>
                <Tooltip title={<span class="tooltipText">Edit scraper</span>}>
                  <Fab
                    color="primary"
                    className="blueFab"
                    aria-label="edit"
                    sx={{ marginRight: "1.5rem" }}
                    onClick={() => setEditView(website.id)}
                  >
                    <Edit />
                  </Fab>
                </Tooltip>
                <Tooltip
                  title={<span class="tooltipText">Delete scraper</span>}
                >
                  <Fab
                    className="redFab"
                    sx={{ backgroundColor: "#ff3333", color: "white" }}
                    aria-label="delete"
                    onClick={() => deleteWebsite(website.id)}
                  >
                    <Delete />
                  </Fab>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Grow>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Paper,
  Fab,
  Grow,
  Divider,
  Badge,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  Add,
  List,
  Delete,
  PlayArrow,
  Settings,
} from "@mui/icons-material";
import axios from "axios";

export const fetchWebsites = async () => {
  try {
    const { data } = await axios.get("/index");
    return data;
  } catch (error) {
    throw (
      error.response?.data?.error ||
      "An error occurred while fetching websites."
    );
  }
};

export const runScraper = async (websiteId) => {
  try {
    const { data } = await axios.get(
      `http://localhost:5000/website/${websiteId}/run`
    );
    return data;
  } catch (error) {
    throw error.response?.data?.error || "Failed to run the scraper.";
  }
};

export const deleteWebsite = async (websiteId) => {
  try {
    await axios.delete(`http://localhost:5000/website/${websiteId}`);
    return "Website scraper deleted successfully.";
  } catch (error) {
    throw error.response?.data?.error || "Failed to delete the scraper.";
  }
};

export default function WebsiteIndex({
  setVisibleComponent,
  setCurrentWebsiteRecordId,
  setOpenLoader,
  setChannels,
  setSnackbar,
}) {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWebsites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWebsites();
      setWebsites(data.websites);
      setChannels(data.channels);
    } catch (errorMessage) {
      setSnackbar({ message: errorMessage, type: "error", open: true });
    }
    setLoading(false);
  }, [setChannels, setSnackbar]);

  useEffect(() => {
    loadWebsites();
  }, [loadWebsites]);

  const handleScraperRun = async (websiteId) => {
    setOpenLoader(true);
    try {
      const data = await runScraper(websiteId);
      setSnackbar({
        message: `${data.newJobsCount} new jobs found`,
        type: "success",
        open: true,
      });
      loadWebsites();
    } catch (errorMessage) {
      setSnackbar({ message: errorMessage, type: "error", open: true });
    }
    setOpenLoader(false);
  };

  const handleDeleteWebsite = async (websiteId) => {
    setOpenLoader(true);
    try {
      const successMessage = await deleteWebsite(websiteId);
      setSnackbar({ message: successMessage, type: "success", open: true });
      loadWebsites();
    } catch (errorMessage) {
      setSnackbar({ message: errorMessage, type: "error", open: true });
    }
    setOpenLoader(false);
  };

  return (
    <Grow in={true}>
      <Paper
        elevation={24}
        className="componentPage"
        sx={{ padding: "4rem", maxWidth: "1200px", margin: "auto" }}
      >
        <Header setVisibleComponent={setVisibleComponent} />
        <Divider sx={{ marginY: "2rem" }} className="whiteDivider" />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <Typography variant="h3" sx={{ color: "white" }}>
            Websites
          </Typography>
          <Tooltip title="Add new website scraper">
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

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : websites.length === 0 ? (
          <Typography variant="h4" sx={{ textAlign: "center", color: "white" }}>
            No Websites Added
          </Typography>
        ) : (
          websites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              onRunScraper={handleScraperRun}
              onDeleteWebsite={handleDeleteWebsite}
              setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
              setVisibleComponent={setVisibleComponent}
            />
          ))
        )}
      </Paper>
    </Grow>
  );
}

// Header Component
const Header = ({ setVisibleComponent }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "1rem",
    }}
  >
    <Typography variant="h2" sx={{ color: "white", fontWeight: "600" }}>
      JOB SCRAPER
    </Typography>
    <Tooltip title="Open settings">
      <Fab
        color="primary"
        className="blueFab"
        onClick={() => setVisibleComponent("Settings")}
      >
        <Settings />
      </Fab>
    </Tooltip>
  </Box>
);

// WebsiteCard Component
const WebsiteCard = ({
  website,
  onRunScraper,
  onDeleteWebsite,
  setVisibleComponent,
  setCurrentWebsiteRecordId,
}) => {
  const setEditView = () => {
    setVisibleComponent("WebsiteEdit");
    setCurrentWebsiteRecordId(website.id);
  };

  const setLinkListView = () => {
    setVisibleComponent("LinkList");
    setCurrentWebsiteRecordId(website.id);
  };

  return (
    <Box
      sx={{
        padding: "24px 34px",
        borderRadius: "2rem",
        border: "1px solid #ccc",
        marginTop: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <img
          src={
            website.favicon
              ? `data:image/png;base64,${website.favicon}`
              : `${process.env.PUBLIC_URL}/ScraperLogo.png`
          }
          className="indexWebsiteIcon"
          alt="Website"
        />
        <Typography variant="h4">{website.company}</Typography>
      </Box>
      <Box>
        <Tooltip title="Run scraper">
          <Fab
            color="primary"
            className="greenFab"
            sx={{
              backgroundColor: "#22bb33",
              color: "white",
              marginRight: "1.5rem",
            }}
            onClick={() => onRunScraper(website.id)}
          >
            <PlayArrow />
          </Fab>
        </Tooltip>
        <Tooltip title="View scraped jobs">
          <Badge
            overlap="circular"
            badgeContent={website.numLinksFound}
            color="primary"
          >
            <Fab
              color="primary"
              className="blueFab"
              sx={{ marginRight: "1.5rem" }}
              onClick={setLinkListView}
            >
              <List />
            </Fab>
          </Badge>
        </Tooltip>
        <Tooltip title="Edit scraper">
          <Fab
            color="primary"
            className="blueFab"
            sx={{ marginRight: "1.5rem" }}
            onClick={setEditView}
          >
            <Edit />
          </Fab>
        </Tooltip>
        <Tooltip title="Delete scraper">
          <Fab
            className="redFab"
            sx={{ backgroundColor: "#ff3333", color: "white" }}
            onClick={() => onDeleteWebsite(website.id)}
          >
            <Delete />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );
};

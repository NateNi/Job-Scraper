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
import Fab from "@mui/material/Fab";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Grow from "@mui/material/Grow";
import Divider from "@mui/material/Divider";

export default function WebsiteIndex({
  setVisibleComponent,
  setCurrentWebsiteRecordId,
  setOpenLoader,
}) {
  const [websites, setWebsites] = useState([]);

  const setEditView = (websiteId) => {
    setVisibleComponent("WebsiteEdit");
    setCurrentWebsiteRecordId(websiteId);
  };

  useEffect(() => {
    const fetchWebsites = async () => {
      setOpenLoader(true);
      const response = await axios.get("/index"); // Replace with your backend endpoint
      setWebsites(response.data.websites);
      setOpenLoader(false);
    };

    fetchWebsites();
  }, []);
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
        <img
          src={`${process.env.PUBLIC_URL}/ScraperLogo.png`}
          className="websiteLogo"
        />
        <Typography
          variant="h2"
          sx={{
            display: "inline-block",
            textAlign: "left",
          }}
        >
          Job Scraper
        </Typography>
        <Divider
          orientation="horizontal"
          flexItem
          sx={{ marginTop: "1rem", marginBottom: "2rem" }}
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
            }}
          >
            Websites
          </Typography>
          <Fab
            color="primary"
            sx={{ mb: "14px" }}
            onClick={() => setVisibleComponent("WebsiteCreate")}
          >
            <AddIcon sx={{ fontSize: "2rem" }} />
          </Fab>
        </Box>

        {websites.length == 0 ? (
          <Typography
            variant="h4"
            sx={{
              display: "block",
              width: "100%",
              textAlign: "center",
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
                marginBottom: "24px",
                textAlign: "start",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
              <Fab
                color="primary"
                aria-label="edit"
                sx={{ float: "right" }}
                onClick={() => setEditView(website.id)}
              >
                <EditIcon />
              </Fab>
            </Box>
          ))
        )}
      </Paper>
    </Grow>
  );
}

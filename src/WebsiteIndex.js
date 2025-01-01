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
          textAlign: "right",
        }}
      >
        <Fab
          color="primary"
          variant="extended"
          sx={{ mb: "14px" }}
          onClick={() => setVisibleComponent("WebsiteCreate")}
        >
          <AddIcon sx={{ mr: 1 }} />
          New
        </Fab>

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
              sx={{
                padding: "24px 24px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "24px",
                textAlign: "start",
              }}
            >
              <img
                src={`data:image/png;base64,${website.favicon}`}
                className="indexWebsiteIcon"
              />
              <Typography variant="h4" sx={{ display: "inline-block" }}>
                {website.company}
              </Typography>
              <Fab
                color="secondary"
                aria-label="edit"
                sx={{ float: "right", backgroundColor: "#1976d2" }}
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

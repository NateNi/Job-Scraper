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

export default function WebsiteIndex() {
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    const fetchWebsites = async () => {
      const response = await axios.get("/index"); // Replace with your backend endpoint
      setWebsites(response.data.websites);
    };

    fetchWebsites();
  }, []);

  return (
    <Paper
      elevation={24}
      sx={{
        padding: "4rem",
        maxWidth: "70%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {[...websites].map((website, index) => (
        <Box
          sx={{
            padding: "24px 24px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "24px",
          }}
        >
          <img
            src={`data:image/png;base64,${website.image}`}
            className="indexWebsiteIcon"
          />
          <Typography variant="h4" sx={{ display: "inline-block" }}>
            {website.company}
          </Typography>
          <Fab
            color="secondary"
            aria-label="edit"
            sx={{ float: "right", backgroundColor: "#1976d2" }}
          >
            <EditIcon />
          </Fab>
        </Box>
      ))}
    </Paper>
  );
}

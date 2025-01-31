import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import DarkTextField from "./DarkTextField";
import {
  Grow,
  Paper,
  Box,
  Fab,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import { Delete, Add, Close, Save } from "@mui/icons-material";

export default function Settings({
  setVisibleComponent,
  setOpenLoader,
  setSnackbar,
}) {
  const [data, setData] = useState({
    settings: [],
    channels: [],
    newChannels: [],
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/settings");
        if (response.status === 200) {
          setData((prev) => ({
            ...prev,
            settings: response.data.settings,
            channels: response.data.channels,
          }));
        }
      } catch (error) {
        setSnackbar({
          message: error.response?.data?.error || "An error occurred",
          type: "error",
          open: true,
        });
      }
    };
    fetchSettings();
  }, [setSnackbar]);

  const handleChange = useCallback((listName, id, field, value) => {
    setData((prev) => ({
      ...prev,
      [listName]: prev[listName].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeItem = useCallback((listName, id) => {
    setData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((item) => item.id !== id),
    }));
  }, []);

  const addNewChannel = useCallback(() => {
    setData((prev) => ({
      ...prev,
      newChannels: [...prev.newChannels, { id: Date.now(), name: "" }],
    }));
  }, []);

  const settingsSubmit = async (e) => {
    e.preventDefault();
    setOpenLoader(true);
    try {
      const response = await axios.post("/settings", {
        settings: data.settings,
        channels: data.channels,
        newChannels: data.newChannels,
      });
      if (response.status === 200) {
        setVisibleComponent("WebsiteIndex");
        setSnackbar({
          message: "Settings updated successfully",
          type: "success",
          open: true,
        });
      }
    } catch (error) {
      setSnackbar({
        message: error.response?.data?.error || "An error occurred",
        type: "error",
        open: true,
      });
    }
    setOpenLoader(false);
  };

  return (
    <Grow in={true}>
      <Paper
        elevation={24}
        className="componentPage"
        sx={{ padding: "4rem", maxWidth: "800px", margin: "auto" }}
      >
        <Box sx={{ width: "100%" }}>
          <Tooltip title="Return home">
            <Fab
              color="primary"
              className="blueFab"
              onClick={() => setVisibleComponent("WebsiteIndex")}
            >
              <Close />
            </Fab>
          </Tooltip>
        </Box>
        <Box sx={{ padding: "2rem 4rem" }}>
          <Typography
            variant="h3"
            sx={{ color: "white", fontWeight: "normal" }}
          >
            Settings
          </Typography>
          <Divider
            sx={{ marginTop: "1rem", marginBottom: "2rem" }}
            className="whiteDivider"
          />
          <Paper
            elevation={24}
            sx={{
              padding: "4rem",
              borderRadius: "2rem",
              backgroundColor: "#3e3e42",
            }}
          >
            <form onSubmit={settingsSubmit}>
              {data.settings.map((setting) => (
                <Box
                  key={setting.id}
                  sx={{
                    borderRadius: "24px",
                    border: "1px solid #ccc",
                    marginBottom: "30px",
                    backgroundColor: "#3e3e42",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{ padding: "24px 30px", backgroundColor: "#1e1e1e" }}
                  >
                    <Typography variant="h4" sx={{ color: "white" }}>
                      Slack Token
                    </Typography>
                  </Box>
                  <Divider
                    sx={{ marginBottom: "2rem" }}
                    className="whiteDivider"
                  />
                  <Box sx={{ padding: "12px 36px" }}>
                    <DarkTextField
                      id="slackToken"
                      name={setting.name}
                      label={setting.name}
                      handleEventChange={(id, field, value) =>
                        handleChange("settings", id, field, value)
                      }
                      targetId={setting.id}
                      targetName="value"
                      value={setting.value}
                      type="password"
                    />
                  </Box>
                </Box>
              ))}

              <Box
                sx={{
                  borderRadius: "24px",
                  border: "1px solid #ccc",
                  marginBottom: "30px",
                  backgroundColor: "#3e3e42",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    padding: "24px 30px",
                    backgroundColor: "#1e1e1e",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h4" sx={{ color: "white" }}>
                    Slack Channels
                  </Typography>
                  <Tooltip title="Add new channel">
                    <Fab
                      color="primary"
                      className="blueFab"
                      onClick={addNewChannel}
                    >
                      <Add />
                    </Fab>
                  </Tooltip>
                </Box>
                <Divider
                  sx={{ marginBottom: "2rem" }}
                  className="whiteDivider"
                />
                <Box sx={{ padding: "12px 36px" }}>
                  {[...data.channels, ...data.newChannels].map((channel) => (
                    <Box
                      key={channel.id}
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <DarkTextField
                        label="Channel"
                        handleEventChange={(id, field, value) =>
                          handleChange("channels", id, field, value)
                        }
                        targetId={channel.id}
                        targetName="name"
                        value={channel.name}
                        width="24rem"
                      />
                      <Tooltip title="Remove channel">
                        <Fab
                          size="large"
                          sx={{
                            backgroundColor: "#ff3333",
                            color: "white",
                            marginLeft: "1rem",
                          }}
                          onClick={() => removeItem("channels", channel.id)}
                        >
                          <Delete />
                        </Fab>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{ width: "100%", textAlign: "right", marginTop: "2rem" }}
              >
                <Tooltip title="Save settings">
                  <Fab
                    type="submit"
                    sx={{ backgroundColor: "#22bb33", color: "white" }}
                  >
                    <Save />
                  </Fab>
                </Tooltip>
              </Box>
            </form>
          </Paper>
        </Box>
      </Paper>
    </Grow>
  );
}

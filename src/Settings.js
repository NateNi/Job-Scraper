import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import {
  Button,
  TextField,
  Grow,
  Paper,
  Box,
  Fab,
  Typography,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Delete, Add } from "@mui/icons-material";

export default function Settings({
  setVisibleComponent,
  setOpenLoader,
  setSuccessMessage,
}) {
  useEffect(() => {
    const fetchSettings = async () => {
      const response = await axios.get("/settings");
      setSettings(response.data.settings);
      setChannels(response.data.channels);
    };
    fetchSettings();
  }, []);

  const [settings, setSettings] = useState([]);
  const [channels, setChannels] = useState([]);
  const [newChannels, setNewChannels] = useState([]);

  const settingsSubmit = async (e) => {
    e.preventDefault();
    setOpenLoader(true);
    try {
      let response = null;
      response = await axios.post("http://localhost:5000/settings", {
        settings: settings,
        channels: channels,
        newChannels: newChannels,
      });
      if (response.status === 200) {
        setVisibleComponent("WebsiteIndex");
        setSuccessMessage("Settings updated successfully");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setOpenLoader(false);
  };

  const handleSettingsChange = (id, field, value) => {
    setSettings(
      settings.map((setting) =>
        setting.id === id ? { ...setting, [field]: value } : setting
      )
    );
  };

  const handleChannelChange = (id, field, value) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id ? { ...channel, [field]: value } : channel
      )
    );
  };

  const handleNewChannelChange = (id, field, value) => {
    setNewChannels(
      newChannels.map((channel) =>
        channel.id === id ? { ...channel, [field]: value } : channel
      )
    );
  };

  const removeChannel = (id) => {
    setChannels(channels.filter((channel) => channel.id !== id));
  };

  const removeNewChannel = (id) => {
    setNewChannels(newChannels.filter((channel) => channel.id !== id));
  };

  const addNewChannel = () => {
    let maxChannelId = 0;
    if (newChannels.length > 0) {
      let maxChannelIdRecord = newChannels.reduce(function (prev, current) {
        return prev && prev.id > current.id ? prev : current;
      });
      maxChannelId = maxChannelIdRecord.id;
    }
    setNewChannels([...newChannels, { id: maxChannelId + 1, name: "" }]);
  };

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
        <Typography
          variant="h3"
          sx={{
            display: "inline-block",
            color: "white",
            fontWeight: "normal",
          }}
        >
          Settings
        </Typography>
        <Divider
          orientation="horizontal"
          flexItem
          className="whiteDivider"
          sx={{
            marginTop: "1rem",
            marginBottom: "2rem",
          }}
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
            {settings.map((setting) => (
              <TextField
                key={setting.id}
                id="slackToken"
                fullWidth
                name={setting.name}
                label={setting.name}
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onChange={(e) =>
                  handleSettingsChange(setting.id, "value", e.target.value)
                }
                type="password"
                value={setting.value}
              />
            ))}

            <Box sx={{ marginBottom: "2rem" }}>
              <Fab
                color="primary"
                variant="extended"
                aria-label="add"
                onClick={() => addNewChannel()}
              >
                <Add sx={{ marginRight: "0.5rem" }} />
                Slack Channel
              </Fab>
            </Box>

            {channels.map((channel) => (
              <Box key={channel.id}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2rem",
                  }}
                >
                  <TextField
                    id="outlined-basic"
                    fullWidth
                    name="channel"
                    label="Channel"
                    variant="outlined"
                    sx={{ display: "block", marginBottom: "2rem" }}
                    onChange={(e) =>
                      handleChannelChange(channel.id, "name", e.target.value)
                    }
                    value={channel.name}
                  />
                  <Fab
                    color="primary"
                    aria-label="remove"
                    onClick={() => removeChannel(channel.id)}
                  >
                    <Delete />
                  </Fab>
                </Box>
              </Box>
            ))}

            {newChannels.map((channel) => (
              <Box key={channel.id}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2rem",
                  }}
                >
                  <TextField
                    id="outlined-basic"
                    fullWidth
                    name="channel"
                    label="Channel"
                    variant="outlined"
                    sx={{
                      display: "block",
                      marginBottom: "0.5rem",
                      marginRight: "1rem",
                    }}
                    onChange={(e) =>
                      handleNewChannelChange(channel.id, "name", e.target.value)
                    }
                    value={channel.name}
                  />
                  <Fab
                    color="primary"
                    aria-label="remove"
                    onClick={() => removeNewChannel(channel.id)}
                  >
                    <Delete />
                  </Fab>
                </Box>
              </Box>
            ))}

            <Box sx={{ width: "100%", textAlign: "right" }}>
              <Button
                variant="contained"
                type="submit"
                sx={{ marginRight: "1rem" }}
              >
                Submit
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setVisibleComponent("WebsiteIndex");
                }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Paper>
    </Grow>
  );
}

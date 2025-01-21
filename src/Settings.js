import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import DarkTextField from "./DarkTextField";
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
import { Delete, Add, ArrowBack, Save } from "@mui/icons-material";

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
        <Box sx={{ width: "100%", marginBottom: "2rem" }}>
          <Fab
            color="primary"
            onClick={() => {
              setVisibleComponent("WebsiteIndex");
            }}
          >
            <ArrowBack />
          </Fab>
        </Box>
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
          <Typography
            variant="h5"
            sx={{
              display: "inline-block",
              textAlign: "left",
              color: "white",
              marginBottom: "2rem",
            }}
          >
            Slack Integration
          </Typography>
          <form onSubmit={settingsSubmit}>
            {settings.map((setting) => (
              <DarkTextField
                key={setting.id}
                id="slackToken"
                name={setting.name}
                label={setting.name}
                handleEventChange={handleSettingsChange}
                targetId={setting.id}
                targetName="value"
                value={setting.value}
                type="password"
              />
            ))}

            <Box
              sx={{
                padding: "24px 24px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "24px",
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
                <Typography
                  variant="h5"
                  sx={{
                    display: "inline-block",
                    textAlign: "left",
                    color: "white",
                    marginBottom: "2rem",
                  }}
                >
                  Channels
                </Typography>
                <Fab
                  color="primary"
                  aria-label="add"
                  onClick={() => addNewChannel()}
                >
                  <Add />
                </Fab>
              </Box>

              {/* <Box sx={{ marginBottom: "2rem" }}>
              <Fab
                color="primary"
                variant="extended"
                aria-label="add"
                onClick={() => addNewChannel()}
              >
                <Add sx={{ marginRight: "0.5rem" }} />
                Slack Channel
              </Fab>
            </Box> */}

              {channels.map((channel) => (
                <Box key={channel.id}>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <DarkTextField
                      label="Channel"
                      handleEventChange={handleChannelChange}
                      targetId={channel.id}
                      targetName="name"
                      value={channel.name}
                    />

                    <Fab
                      sx={{
                        backgroundColor: "#ff3333",
                        color: "white",
                        marginLeft: "1.5rem",
                      }}
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
                    }}
                  >
                    <DarkTextField
                      label="Channel"
                      handleEventChange={handleNewChannelChange}
                      targetId={channel.id}
                      targetName="name"
                      value={channel.name}
                    />

                    <Fab
                      sx={{
                        backgroundColor: "#ff3333",
                        color: "white",
                        marginLeft: "1.5rem",
                      }}
                      aria-label="remove"
                      onClick={() => removeNewChannel(channel.id)}
                    >
                      <Delete />
                    </Fab>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ width: "100%", textAlign: "right" }}>
              <Fab
                type="submit"
                sx={{
                  backgroundColor: "#22bb33",
                  color: "white",
                  marginRight: "1.5rem",
                }}
              >
                <Save />
              </Fab>
            </Box>
          </form>
        </Paper>
      </Paper>
    </Grow>
  );
}

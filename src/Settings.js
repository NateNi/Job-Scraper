import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
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
  setSuccessMessage,
  setErrorMessage,
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
      setErrorMessage(error.response.data.error);
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
          maxWidth: "800px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Tooltip title={<span class="tooltipText">Return home</span>}>
            <Fab
              color="primary"
              className="blueFab"
              onClick={() => {
                setVisibleComponent("WebsiteIndex");
              }}
            >
              <Close />
            </Fab>
          </Tooltip>
        </Box>
        <Box sx={{ padding: "2rem 4rem 4rem 4rem" }}>
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
                      padding: "24px 30px 24px 30px",
                      backgroundColor: "#1e1e1e",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          display: "inline-block",
                          textAlign: "left",
                          color: "white",
                        }}
                      >
                        Slack Token
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    orientation="horizontal"
                    flexItem
                    className="whiteDivider"
                    sx={{
                      marginBottom: "2rem",
                    }}
                  />

                  <Box sx={{ padding: "12px 36px" }}>
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
                    padding: "24px 30px 24px 30px",
                    backgroundColor: "#1e1e1e",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        display: "inline-block",
                        textAlign: "left",
                        color: "white",
                      }}
                    >
                      Slack Channels
                    </Typography>
                    <Tooltip
                      title={<span class="tooltipText">Add new channel</span>}
                    >
                      <Fab
                        color="primary"
                        className="blueFab"
                        aria-label="add"
                        onClick={() => addNewChannel()}
                      >
                        <Add />
                      </Fab>
                    </Tooltip>
                  </Box>
                </Box>

                <Divider
                  orientation="horizontal"
                  flexItem
                  className="whiteDivider"
                  sx={{
                    marginBottom: "2rem",
                  }}
                />

                <Box sx={{ padding: "12px 36px" }}>
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
                        <Box sx={{ ml: "1.5rem" }}>
                          <Tooltip
                            title={
                              <span class="tooltipText">Remove channel</span>
                            }
                          >
                            <Fab
                              sx={{
                                backgroundColor: "#ff3333",
                                color: "white",
                              }}
                              className="redFab"
                              aria-label="remove"
                              onClick={() => removeChannel(channel.id)}
                            >
                              <Delete />
                            </Fab>
                          </Tooltip>
                        </Box>
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
                        <Box sx={{ ml: "1.5rem" }}>
                          <Tooltip
                            title={
                              <span class="tooltipText">Remove channel</span>
                            }
                          >
                            <Fab
                              sx={{
                                backgroundColor: "#ff3333",
                                color: "white",
                              }}
                              className="redFab"
                              aria-label="remove"
                              onClick={() => removeNewChannel(channel.id)}
                            >
                              <Delete />
                            </Fab>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{ width: "100%", textAlign: "right", marginTop: "2rem" }}
              >
                <Tooltip title={<span class="tooltipText">Save settings</span>}>
                  <Fab
                    type="submit"
                    className="greenFab"
                    sx={{
                      backgroundColor: "#22bb33",
                      color: "white",
                    }}
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

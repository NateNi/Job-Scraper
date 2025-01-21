import React, { useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { styled } from "@mui/material/styles";
import DarkTextField from "./DarkTextField";
import DarkSelect from "./DarkSelect";
import {
  Paper,
  Typography,
  Button,
  Box,
  Fab,
  MenuItem,
  Select,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function WebsiteForm({
  setFocusedElement,
  setVisibleComponent,
  setOpenLoader,
  setJobs,
  setWebsiteFormData,
  setWebsiteFilterData,
  setWebsiteNewFilterData,
  currentWebsiteRecordId = null,
  websiteFormData,
  websiteFilterData,
  websiteNewFilterData,
  setCurrentWebsiteRecordId,
  channels,
  setErrorMessage,
}) {
  const testWebsiteSubmit = async (e) => {
    e.preventDefault();
    setOpenLoader(true);
    try {
      let response = null;
      response = await axios.post("http://localhost:5000/website/test", {
        websiteFormData: websiteFormData,
        websiteFilterData: websiteFilterData,
        websiteNewFilterData: websiteNewFilterData,
      });
      console.log(response);
      if (response.status === 200) {
        setJobs(response.data.jobs);
        setVisibleComponent("WebsiteTest");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.response.data.error);
    }
    setOpenLoader(false);
  };

  useEffect(() => {
    const fetchWebsite = async () => {
      const response = await axios.get("/website/" + currentWebsiteRecordId);
      setWebsiteFormData(response.data.website);
      setWebsiteFilterData(response.data.filters);
    };
    if (currentWebsiteRecordId) {
      fetchWebsite();
    } else {
      setWebsiteFormData({
        url: "",
        company: "",
        containerXpath: "",
        titleXpath: "",
        titleAttribute: "",
        linkXpath: "",
        channelId: "",
      });
      setWebsiteFilterData([]);
    }
  }, []);

  const handleChange = (event) => {
    setWebsiteFormData({
      ...websiteFormData,
      [event.target.name]: event.target.value,
    });
  };

  const addNewFilter = () => {
    let maxFilterId = 0;
    if (websiteNewFilterData.length > 0) {
      let maxFilterIdRecord = websiteNewFilterData.reduce(function (
        prev,
        current
      ) {
        return prev && prev.id > current.id ? prev : current;
      });
      maxFilterId = maxFilterIdRecord.id;
    }
    setWebsiteNewFilterData([
      ...websiteNewFilterData,
      { id: maxFilterId + 1, filterXpath: "", type: "", selectValue: "" },
    ]);
  };

  const removeFilter = (id) => {
    setWebsiteFilterData(
      websiteFilterData.filter((filter) => filter.id !== id)
    );
  };

  const removeNewFilter = (id) => {
    setWebsiteNewFilterData(
      websiteNewFilterData.filter((filter) => filter.id !== id)
    );
  };

  const handleFilterChange = (id, field, value) => {
    setWebsiteFilterData(
      websiteFilterData.map((filter) =>
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  };

  const handleNewFilterChange = (id, field, value) => {
    setWebsiteNewFilterData(
      websiteNewFilterData.map((filter) =>
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  };

  const filterTypeOptions = [
    { value: "", name: "" },
    { value: "select", name: "Select" },
  ];

  const channelOptions = channels.map((channel) => ({
    value: channel["id"],
    name: channel["name"],
  }));

  return (
    <Paper
      elevation={24}
      sx={{ padding: "4rem", borderRadius: "2rem", backgroundColor: "#3e3e42" }}
    >
      <form onSubmit={testWebsiteSubmit}>
        <DarkSelect
          id="channel"
          label="Channel"
          name="channelId"
          onChange={handleChange}
          value={websiteFormData.channelId}
          options={channelOptions}
        />

        <DarkTextField
          id="urlField"
          name="url"
          label="Website Url"
          onFocusElement={"url"}
          onChange={handleChange}
          value={websiteFormData.url}
          setFocusedElement={setFocusedElement}
        />

        <DarkTextField
          id="companyField"
          name="company"
          label="Company Name"
          onFocusElement={"company"}
          onChange={handleChange}
          value={websiteFormData.company}
          setFocusedElement={setFocusedElement}
        />

        <DarkTextField
          id="containerXpathField"
          name="containerXpath"
          label="Container Xpath"
          onFocusElement={"container"}
          onChange={handleChange}
          value={websiteFormData.containerXpath}
          setFocusedElement={setFocusedElement}
        />

        <DarkTextField
          id="titleXpathField"
          name="titleXpath"
          label="Title Xpath"
          onFocusElement={"title"}
          onChange={handleChange}
          value={websiteFormData.titleXpath}
          setFocusedElement={setFocusedElement}
        />

        <DarkTextField
          id="titleAttributeField"
          name="titleAttribute"
          label="Title Attribute (optional)"
          onFocusElement={"title"}
          onChange={handleChange}
          value={websiteFormData.titleAttribute}
          setFocusedElement={setFocusedElement}
        />

        <DarkTextField
          id="linkXpathField"
          name="linkXpath"
          label="Link Xpath"
          onFocusElement={"link"}
          onChange={handleChange}
          value={websiteFormData.linkXpath}
          setFocusedElement={setFocusedElement}
        />

        <Box sx={{ marginBottom: "2rem" }}>
          <Fab
            color="primary"
            variant="extended"
            aria-label="add"
            onClick={() => addNewFilter()}
          >
            <Add sx={{ marginRight: "0.5rem" }} />
            Filter
          </Fab>
        </Box>

        {websiteFilterData.map((filter) => (
          <Box
            key={filter.id}
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
                justifyContent: "space-between",
                marginBottom: "2rem",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  display: "inline-block",
                  textAlign: "left",
                  color: "white",
                }}
              >
                Filter
              </Typography>
              <Fab
                sx={{ backgroundColor: "#ff3333", color: "white" }}
                aria-label="remove"
                onClick={() => removeFilter(filter.id)}
              >
                <Delete />
              </Fab>
            </Box>

            <DarkTextField
              name="filterXpath"
              label="Filter Xpath"
              value={filter.filterXpath}
              setFocusedElement={setFocusedElement}
              onFocusElement={"filter"}
              targetId={filter.id}
              targetName="filterXpath"
              handleFilterChange={handleFilterChange}
            />

            <DarkSelect
              id="type"
              label="Filter Type"
              name="type"
              handleFilterChange={handleNewFilterChange}
              filterId={filter.id}
              value={filter.type}
              options={filterTypeOptions}
            />

            <DarkTextField
              name="selectValue"
              label="Select Value"
              value={filter.selectValue}
              setFocusedElement={setFocusedElement}
              onFocusElement={"filter"}
              targetId={filter.id}
              targetName="selectValue"
              handleFilterChange={handleFilterChange}
            />
          </Box>
        ))}

        {websiteNewFilterData.map((filter) => (
          <Box
            key={filter.id}
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
                justifyContent: "space-between",
                marginBottom: "2rem",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  display: "inline-block",
                  textAlign: "left",
                  color: "white",
                }}
              >
                Filter
              </Typography>
              <Fab
                sx={{ backgroundColor: "#ff3333", color: "white" }}
                aria-label="remove"
                onClick={() => removeNewFilter(filter.id)}
              >
                <Delete />
              </Fab>
            </Box>

            <DarkTextField
              name="filterXpath"
              label="Filter Xpath"
              value={filter.filterXpath}
              setFocusedElement={setFocusedElement}
              onFocusElement={"filter"}
              targetId={filter.id}
              targetName={"filterXpath"}
              handleFilterChange={handleNewFilterChange}
            />

            <DarkSelect
              id="type"
              label="Filter Type"
              name="type"
              handleFilterChange={handleNewFilterChange}
              filterId={filter.id}
              value={filter.type}
              options={filterTypeOptions}
            />

            <DarkTextField
              name="selectValue"
              label="Select Value"
              value={filter.selectValue}
              setFocusedElement={setFocusedElement}
              onFocusElement={"filter"}
              targetId={filter.id}
              targetName="selectValue"
              handleFilterChange={handleNewFilterChange}
            />
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
        </Box>
      </form>
    </Paper>
  );
}

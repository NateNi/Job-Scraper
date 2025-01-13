import React, { useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { styled } from "@mui/material/styles";
import {
  Paper,
  TextField,
  Button,
  Box,
  Fab,
  MenuItem,
  Select,
  Grid,
  Typography,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

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
}) {
  const testWebsiteSubmit = async (e) => {
    e.preventDefault();
    setOpenLoader(true);
    try {
      let response = null;
      // const filterQueryString = websiteFilterData
      //   .map(
      //     (filter, index) =>
      //       `filter${index + 1}_filterXpath=${encodeURIComponent(
      //         filter.filterXpath
      //       )}&filter${index + 1}_type=${encodeURIComponent(
      //         filter.type
      //       )}&filter${index + 1}_selectValue=${encodeURIComponent(
      //         filter.selectValue
      //       )}`
      //   )
      //   .join("&");
      // const newFilterQueryString = websiteNewFilterData
      //   .map(
      //     (filter, index) =>
      //       `newFilter${index + 1}_filterXpath=${encodeURIComponent(
      //         filter.filterXpath
      //       )}&newFilter${index + 1}_type=${encodeURIComponent(
      //         filter.type
      //       )}&newFilter${index + 1}_selectValue=${encodeURIComponent(
      //         filter.selectValue
      //       )}`
      //   )
      //   .join("&");
      response = await axios.post("http://localhost:5000/website/test", {
        websiteFormData: websiteFormData,
        websiteFilterData: websiteFilterData,
        websiteNewFilterData: websiteNewFilterData,
      });
      if (response.status === 200) {
        setJobs(response.data.jobs);
        setVisibleComponent("WebsiteTest");
      }
    } catch (error) {
      console.error("Error:", error);
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

  return (
    <Paper elevation={24} sx={{ padding: "4rem" }}>
      <h2>Website Details</h2>
      <form onSubmit={testWebsiteSubmit}>
        <Select
          labelId="filter-type-label"
          name="channelId"
          label="Channel"
          sx={{ display: "block", marginBottom: "2rem" }}
          onChange={handleChange}
          value={websiteFormData.channelId}
        >
          {channels.map((channel) => (
            <MenuItem
              value="select"
              selected={channel.id === websiteFormData.channelId}
            >
              {channel.name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          id="urlField"
          fullWidth
          name="url"
          label="Website Url"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setFocusedElement("url")}
          onBlur={() => setFocusedElement(null)}
          onChange={handleChange}
          value={websiteFormData.url}
        />

        <TextField
          id="companyField"
          fullWidth
          name="company"
          label="Company Name"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setFocusedElement("company")}
          onBlur={() => setFocusedElement(null)}
          onChange={handleChange}
          value={websiteFormData.company}
        />

        <TextField
          id="containerXpathField"
          fullWidth
          name="containerXpath"
          label="Container Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setFocusedElement("container")}
          onBlur={() => setFocusedElement(null)}
          onChange={handleChange}
          value={websiteFormData.containerXpath}
        />

        <TextField
          id="titleXpathField"
          fullWidth
          name="titleXpath"
          label="Title Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setFocusedElement("title")}
          onBlur={() => setFocusedElement(null)}
          onChange={handleChange}
          value={websiteFormData.titleXpath}
        />

        <TextField
          id="titleAttributeField"
          fullWidth
          name="titleAttribute"
          label="Title Attribute (optional)"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setFocusedElement("title")}
          onBlur={() => setFocusedElement(null)}
          onChange={handleChange}
          value={websiteFormData.titleAttribute}
        />

        <TextField
          id="linkXpathField"
          fullWidth
          name="linkXpath"
          label="Link Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setFocusedElement("link")}
          onBlur={handleChange}
          onChange={handleChange}
          value={websiteFormData.linkXpath}
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
              <h2>Filter</h2>
              <Fab
                color="primary"
                aria-label="remove"
                onClick={() => removeFilter(filter.id)}
              >
                <Delete />
              </Fab>
            </Box>

            <TextField
              fullWidth
              name="filterXpath"
              label="Filter Xpath"
              variant="outlined"
              sx={{ display: "block", marginBottom: "2rem" }}
              onChange={(e) =>
                handleFilterChange(filter.id, "filterXpath", e.target.value)
              }
              value={filter.filterXpath}
            />

            <Select
              labelId="filter-type-label"
              name="type"
              label="Filter Type"
              sx={{ display: "block", marginBottom: "2rem" }}
              onChange={(e) =>
                handleFilterChange(filter.id, "type", e.target.value)
              }
              value={filter.type}
            >
              <MenuItem value="select" selected={filter.type === "select"}>
                Select
              </MenuItem>
            </Select>

            <TextField
              fullWidth
              name="selectValue"
              label="Select Value"
              variant="outlined"
              sx={{ display: "block" }}
              onChange={(e) =>
                handleFilterChange(filter.id, "selectValue", e.target.value)
              }
              value={filter.selectValue}
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
              <h2>Filter</h2>
              <Fab
                color="primary"
                aria-label="remove"
                onClick={() => removeNewFilter(filter.id)}
              >
                <Delete />
              </Fab>
            </Box>

            <TextField
              id="outlined-basic"
              fullWidth
              name="filterXpath"
              label="Filter Xpath"
              variant="outlined"
              sx={{ display: "block", marginBottom: "2rem" }}
              onFocus={() => setFocusedElement("filter")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                handleNewFilterChange(filter.id, "filterXpath", e.target.value)
              }
            />

            <Select
              labelId="filter-type-label"
              id="type"
              //value={age}
              label="Filter Type"
              sx={{ display: "block", marginBottom: "2rem" }}
              onChange={(e) =>
                handleNewFilterChange(filter.id, "type", e.target.value)
              }
            >
              <MenuItem value={"select"}>Select</MenuItem>
            </Select>

            <TextField
              id="outlined-basic"
              fullWidth
              name="selectValue"
              label="Select Value"
              variant="outlined"
              sx={{ display: "block" }}
              onFocus={() => setFocusedElement("filter")}
              onBlur={() => setFocusedElement(null)}
              onChange={(e) =>
                handleNewFilterChange(filter.id, "selectValue", e.target.value)
              }
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
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setVisibleComponent("WebsiteIndex");
              setWebsiteNewFilterData([]);
              setWebsiteFilterData([]);
              setWebsiteFormData({
                url: "",
                company: "",
                containerXpath: "",
                titleXpath: "",
                titleAttribute: "",
                linkXpath: "",
              });
              setCurrentWebsiteRecordId("");
            }}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

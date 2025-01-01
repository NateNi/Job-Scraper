import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";

export default function WebsiteForm({
  setURLFocus,
  setCompanyFocus,
  setContainerFocus,
  setTitleFocus,
  setLinkFocus,
  setVisibleComponent,
  setOpenLoader,
  setJobs,
  setWebsiteFormData,
  setWebsiteFilterData,
  currentWebsiteRecordId = null,
  websiteFormData,
  websiteFilterData,
}) {
  const testWebsiteSubmit = async (e) => {
    e.preventDefault();
    setOpenLoader(true);
    try {
      let response = null;
      const filterQueryString = websiteFilterData
        .map(
          (filter, index) =>
            `filter${index + 1}_filterXpath=${encodeURIComponent(
              filter.filterXpath
            )}&filter${index + 1}_type=${encodeURIComponent(
              filter.type
            )}&filter${index + 1}_selectValue=${encodeURIComponent(
              filter.selectValue
            )}`
        )
        .join("&");
      response = await axios.get(
        "http://localhost:5000/website/test?url=" +
          websiteFormData.url +
          "&company=" +
          websiteFormData.company +
          "&containerXpath=" +
          websiteFormData.containerXpath +
          "&titleXpath=" +
          websiteFormData.titleXpath +
          "&titleAttribute=" +
          websiteFormData.titleAttribute +
          "&linkXpath=" +
          websiteFormData.linkXpath +
          "&" +
          filterQueryString
      );
      if (response.status == 200) {
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
    };
    if (currentWebsiteRecordId) {
      fetchWebsite();
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
    if (websiteFilterData.length > 0) {
      let maxFilterIdRecord = websiteFilterData.reduce(function (
        prev,
        current
      ) {
        return prev && prev.id > current.id ? prev : current;
      });
      maxFilterId = maxFilterIdRecord.id;
    }
    setWebsiteFilterData([
      ...websiteFilterData,
      { id: maxFilterId + 1, filterXpath: "", type: "", selectValue: "" },
    ]);
  };

  const removeFilter = (id) => {
    setWebsiteFilterData(
      websiteFilterData.filter((filter) => filter.id !== id)
    );
  };

  const handleFilterChange = (id, field, value) => {
    setWebsiteFilterData(
      websiteFilterData.map((filter) =>
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  };

  return (
    <Paper elevation={24} sx={{ padding: "4rem" }}>
      <h2>Website Details</h2>
      <form onSubmit={testWebsiteSubmit}>
        <TextField
          id="outlined-basic"
          fullWidth
          name="url"
          label="Website Url"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setURLFocus(true)}
          onBlur={() => setURLFocus(false)}
          onChange={handleChange}
          value={websiteFormData.url}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="company"
          label="Company Name"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setCompanyFocus(true)}
          onBlur={() => setCompanyFocus(false)}
          onChange={handleChange}
          value={websiteFormData.company}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="containerXpath"
          label="Container Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setContainerFocus(true)}
          onBlur={() => setContainerFocus(false)}
          onChange={handleChange}
          value={websiteFormData.containerXpath}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="titleXpath"
          label="Title Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setTitleFocus(true)}
          onBlur={() => setTitleFocus(false)}
          onChange={handleChange}
          value={websiteFormData.titleXpath}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="titleAttribute"
          label="Title Attribute"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setTitleFocus(true)}
          onBlur={() => setTitleFocus(false)}
          onChange={handleChange}
          value={websiteFormData.titleAttribute}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="linkXpath"
          label="Link Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setLinkFocus(true)}
          onBlur={() => setLinkFocus(false)}
          onChange={handleChange}
          value={websiteFormData.linkXpath}
        />

        <Grid container spacing={6} sx={{ marginBottom: "1rem" }}>
          <Grid key={1} item xs={12}>
            <Fab
              color="primary"
              variant="extended"
              aria-label="add"
              onClick={() => addNewFilter()}
            >
              <AddIcon sx={{ marginRight: "1rem" }} />
              Add New Filter
            </Fab>
          </Grid>
        </Grid>

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
            <Grid container spacing={6} sx={{ marginBottom: "1rem" }}>
              <Grid key={1} item xs={12}>
                <Fab
                  color="primary"
                  aria-label="remove"
                  onClick={() => removeFilter(filter.id)}
                >
                  <DeleteIcon />
                </Fab>
              </Grid>
            </Grid>
            <TextField
              id="outlined-basic"
              fullWidth
              name="filterXpath"
              label="Filter Xpath"
              variant="outlined"
              sx={{ display: "block", marginBottom: "2rem" }}
              onChange={(e) =>
                handleFilterChange(filter.id, "filterXpath", e.target.value)
              }
              // value={websiteFormData.linkXpath}
            />
            <Select
              labelId="filter-type-label"
              id="type"
              //value={age}
              label="Filter Type"
              sx={{ display: "block", marginBottom: "2rem" }}
              onChange={(e) =>
                handleFilterChange(filter.id, "type", e.target.value)
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
              onChange={(e) =>
                handleFilterChange(filter.id, "selectValue", e.target.value)
              }
              // value={websiteFormData.linkXpath}
            />
          </Box>
        ))}

        <Button variant="contained" type="submit" sx={{ marginRight: "1rem" }}>
          Submit
        </Button>
        <Button
          variant="contained"
          onClick={() => setVisibleComponent("WebsiteIndex")}
        >
          Cancel
        </Button>
      </form>
    </Paper>
  );
}

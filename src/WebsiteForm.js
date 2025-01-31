import React, { useCallback, useMemo } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import DarkTextField from "./DarkTextField";
import DarkSelect from "./DarkSelect";
import { Paper, Typography, Box, Fab, Tooltip, Divider } from "@mui/material";
import { Delete, Add, FilterAlt, PlayArrow } from "@mui/icons-material";

export default function WebsiteForm({
  setFocusedElement,
  setVisibleComponent,
  setOpenLoader,
  setJobs,
  setWebsiteFormData,
  setWebsiteFilterData,
  setWebsiteNewFilterData,
  websiteFormData,
  websiteFilterData,
  websiteNewFilterData,
  channels,
  setSnackbar,
}) {
  const testWebsiteSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setOpenLoader(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/website/test",
          {
            websiteFormData,
            websiteFilterData,
            websiteNewFilterData,
          }
        );

        if (response.status === 200) {
          setJobs(response.data.jobs);
          setVisibleComponent("WebsiteTest");
        }
      } catch (error) {
        setSnackbar({
          message: error.response?.data?.error || "An error occurred",
          type: "error",
          open: true,
        });
      }
      setOpenLoader(false);
    },
    [
      setOpenLoader,
      setJobs,
      setVisibleComponent,
      websiteFormData,
      websiteFilterData,
      websiteNewFilterData,
      setSnackbar,
    ]
  );

  const handleChange = useCallback(
    (event) => {
      setWebsiteFormData((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    },
    [setWebsiteFormData]
  );

  const addNewFilter = useCallback(() => {
    setWebsiteNewFilterData((prevFilters) => [
      ...prevFilters,
      {
        id: prevFilters.length
          ? Math.max(...prevFilters.map((f) => f.id)) + 1
          : 1,
        filterXpath: "",
        type: "",
        selectValue: "",
      },
    ]);
  }, [setWebsiteNewFilterData]);

  const removeFilter = useCallback(
    (id, isNewFilter) => {
      if (isNewFilter) {
        setWebsiteNewFilterData((prev) =>
          prev.filter((filter) => filter.id !== id)
        );
      } else {
        setWebsiteFilterData((prev) =>
          prev.filter((filter) => filter.id !== id)
        );
      }
    },
    [setWebsiteNewFilterData, setWebsiteFilterData]
  );

  const handleFilterChange = useCallback(
    (id, field, value, isNewFilter) => {
      const setter = isNewFilter
        ? setWebsiteNewFilterData
        : setWebsiteFilterData;
      setter((prevFilters) =>
        prevFilters.map((filter) =>
          filter.id === id ? { ...filter, [field]: value } : filter
        )
      );
    },
    [setWebsiteNewFilterData, setWebsiteFilterData]
  );

  const filterTypeOptions = useMemo(
    () => [
      { value: "", name: "" },
      { value: "select", name: "Select" },
    ],
    []
  );
  const channelOptions = useMemo(
    () =>
      channels.map((channel) => ({ value: channel.id, name: channel.name })),
    [channels]
  );

  const renderFilterFields = (filters, isNewFilter) =>
    filters.map((filter) => (
      <Box
        key={filter.id}
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
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ color: "white" }}>
            Filter
          </Typography>
          <Tooltip title="Remove filter">
            <Fab
              className="redFab"
              sx={{ backgroundColor: "#ff3333", color: "white" }}
              aria-label="remove"
              onClick={() => removeFilter(filter.id, isNewFilter)}
            >
              <Delete />
            </Fab>
          </Tooltip>
        </Box>
        <Divider sx={{ marginBottom: "2rem" }} />
        <Box sx={{ padding: "12px 36px" }}>
          <DarkTextField
            name="filterXpath"
            label="Filter Xpath"
            value={filter.filterXpath}
            setFocusedElement={setFocusedElement}
            onFocusElement="filterXpath"
            targetId={filter.id}
            targetName="filterXpath"
            handleEventChange={(id, field, value) =>
              handleFilterChange(id, field, value, isNewFilter)
            }
          />
          <DarkSelect
            id="type"
            label="Filter Type"
            name="type"
            handleFilterChange={(id, field, value) =>
              handleFilterChange(id, field, value, isNewFilter)
            }
            filterId={filter.id}
            value={filter.type}
            options={filterTypeOptions}
          />
          <DarkTextField
            name="selectValue"
            label="Select Value"
            value={filter.selectValue}
            setFocusedElement={setFocusedElement}
            onFocusElement="filterSelectValue"
            targetId={filter.id}
            targetName="selectValue"
            handleEventChange={(id, field, value) =>
              handleFilterChange(id, field, value, isNewFilter)
            }
          />
        </Box>
      </Box>
    ));

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
          onFocusElement="url"
          onChange={handleChange}
          value={websiteFormData.url}
          setFocusedElement={setFocusedElement}
        />
        <DarkTextField
          id="companyField"
          name="company"
          label="Company Name"
          onFocusElement="company"
          onChange={handleChange}
          value={websiteFormData.company}
          setFocusedElement={setFocusedElement}
        />
        <DarkTextField
          id="containerXpathField"
          name="containerXpath"
          label="Container Xpath"
          onFocusElement="container"
          onChange={handleChange}
          value={websiteFormData.containerXpath}
          setFocusedElement={setFocusedElement}
        />
        <DarkTextField
          id="titleXpathField"
          name="titleXpath"
          label="Title Xpath"
          onFocusElement="titleXpath"
          onChange={handleChange}
          value={websiteFormData.titleXpath}
          setFocusedElement={setFocusedElement}
        />
        <DarkTextField
          id="titleAttributeField"
          name="titleAttribute"
          label="Title Attribute (optional)"
          onFocusElement="titleAttribute"
          onChange={handleChange}
          value={websiteFormData.titleAttribute}
          setFocusedElement={setFocusedElement}
        />
        <DarkTextField
          id="linkXpathField"
          name="linkXpath"
          label="Link Xpath"
          onFocusElement="link"
          onChange={handleChange}
          value={websiteFormData.linkXpath}
          setFocusedElement={setFocusedElement}
        />

        <Box sx={{ marginBottom: "2rem" }}>
          <Tooltip title="Add new filter">
            <Fab
              color="primary"
              className="blueFab"
              variant="extended"
              aria-label="add"
              onClick={addNewFilter}
            >
              <Add />
              <FilterAlt />
            </Fab>
          </Tooltip>
        </Box>

        {renderFilterFields(websiteFilterData, false)}
        {renderFilterFields(websiteNewFilterData, true)}

        <Box sx={{ width: "100%", textAlign: "right" }}>
          <Tooltip title="Test the scraper">
            <Fab
              className="blueFab"
              color="primary"
              aria-label="test"
              type="submit"
              sx={{ backgroundColor: "#22bb33", color: "white" }}
            >
              <PlayArrow />
            </Fab>
          </Tooltip>
        </Box>
      </form>
    </Paper>
  );
}

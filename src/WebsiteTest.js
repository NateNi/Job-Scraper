import React, { useCallback, useMemo } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import {
  Typography,
  Box,
  Paper,
  Grow,
  Tooltip,
  Fab,
  Divider,
} from "@mui/material";
import { ArrowBack, Close, Save } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

export default function WebsiteTest({
  jobs,
  setOpenLoader,
  currentWebsiteRecordId,
  websiteFormData,
  setVisibleComponent,
  websiteFilterData,
  websiteNewFilterData,
  setWebsiteNewFilterData,
  setWebsiteFilterData,
  setWebsiteFormData,
  setCurrentWebsiteRecordId,
  setSnackbar,
}) {
  const resetForm = useCallback(() => {
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
    setVisibleComponent("WebsiteIndex");
  }, [
    setWebsiteNewFilterData,
    setWebsiteFilterData,
    setWebsiteFormData,
    setCurrentWebsiteRecordId,
    setVisibleComponent,
  ]);

  const createWebsiteSubmit = useCallback(async () => {
    setOpenLoader(true);
    try {
      const url = currentWebsiteRecordId
        ? `http://localhost:5000/website/${currentWebsiteRecordId}`
        : "http://localhost:5000/website";

      const payload = {
        ...websiteFormData,
        filters: currentWebsiteRecordId
          ? websiteFilterData
          : [...websiteFilterData, ...websiteNewFilterData],
      };

      const response = await (currentWebsiteRecordId
        ? axios.put(url, payload)
        : axios.post(url, payload));

      if (response.status === 200) {
        setSnackbar({
          message: currentWebsiteRecordId
            ? "Website updated successfully."
            : "Website created successfully.",
          type: "success",
          open: true,
        });
        setVisibleComponent("WebsiteIndex");
        resetForm();
      }
    } catch (error) {
      setSnackbar({
        message: error.response?.data?.error || "An error occurred",
        type: "error",
        open: true,
      });
    }
    setOpenLoader(false);
  }, [
    currentWebsiteRecordId,
    websiteFormData,
    websiteFilterData,
    websiteNewFilterData,
    setOpenLoader,
    setVisibleComponent,
    resetForm,
    setSnackbar,
  ]);

  const columns = useMemo(
    () => [
      {
        field: "linkHTML",
        headerName: "Job(s)",
        flex: 1,
        renderCell: (params) => (
          <Box
            dangerouslySetInnerHTML={{ __html: params.value }}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          />
        ),
      },
    ],
    []
  );

  const rows = useMemo(
    () =>
      jobs.map((job, index) => ({
        id: index,
        linkHTML: `<a class='jobLink' target='_blank' rel="noreferrer" href='${job.link}'>${job.title}</a>`,
      })),
    [jobs]
  );

  return (
    <Grow in>
      <Paper
        elevation={24}
        className="componentPage"
        sx={{
          padding: "4rem",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Box sx={{ width: "100%", marginBottom: "2rem" }}>
          <Tooltip title="Cancel" sx={{ marginRight: "1rem" }}>
            <Fab color="primary" className="blueFab" onClick={resetForm}>
              <Close />
            </Fab>
          </Tooltip>
          <Tooltip title="Back to edit">
            <Fab
              color="primary"
              className="blueFab"
              onClick={() =>
                setVisibleComponent(
                  currentWebsiteRecordId ? "WebsiteEdit" : "WebsiteCreate"
                )
              }
            >
              <ArrowBack />
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
            {rows.length} {websiteFormData.company} Job(s) Found
          </Typography>
          <Divider
            orientation="horizontal"
            flexItem
            className="whiteDivider"
            sx={{ marginTop: "1rem", marginBottom: "2rem" }}
          />
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
            }}
            sx={{
              border: 0,
              marginBottom: "1rem",
              "& .MuiDataGrid-root, & .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders, & .MuiDataGrid-footerContainer, & .MuiTablePagination-root, & .MuiSvgIcon-root":
                {
                  color: "white",
                  borderColor: "white",
                },
            }}
          />
          <Box sx={{ textAlign: "right" }}>
            <Tooltip title="Save the scraper">
              <Fab
                className="greenFab"
                aria-label="test"
                onClick={createWebsiteSubmit}
                sx={{ backgroundColor: "#22bb33", color: "white" }}
              >
                <Save />
              </Fab>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </Grow>
  );
}

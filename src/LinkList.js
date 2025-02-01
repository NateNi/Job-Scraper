import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import {
  Tooltip,
  Grow,
  Paper,
  Box,
  Typography,
  Fab,
  Divider,
  CircularProgress,
  Link,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import DarkTextField from "./DarkTextField";

export default function LinkList({
  setVisibleComponent,
  setOpenLoader,
  currentWebsiteRecordId,
  setJobs,
  jobs,
  setSnackbar,
}) {
  const [searchText, setSearchText] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLinkList = useCallback(async () => {
    setOpenLoader(true);
    setLoading(true);
    try {
      const { data } = await axios.get(`/links/${currentWebsiteRecordId}`);
      setJobs(data.links);
      setCompany(data.company);
      await axios.put(`/links/${currentWebsiteRecordId}`); // Mark links as viewed
    } catch (error) {
      setSnackbar({
        message: error.response?.data?.error || "Failed to load links",
        type: "error",
        open: true,
      });
    }
    setOpenLoader(false);
    setLoading(false);
  }, [currentWebsiteRecordId, setJobs, setSnackbar, setOpenLoader]);

  useEffect(() => {
    fetchLinkList();
  }, [fetchLinkList]);

  const handleSearch = (event) => {
    setSearchText(event.target.value.toLowerCase());
  };

  const filteredRows = useMemo(() => {
    return jobs
      .map((job) => ({
        id: job.id,
        title: job.title,
        link: job.link,
        viewed: job.viewed,
        created_at: job.created_at,
      }))
      .filter((row) =>
        Object.values(row).some((field) =>
          String(field).toLowerCase().includes(searchText)
        )
      );
  }, [jobs, searchText]);

  const columns = [
    {
      field: "viewed",
      headerName: "",
      flex: 1,
      renderCell: (params) =>
        params.value === 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: "18px",
                height: "18px",
                backgroundColor: "red",
                borderRadius: "50%",
              }}
            />
          </Box>
        ) : null,
    },
    { field: "created_at", headerName: "Date", flex: 2 },
    {
      field: "title",
      headerName: "Job",
      flex: 4,
      renderCell: (params) => (
        <Link
          href={params.row.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: "none", color: "white", fontWeight: "bold" }}
        >
          {params.value}
        </Link>
      ),
    },
  ];

  return (
    <Grow in={true}>
      <Paper
        elevation={24}
        className="componentPage"
        sx={{
          padding: "4rem",
          maxWidth: "1000px",
          margin: "auto",
        }}
      >
        <Box sx={{ width: "100%", marginBottom: "2rem" }}>
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

        <Box sx={{ padding: "2rem 4rem 4rem 4rem" }}>
          <Typography
            variant="h3"
            sx={{ color: "white", fontWeight: "normal" }}
          >
            {company} Jobs
          </Typography>
          <Divider
            sx={{ marginTop: "1rem", marginBottom: "2rem" }}
            className="whiteDivider"
          />

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "end",
              mb: 2,
            }}
          >
            <DarkTextField
              label="Search"
              value={searchText}
              onChange={handleSearch}
              width="200px"
            />
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "2rem",
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          ) : filteredRows.length === 0 ? (
            <Typography
              variant="h5"
              sx={{ color: "gray", textAlign: "center" }}
            >
              No job listings found.
            </Typography>
          ) : (
            <DataGrid
              rows={filteredRows}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
                sorting: { sortModel: [{ field: "created_at", sort: "desc" }] },
              }}
              sx={{
                border: 0,
                marginBottom: "1rem",
                "& .MuiDataGrid-root, & .MuiDataGrid-cell, & .MuiDataGrid-columnHeaders, & .MuiDataGrid-footerContainer, & .MuiTablePagination-root, & .MuiSvgIcon-root":
                  { color: "white", borderColor: "white" },
              }}
            />
          )}
        </Box>
      </Paper>
    </Grow>
  );
}

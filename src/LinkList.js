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
  Typography,
  Fab,
  Divider,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

export default function LinkList({
  setVisibleComponent,
  setOpenLoader,
  currentWebsiteRecordId,
  setJobs,
  setCurrentWebsiteRecordId,
  jobs,
}) {
  useEffect(() => {
    const fetchLinkList = async () => {
      setOpenLoader(true);
      const response = await axios.get("/links/" + currentWebsiteRecordId);
      setJobs(response.data.links);
      setCompany(response.data.company);
      setRows(
        response.data.links.map(function (job, index) {
          return {
            id: job["id"],
            linkHTML: "<a href='" + job["link"] + "'>" + job["title"] + "</a>",
            viewed: job["viewed"],
            created_at: job["created_at"],
          };
        })
      );
      setOpenLoader(false);
      setViewedLinks();
    };

    fetchLinkList();
  }, []);

  const setViewedLinks = async () => {
    setOpenLoader(true);
    const response = await axios.put("/links/" + currentWebsiteRecordId);
    setOpenLoader(false);
  };

  const [searchText, setSearchText] = useState("");
  const [company, setCompany] = useState("");

  const columns = [
    {
      field: "viewed",
      headerName: "",
      flex: 1,

      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {params.value === 0 && (
            <Box
              sx={{
                width: "18px",
                height: "18px",
                backgroundColor: "red",
                borderRadius: "50%",
              }}
            />
          )}
        </Box>
      ),
    },
    { field: "created_at", headerName: "Date", flex: 2 },
    {
      field: "linkHTML",
      headerName: "Job",
      flex: 4,
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
  ];
  const [rows, setRows] = useState([]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);

    if (value) {
      const filteredRows = jobs
        .map(function (job, index) {
          return {
            id: job["id"],
            linkHTML:
              "<a target='_blank' href='" +
              job["link"] +
              "'>" +
              job["title"] +
              "</a>",
            created_at: job["created_at"],
          };
        })
        .filter((row) =>
          Object.values(row).some((field) =>
            String(field).toLowerCase().includes(value)
          )
        );
      setRows(filteredRows);
    } else {
      setRows(
        jobs.map(function (job, index) {
          return {
            id: job["id"],
            linkHTML:
              "<a target='_blank' href='" +
              job["link"] +
              "'>" +
              job["title"] +
              "</a>",
            created_at: job["created_at"],
          };
        })
      );
    }
  };

  const paginationModel = { page: 0, pageSize: 10 };

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
          {company} Jobs Found
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
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchText}
          onChange={handleSearch}
          sx={{ mb: 2 }}
        />
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          sx={{ border: 0, marginBottom: "1rem" }}
        />
      </Paper>
    </Grow>
  );
}

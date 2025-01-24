import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import {
  Tooltip,
  TextField,
  Grow,
  Paper,
  Box,
  Typography,
  Fab,
  Divider,
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
  setErrorMessage,
}) {
  useEffect(() => {
    const fetchLinkList = async () => {
      setOpenLoader(true);
      try {
        let response = null;
        response = await axios.get("/links/" + currentWebsiteRecordId);
        if (response.status === 200) {
          setJobs(response.data.links);
          setCompany(response.data.company);
          setRows(
            response.data.links.map(function (job, index) {
              return {
                id: job["id"],
                linkHTML:
                  "<a class='jobLink' href='" +
                  job["link"] +
                  "'>" +
                  job["title"] +
                  "</a>",
                viewed: job["viewed"],
                created_at: job["created_at"],
              };
            })
          );
          setViewedLinks();
        }
      } catch (error) {
        setErrorMessage(error.response.data.error);
      }
      setOpenLoader(false);
    };

    fetchLinkList();
  }, []);

  const setViewedLinks = async () => {
    try {
      const response = await axios.put("/links/" + currentWebsiteRecordId);
    } catch (error) {
      setErrorMessage(error.response.data.error);
    }
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
              "<a class='jobLink' target='_blank' href='" +
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
              "<a class='jobLink' target='_blank' href='" +
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
          maxWidth: "1000px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Box sx={{ width: "100%", marginBottom: "2rem" }}>
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
            {company} Jobs
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
          <Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
            <DarkTextField
              label="Search"
              value={searchText}
              onChange={handleSearch}
              width="200px"
              sx={{ mb: 2 }}
            />
          </Box>

          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            sx={{
              border: 0,
              marginBottom: "1rem",
              "& .MuiDataGrid-root": {
                color: "white", // Text color
                borderColor: "white", // Border color
              },
              "& .MuiDataGrid-cell": {
                color: "white",
                borderColor: "white", // Cell border color
              },
              "& .MuiDataGrid-columnHeaders": {
                borderColor: "white", // Header border color
              },
              "& .MuiDataGrid-footerContainer": {
                borderColor: "white", // Footer border color
              },
              "& .MuiTablePagination-root": {
                color: "white", // Pagination text color
              },
              "& .MuiSvgIcon-root": {
                color: "white", // Pagination icons color (e.g., arrows)
              },
            }}
          />
        </Box>
      </Paper>
    </Grow>
  );
}

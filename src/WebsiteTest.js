import React, { useState, useEffect } from "react";
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
  Button,
  Tooltip,
  Fab,
  Divider,
} from "@mui/material";
import { ArrowBack, Close, Save } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

export default function WebsiteTest({
  jobs,
  setOpenLoader,
  currentWebsiteRecordId = null,
  websiteFormData,
  setVisibleComponent,
  websiteFilterData,
  websiteNewFilterData,
  setWebsiteNewFilterData,
  setWebsiteFilterData,
  setWebsiteFormData,
  setCurrentWebsiteRecordId,
  setSuccessMessage,
  setErrorMessage,
}) {
  const createWebsiteSubmit = async () => {
    setOpenLoader(true);
    try {
      let response = null;
      let message = null;
      if (currentWebsiteRecordId) {
        response = await axios.put(
          "http://localhost:5000/website/" + currentWebsiteRecordId,
          {
            ...websiteFormData,
            filters: websiteFilterData,
            newFilters: websiteNewFilterData,
          }
        );
        message = "Website updated successfully.";
      } else {
        response = await axios.post("http://localhost:5000/website", {
          ...websiteFormData,
          filters: [...websiteFilterData, ...websiteNewFilterData],
        });
        message = "Website created successfully.";
      }
      if (response.status == 200) {
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
        setSuccessMessage(message);
      }
    } catch (error) {
      console.error(error.response.data.error);
      setErrorMessage(error.response.data.error);
    }
    setOpenLoader(false);
  };

  const columns = [
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
  ];
  const [rows, setRows] = useState(
    jobs.map(function (job, index) {
      return {
        id: index,
        linkHTML:
          "<a class='jobLink' target='_blank' href='" +
          job["link"] +
          "'>" +
          job["title"] +
          "</a>",
      };
    })
  );

  const paginationModel = { page: 0, pageSize: 10 };

  return (
    <Grow in={true}>
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
          <Tooltip
            sx={{ mr: "1rem" }}
            title={<span class="tooltipText">Cancel</span>}
          >
            <Fab
              color="primary"
              className="blueFab"
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
              <Close />
            </Fab>
          </Tooltip>
          <Tooltip title={<span class="tooltipText">Back to edit</span>}>
            <Fab
              color="primary"
              className="blueFab"
              onClick={() => {
                setVisibleComponent(
                  currentWebsiteRecordId ? "WebsiteEdit" : "WebsiteCreate"
                );
              }}
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
            {rows.length} {websiteFormData["company"]} Job(s) Found
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
          <Box sx={{ textAlign: "right" }}>
            <Tooltip title={<span class="tooltipText">Save the scraper</span>}>
              <Fab
                className="greenFab"
                aria-label="test"
                onClick={() => createWebsiteSubmit()}
                sx={{
                  backgroundColor: "#22bb33",
                  color: "white",
                }}
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

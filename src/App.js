import React, { useState, useCallback, useMemo } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import {
  Backdrop,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
} from "@mui/material";
import WebsiteRecord from "./WebsiteRecord.js";
import WebsiteIndex from "./WebsiteIndex.js";
import WebsiteTest from "./WebsiteTest.js";
import LinkList from "./LinkList.js";
import Settings from "./Settings.js";

function App() {
  const [visibleComponent, setVisibleComponent] = useState("WebsiteIndex");
  const [currentWebsiteRecordId, setCurrentWebsiteRecordId] = useState("");
  const [websiteFormData, setWebsiteFormData] = useState({
    url: "",
    company: "",
    containerXpath: "",
    titleXpath: "",
    titleAttribute: "",
    linkXpath: "",
    channelId: "",
  });
  const [websiteFilterData, setWebsiteFilterData] = useState([]);
  const [websiteNewFilterData, setWebsiteNewFilterData] = useState([]);
  const [openLoader, setOpenLoader] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [channels, setChannels] = useState([]);
  const [snackbar, setSnackbar] = useState({
    message: "",
    type: "",
    open: false,
  });

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const componentMap = useMemo(
    () => ({
      WebsiteIndex: (
        <WebsiteIndex
          setVisibleComponent={setVisibleComponent}
          setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
          setChannels={setChannels}
          setOpenLoader={setOpenLoader}
          setSnackbar={setSnackbar}
        />
      ),
      WebsiteCreate: (
        <WebsiteRecord
          setVisibleComponent={setVisibleComponent}
          setOpenLoader={setOpenLoader}
          setJobs={setJobs}
          websiteFilterData={websiteFilterData}
          websiteNewFilterData={websiteNewFilterData}
          websiteFormData={websiteFormData}
          setWebsiteFormData={setWebsiteFormData}
          setWebsiteFilterData={setWebsiteFilterData}
          setWebsiteNewFilterData={setWebsiteNewFilterData}
          setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
          channels={channels}
          setSnackbar={setSnackbar}
        />
      ),
      WebsiteEdit: (
        <WebsiteRecord
          setVisibleComponent={setVisibleComponent}
          setOpenLoader={setOpenLoader}
          setJobs={setJobs}
          websiteFormData={websiteFormData}
          websiteFilterData={websiteFilterData}
          websiteNewFilterData={websiteNewFilterData}
          currentWebsiteRecordId={currentWebsiteRecordId}
          setWebsiteFormData={setWebsiteFormData}
          setWebsiteFilterData={setWebsiteFilterData}
          setWebsiteNewFilterData={setWebsiteNewFilterData}
          setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
          channels={channels}
          setSnackbar={setSnackbar}
        />
      ),
      WebsiteTest: (
        <WebsiteTest
          jobs={jobs}
          setOpenLoader={setOpenLoader}
          currentWebsiteRecordId={currentWebsiteRecordId}
          websiteFormData={websiteFormData}
          setVisibleComponent={setVisibleComponent}
          websiteFilterData={websiteFilterData}
          websiteNewFilterData={websiteNewFilterData}
          setWebsiteFilterData={setWebsiteFilterData}
          setWebsiteNewFilterData={setWebsiteNewFilterData}
          setWebsiteFormData={setWebsiteFormData}
          setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
          setSnackbar={setSnackbar}
        />
      ),
      LinkList: (
        <LinkList
          setVisibleComponent={setVisibleComponent}
          setOpenLoader={setOpenLoader}
          jobs={jobs}
          setJobs={setJobs}
          currentWebsiteRecordId={currentWebsiteRecordId}
          setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
          setSnackbar={setSnackbar}
        />
      ),
      Settings: (
        <Settings
          setVisibleComponent={setVisibleComponent}
          setOpenLoader={setOpenLoader}
          jobs={jobs}
          setJobs={setJobs}
          currentWebsiteRecordId={currentWebsiteRecordId}
          setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
          setSnackbar={setSnackbar}
        />
      ),
    }),
    [
      jobs,
      websiteFormData,
      websiteFilterData,
      websiteNewFilterData,
      currentWebsiteRecordId,
      channels,
    ]
  );

  return (
    <div className="App">
      <div className="component-container">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
            alignSelf: "flex-end",
            top: "2rem",
            height: "5rem",
          }}
        >
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={closeSnackbar}
          >
            <Alert
              variant="outlined"
              severity={snackbar.type}
              sx={{
                bottom: "2rem",
                backgroundColor: "white",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
        {componentMap[visibleComponent] || null}
      </div>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={openLoader}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default App;

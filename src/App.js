import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Backdrop, CircularProgress, Alert, Fade } from "@mui/material";
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
  const [successMessage, setSuccessMessage] = useState();

  const renderComponent = () => {
    switch (visibleComponent) {
      case "WebsiteIndex":
        return (
          <WebsiteIndex
            setVisibleComponent={setVisibleComponent}
            setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
            setChannels={setChannels}
            setOpenLoader={setOpenLoader}
            setSuccessMessage={setSuccessMessage}
          />
        );
      case "WebsiteCreate":
        return (
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
          />
        );
      case "WebsiteEdit":
        return (
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
          />
        );
      case "WebsiteTest":
        return (
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
            setSuccessMessage={setSuccessMessage}
          />
        );
      case "LinkList":
        return (
          <LinkList
            setVisibleComponent={setVisibleComponent}
            setOpenLoader={setOpenLoader}
            jobs={jobs}
            setJobs={setJobs}
            currentWebsiteRecordId={currentWebsiteRecordId}
            setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
          />
        );
      case "Settings":
        return (
          <Settings
            setVisibleComponent={setVisibleComponent}
            setOpenLoader={setOpenLoader}
            jobs={jobs}
            setJobs={setJobs}
            currentWebsiteRecordId={currentWebsiteRecordId}
            setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
            setSuccessMessage={setSuccessMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <div className="component-container">
        {renderComponent()} {/* {successMessage && ( */}
        <Fade in={successMessage}>
          <Alert variant="outlined" severity="success">
            {successMessage}
          </Alert>
        </Fade>
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

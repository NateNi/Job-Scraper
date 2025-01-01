import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import WebsiteRecord from "./WebsiteRecord.js";
import WebsiteIndex from "./WebsiteIndex.js";
import WebsiteTest from "./WebsiteTest.js";

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
  });
  const [websiteFilterData, setWebsiteFilterData] = useState([]);
  const [openLoader, setOpenLoader] = useState(false);
  const [jobs, setJobs] = useState([]);

  const renderComponent = () => {
    switch (visibleComponent) {
      case "WebsiteIndex":
        return (
          <WebsiteIndex
            setVisibleComponent={setVisibleComponent}
            setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
            setOpenLoader={setOpenLoader}
          />
        );
      case "WebsiteCreate":
        return (
          <WebsiteRecord
            setVisibleComponent={setVisibleComponent}
            setOpenLoader={setOpenLoader}
            setJobs={setJobs}
            websiteFilterData={websiteFilterData}
            websiteFormData={websiteFormData}
            setWebsiteFormData={setWebsiteFormData}
            setWebsiteFilterData={setWebsiteFilterData}
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
            currentWebsiteRecordId={currentWebsiteRecordId}
            setWebsiteFormData={setWebsiteFormData}
            setWebsiteFilterData={setWebsiteFilterData}
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <div className="component-container">{renderComponent()}</div>
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

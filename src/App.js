import React, { useState } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Backdrop, CircularProgress } from "@mui/material";
import WebsiteRecord from "./WebsiteRecord.js";
import WebsiteIndex from "./WebsiteIndex.js";
import WebsiteTest from "./WebsiteTest.js";
import LinkList from "./LinkList.js";

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
  const [websiteNewFilterData, setWebsiteNewFilterData] = useState([]);
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
            websiteNewFilterData={websiteNewFilterData}
            websiteFormData={websiteFormData}
            setWebsiteFormData={setWebsiteFormData}
            setWebsiteFilterData={setWebsiteFilterData}
            setWebsiteNewFilterData={setWebsiteNewFilterData}
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

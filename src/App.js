import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import WebsiteRecord from "./WebsiteRecord.js";
import WebsiteIndex from "./WebsiteIndex.js";

function App() {
  const [visibleComponent, setVisibleComponent] = useState("WebsiteIndex");
  const [currentWebsiteRecordId, setCurrentWebsiteRecordId] = useState("");

  const renderComponent = () => {
    switch (visibleComponent) {
      case "WebsiteIndex":
        return (
          <WebsiteIndex
            setVisibleComponent={setVisibleComponent}
            setCurrentWebsiteRecordId={setCurrentWebsiteRecordId}
          />
        );
      case "WebsiteCreate":
        return <WebsiteRecord setVisibleComponent={setVisibleComponent} />;
      case "WebsiteEdit":
        return (
          <WebsiteRecord
            setVisibleComponent={setVisibleComponent}
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
    </div>
  );
}

export default App;

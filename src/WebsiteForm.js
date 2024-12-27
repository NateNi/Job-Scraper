import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export default function WebsiteForm({
  setURLFocus,
  setCompanyFocus,
  setContainerFocus,
  setTitleFocus,
  setLinkFocus,
  setVisibleComponent,
  currentWebsiteRecordId = null,
}) {
  const [websiteFormData, setWebsiteFormData] = useState({
    url: "",
    company: "",
    containerXpath: "",
    titleXpath: "",
    titleAttribute: "",
    linkXpath: "",
  });

  const createWebsiteSubmit = async (e) => {
    e.preventDefault();
    try {
      let response = null;
      if (currentWebsiteRecordId) {
        response = await axios.put(
          "http://localhost:5000/website/" + currentWebsiteRecordId,
          websiteFormData
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/website",
          websiteFormData
        );
      }
      if (response.status == 200) {
        setVisibleComponent("WebsiteIndex");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const fetchWebsite = async () => {
      const response = await axios.get("/website/" + currentWebsiteRecordId);
      setWebsiteFormData(response.data.website);
    };
    if (currentWebsiteRecordId) {
      fetchWebsite();
    }
  }, []);

  const handleChange = (event) => {
    setWebsiteFormData({
      ...websiteFormData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Paper elevation={24} sx={{ padding: "4rem" }}>
      <h2>Website Details</h2>
      <form onSubmit={createWebsiteSubmit}>
        <TextField
          id="outlined-basic"
          fullWidth
          name="url"
          label="Website Url"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setURLFocus(true)}
          onBlur={() => setURLFocus(false)}
          onChange={handleChange}
          value={websiteFormData.url}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="company"
          label="Company Name"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setCompanyFocus(true)}
          onBlur={() => setCompanyFocus(false)}
          onChange={handleChange}
          value={websiteFormData.company}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="containerXpath"
          label="Container Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setContainerFocus(true)}
          onBlur={() => setContainerFocus(false)}
          onChange={handleChange}
          value={websiteFormData.containerXpath}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="titleXpath"
          label="Title Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setTitleFocus(true)}
          onBlur={() => setTitleFocus(false)}
          onChange={handleChange}
          value={websiteFormData.titleXpath}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="titleAttribute"
          label="Title Attribute"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setTitleFocus(true)}
          onBlur={() => setTitleFocus(false)}
          onChange={handleChange}
          value={websiteFormData.titleAttribute}
        />

        <TextField
          id="outlined-basic"
          fullWidth
          name="linkXpath"
          label="Link Xpath"
          variant="outlined"
          sx={{ display: "block", marginBottom: "2rem" }}
          onFocus={() => setLinkFocus(true)}
          onBlur={() => setLinkFocus(false)}
          onChange={handleChange}
          value={websiteFormData.linkXpath}
        />
        <Button variant="contained" type="submit">
          Submit
        </Button>
        <Button
          variant="contained"
          onClick={() => setVisibleComponent("WebsiteIndex")}
        >
          Cancel
        </Button>
      </form>
    </Paper>
  );
}

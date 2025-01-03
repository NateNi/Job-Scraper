import React, { useEffect } from "react";
import axios from "axios";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { Typography } from "@mui/material";

export default function WebsiteForm({
  setURLFocus,
  setCompanyFocus,
  setContainerFocus,
  setTitleFocus,
  setLinkFocus,
  setVisibleComponent,
  setOpenLoader,
  setJobs,
  setWebsiteFormData,
  setWebsiteFilterData,
  setWebsiteNewFilterData,
  currentWebsiteRecordId = null,
  websiteFormData,
  websiteFilterData,
  websiteNewFilterData,
}) {
  const testWebsiteSubmit = async (e) => {
    e.preventDefault();
    setOpenLoader(true);
    try {
      let response = null;
      const filterQueryString = websiteFilterData
        .map(
          (filter, index) =>
            `filter${index + 1}_filterXpath=${encodeURIComponent(
              filter.filterXpath
            )}&filter${index + 1}_type=${encodeURIComponent(
              filter.type
            )}&filter${index + 1}_selectValue=${encodeURIComponent(
              filter.selectValue
            )}`
        )
        .join("&");
      const newFilterQueryString = websiteNewFilterData
        .map(
          (filter, index) =>
            `newFilter${index + 1}_filterXpath=${encodeURIComponent(
              filter.filterXpath
            )}&newFilter${index + 1}_type=${encodeURIComponent(
              filter.type
            )}&newFilter${index + 1}_selectValue=${encodeURIComponent(
              filter.selectValue
            )}`
        )
        .join("&");
      response = await axios.get(
        "http://localhost:5000/website/test?url=" +
          websiteFormData.url +
          "&company=" +
          websiteFormData.company +
          "&containerXpath=" +
          websiteFormData.containerXpath +
          "&titleXpath=" +
          websiteFormData.titleXpath +
          "&titleAttribute=" +
          websiteFormData.titleAttribute +
          "&linkXpath=" +
          websiteFormData.linkXpath +
          "&" +
          filterQueryString +
          "&" +
          newFilterQueryString
      );
      if (response.status === 200) {
        setJobs(response.data.jobs);
        setVisibleComponent("WebsiteTest");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setOpenLoader(false);
  };

  useEffect(() => {
    const fetchWebsite = async () => {
      const response = await axios.get("/website/" + currentWebsiteRecordId);
      setWebsiteFormData(response.data.website);
      setWebsiteFilterData(response.data.filters);
    };
    if (currentWebsiteRecordId) {
      fetchWebsite();
    } else {
      setWebsiteFormData({
        url: "",
        company: "",
        containerXpath: "",
        titleXpath: "",
        titleAttribute: "",
        linkXpath: "",
      });
      setWebsiteFilterData([]);
    }
  }, []);

  const handleChange = (event) => {
    setWebsiteFormData({
      ...websiteFormData,
      [event.target.name]: event.target.value,
    });
  };

  const addNewFilter = () => {
    let maxFilterId = 0;
    if (websiteNewFilterData.length > 0) {
      let maxFilterIdRecord = websiteNewFilterData.reduce(function (
        prev,
        current
      ) {
        return prev && prev.id > current.id ? prev : current;
      });
      maxFilterId = maxFilterIdRecord.id;
    }
    setWebsiteNewFilterData([
      ...websiteNewFilterData,
      { id: maxFilterId + 1, filterXpath: "", type: "", selectValue: "" },
    ]);
  };

  const removeFilter = (id) => {
    setWebsiteFilterData(
      websiteFilterData.filter((filter) => filter.id !== id)
    );
  };

  const removeNewFilter = (id) => {
    setWebsiteNewFilterData(
      websiteNewFilterData.filter((filter) => filter.id !== id)
    );
  };

  const handleFilterChange = (id, field, value) => {
    setWebsiteFilterData(
      websiteFilterData.map((filter) =>
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  };

  const handleNewFilterChange = (id, field, value) => {
    setWebsiteNewFilterData(
      websiteNewFilterData.map((filter) =>
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  };

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .MuiTooltip-arrow`]: {
      color: "blue",
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "blue",
      color: "white",
      maxWidth: 300,
      fontSize: "1rem",
      border: "1px solid blue",
    },
  }));

  return (
    <Paper elevation={24} sx={{ padding: "4rem" }}>
      <h2>Website Details</h2>
      <form onSubmit={testWebsiteSubmit}>
        <HtmlTooltip
          title={
            <React.Fragment>
              <Box sx={{ padding: "0.5rem 1rem" }}>
                <p>The url for the website you wish to scrape.</p>
                <p>
                  <em>Hints:</em>
                </p>
                <ul>
                  <li>
                    Use the url generated after searching for any keywords,
                    applying filters, and sorting the results. Take note if the
                    url reflects these selections in its parameters
                  </li>
                </ul>
              </Box>
            </React.Fragment>
          }
          placement="right"
          arrow
        >
          <TextField
            id="urlField"
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
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <React.Fragment>
              <Box sx={{ padding: "0.5rem 1rem" }}>
                <p>The name you wish to associate with this url.</p>
              </Box>
            </React.Fragment>
          }
          placement="right"
          arrow
        >
          <TextField
            id="companyField"
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
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <React.Fragment>
              <Box sx={{ padding: "0.5rem 1rem" }}>
                <p>
                  The Xpath to the common parent element that each job listing
                  has on the page.
                </p>
                <p>
                  <em>Hints:</em>
                </p>
                <ul>
                  <li className="liSpacing">
                    If the job title and link are within the same element on the
                    page, this can serve as your container
                  </li>
                  <li>
                    <a
                      className="tooltipLink"
                      target="_blank"
                      href="https://www.w3schools.com/xml/xpath_syntax.asp"
                    >
                      Xpath Guide
                    </a>
                  </li>
                </ul>
              </Box>
            </React.Fragment>
          }
          placement="right"
          arrow
        >
          <TextField
            id="containerXpathField"
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
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <React.Fragment>
              <Box sx={{ padding: "0.5rem 1rem" }}>
                <p>
                  The Xpath to the element with the job title{" "}
                  <em>relative to the container</em>.
                </p>
                <p>
                  <em>Hints:</em>
                </p>
                <ul>
                  <li className="liSpacing">
                    If the job title and link are within the same element on the
                    page, this Xpath should be "."
                  </li>
                  <li>
                    <a
                      className="tooltipLink"
                      target="_blank"
                      href="https://www.w3schools.com/xml/xpath_syntax.asp"
                    >
                      Xpath Guide
                    </a>
                  </li>
                </ul>
              </Box>
            </React.Fragment>
          }
          placement="right"
          arrow
        >
          <TextField
            id="titleXpathField"
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
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <React.Fragment>
              <Box sx={{ padding: "0.5rem 1rem" }}>
                <p>
                  The attribute of the element defined by the title Xpath that
                  contains the job title.
                </p>
                <p>
                  <em>Hints:</em>
                </p>
                <ul>
                  <li className="liSpacing">This field is optional</li>
                  <li>
                    If no entry is provided, the text of the title Xpath element
                    will be used for the job title.
                  </li>
                </ul>
              </Box>
            </React.Fragment>
          }
          placement="right"
          arrow
        >
          <TextField
            id="titleAttributeField"
            fullWidth
            name="titleAttribute"
            label="Title Attribute (optional)"
            variant="outlined"
            sx={{ display: "block", marginBottom: "2rem" }}
            onFocus={() => setTitleFocus(true)}
            onBlur={() => setTitleFocus(false)}
            onChange={handleChange}
            value={websiteFormData.titleAttribute}
          />
        </HtmlTooltip>
        <HtmlTooltip
          title={
            <React.Fragment>
              <Box sx={{ padding: "0.5rem 1rem" }}>
                <p>
                  The Xpath to the element with the job link{" "}
                  <em>relative to the container</em>.
                </p>
                <p>
                  <em>Hints:</em>
                </p>
                <ul>
                  <li className="liSpacing">
                    If the job title and link are within the same element on the
                    page, this Xpath should be "."
                  </li>
                  <li>
                    <a
                      className="tooltipLink"
                      target="_blank"
                      href="https://www.w3schools.com/xml/xpath_syntax.asp"
                    >
                      Xpath Guide
                    </a>
                  </li>
                </ul>
              </Box>
            </React.Fragment>
          }
          placement="right"
          arrow
        >
          <TextField
            id="linkXpathField"
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
        </HtmlTooltip>

        <Box sx={{ marginBottom: "2rem" }}>
          <HtmlTooltip
            title={
              <React.Fragment>
                <Box sx={{ padding: "0.5rem 1rem" }}>
                  <p>
                    Adds a filter that should be applied by interacting with the
                    page (ex. sorting by "Most Recent").
                  </p>
                </Box>
              </React.Fragment>
            }
            placement="right"
            arrow
          >
            <Fab
              color="primary"
              variant="extended"
              aria-label="add"
              onClick={() => addNewFilter()}
            >
              <AddIcon sx={{ marginRight: "0.5rem" }} />
              Filter
            </Fab>
          </HtmlTooltip>
        </Box>

        {websiteFilterData.map((filter) => (
          <Box
            key={filter.id}
            sx={{
              padding: "24px 24px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginBottom: "24px",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2rem",
              }}
            >
              <h2>Filter</h2>
              <Fab
                color="primary"
                aria-label="remove"
                onClick={() => removeFilter(filter.id)}
              >
                <DeleteIcon />
              </Fab>
            </Box>
            <HtmlTooltip
              title={
                <React.Fragment>
                  <Box sx={{ padding: "0.5rem 1rem" }}>
                    <p>The Xpath to the filter element.</p>
                    <p>
                      <em>Hints:</em>
                    </p>
                    <ul>
                      <li>
                        <a
                          className="tooltipLink"
                          target="_blank"
                          href="https://www.w3schools.com/xml/xpath_syntax.asp"
                        >
                          Xpath Guide
                        </a>
                      </li>
                    </ul>
                  </Box>
                </React.Fragment>
              }
              placement="right"
              arrow
            >
              <TextField
                fullWidth
                name="filterXpath"
                label="Filter Xpath"
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onChange={(e) =>
                  handleFilterChange(filter.id, "filterXpath", e.target.value)
                }
                value={filter.filterXpath}
              />
            </HtmlTooltip>
            <Select
              labelId="filter-type-label"
              name="type"
              label="Filter Type"
              sx={{ display: "block", marginBottom: "2rem" }}
              onChange={(e) =>
                handleFilterChange(filter.id, "type", e.target.value)
              }
              value={filter.type}
            >
              <MenuItem value="select" selected={filter.type === "select"}>
                Select
              </MenuItem>
            </Select>
            <HtmlTooltip
              title={
                <React.Fragment>
                  <Box sx={{ padding: "0.5rem 1rem" }}>
                    <p>
                      The value of the option to use in the filter select box.
                    </p>
                  </Box>
                </React.Fragment>
              }
              placement="right"
              arrow
            >
              <TextField
                fullWidth
                name="selectValue"
                label="Select Value"
                variant="outlined"
                sx={{ display: "block" }}
                onChange={(e) =>
                  handleFilterChange(filter.id, "selectValue", e.target.value)
                }
                value={filter.selectValue}
              />
            </HtmlTooltip>
          </Box>
        ))}

        {websiteNewFilterData.map((filter) => (
          <Box
            key={filter.id}
            sx={{
              padding: "24px 24px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginBottom: "24px",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2rem",
              }}
            >
              <h2>Filter</h2>
              <Fab
                color="primary"
                aria-label="remove"
                onClick={() => removeNewFilter(filter.id)}
              >
                <DeleteIcon />
              </Fab>
            </Box>
            <HtmlTooltip
              title={
                <React.Fragment>
                  <Box sx={{ padding: "0.5rem 1rem" }}>
                    <p>The Xpath to the filter element.</p>
                    <p>
                      <em>Hints:</em>
                    </p>
                    <ul>
                      <li>
                        <a
                          className="tooltipLink"
                          target="_blank"
                          href="https://www.w3schools.com/xml/xpath_syntax.asp"
                        >
                          Xpath Guide
                        </a>
                      </li>
                    </ul>
                  </Box>
                </React.Fragment>
              }
              placement="right"
              arrow
            >
              <TextField
                id="outlined-basic"
                fullWidth
                name="filterXpath"
                label="Filter Xpath"
                variant="outlined"
                sx={{ display: "block", marginBottom: "2rem" }}
                onChange={(e) =>
                  handleNewFilterChange(
                    filter.id,
                    "filterXpath",
                    e.target.value
                  )
                }
              />
            </HtmlTooltip>
            <Select
              labelId="filter-type-label"
              id="type"
              //value={age}
              label="Filter Type"
              sx={{ display: "block", marginBottom: "2rem" }}
              onChange={(e) =>
                handleNewFilterChange(filter.id, "type", e.target.value)
              }
            >
              <MenuItem value={"select"}>Select</MenuItem>
            </Select>
            <HtmlTooltip
              title={
                <React.Fragment>
                  <Box sx={{ padding: "0.5rem 1rem" }}>
                    <p>
                      The value of the option to use in the filter select box.
                    </p>
                  </Box>
                </React.Fragment>
              }
              placement="right"
              arrow
            >
              <TextField
                id="outlined-basic"
                fullWidth
                name="selectValue"
                label="Select Value"
                variant="outlined"
                sx={{ display: "block" }}
                onChange={(e) =>
                  handleNewFilterChange(
                    filter.id,
                    "selectValue",
                    e.target.value
                  )
                }
              />
            </HtmlTooltip>
          </Box>
        ))}
        <Box sx={{ width: "100%", textAlign: "right" }}>
          <Button
            variant="contained"
            type="submit"
            sx={{ marginRight: "1rem" }}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setVisibleComponent("WebsiteIndex")}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

import React, { useState, useEffect } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Typography, Box, Paper } from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  ArrowDropDown,
  Refresh,
  Home,
} from "@mui/icons-material";

export default function DescriptionBox({ focusedElement }) {
  return (
    <Paper
      elevation={24}
      sx={{ padding: "4rem", borderRadius: "2rem", backgroundColor: "#3e3e42" }}
    >
      {focusedElement === "url" && (
        <Box sx={{ padding: "0.5rem 1rem", color: "white" }}>
          <p>The url for the website you wish to scrape.</p>
          <p>
            <em>Hints:</em>
          </p>
          <ul>
            <li>
              Use the url generated after searching for any keywords, applying
              filters, and sorting the results. Take note if the url reflects
              these selections in its parameters
            </li>
          </ul>
        </Box>
      )}

      {focusedElement === "company" && (
        <Box sx={{ padding: "0.5rem 1rem", color: "white" }}>
          <p>The name you wish to associate with this url.</p>
        </Box>
      )}
      {focusedElement === "container" && (
        <Box sx={{ padding: "0.5rem 1rem", color: "white" }}>
          <p>
            The Xpath to the common parent element that each job listing has on
            the page.
          </p>
          <p>
            <em>Hints:</em>
          </p>
          <ul>
            <li className="liSpacing">
              If the job title and link are within the same element on the page,
              this can serve as your container
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
      )}
      {focusedElement === "title" && (
        <Box sx={{ padding: "0.5rem 1rem", color: "white" }}>
          <p>
            The Xpath to the element with the job title{" "}
            <em>relative to the container</em>.
          </p>
          <p>
            <em>Hints:</em>
          </p>
          <ul>
            <li className="liSpacing">
              If the job title and link are within the same element on the page,
              this Xpath should be "."
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
      )}
      {focusedElement === "title" && (
        <Box sx={{ padding: "0.5rem 1rem", color: "white" }}>
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
              If no entry is provided, the text of the title Xpath element will
              be used for the job title.
            </li>
          </ul>
        </Box>
      )}
      {focusedElement === "link" && (
        <Box sx={{ padding: "0.5rem 1rem", color: "white" }}>
          <p>
            The Xpath to the element with the job link{" "}
            <em>relative to the container</em>.
          </p>
          <p>
            <em>Hints:</em>
          </p>
          <ul>
            <li className="liSpacing">
              If the job title and link are within the same element on the page,
              this Xpath should be "."
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
      )}
    </Paper>
  );
}

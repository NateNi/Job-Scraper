import React, { useMemo } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Box, Paper } from "@mui/material";

const descriptions = {
  url: {
    text: "The URL for the website you wish to scrape.",
    hints: [
      "Use the URL generated after searching for any keywords, applying filters, and sorting the results.",
      "Take note if the URL reflects these selections in its parameters.",
    ],
  },
  company: {
    text: "The name you wish to associate with this URL.",
  },
  container: {
    text: "The XPath to the common parent element that each job listing has on the page.",
    hints: [
      "If the job title and link are within the same element on the page, this can serve as your container.",
      {
        text: "XPath Guide",
        link: "https://www.w3schools.com/xml/xpath_syntax.asp",
      },
    ],
  },
  titleXpath: {
    text: "The XPath to the element with the job title relative to the container.",
    hints: [
      'If the job title and link are within the same element on the page, this XPath should be "."',
      {
        text: "XPath Guide",
        link: "https://www.w3schools.com/xml/xpath_syntax.asp",
      },
    ],
  },
  titleAttribute: {
    text: "The attribute of the element defined by the title XPath that contains the job title.",
    hints: [
      "This field is optional.",
      "If no entry is provided, the text of the title XPath element will be used for the job title.",
    ],
  },
  link: {
    text: "The XPath to the element with the job link relative to the container.",
    hints: [
      'If the job title and link are within the same element on the page, this XPath should be "."',
      {
        text: "XPath Guide",
        link: "https://www.w3schools.com/xml/xpath_syntax.asp",
      },
    ],
  },
  filterXpath: {
    text: "The XPath to the filter element.",
    hints: [
      {
        text: "XPath Guide",
        link: "https://www.w3schools.com/xml/xpath_syntax.asp",
      },
    ],
  },
  filterSelectValue: {
    text: "The value of the option to use in the filter select box.",
  },
};

const DescriptionCard = ({ text, hints }) => (
  <Paper
    elevation={24}
    sx={{
      padding: "3rem",
      borderRadius: "2rem",
      backgroundColor: "#3e3e42",
    }}
  >
    <Box sx={{ color: "white" }}>
      <p>{text}</p>
      {hints && (
        <>
          <p>
            <em>Hints:</em>
          </p>
          <ul>
            {hints.map((hint, index) =>
              typeof hint === "string" ? (
                <li key={index}>{hint}</li>
              ) : (
                <li key={index}>
                  <a
                    className="tooltipLink"
                    target="_blank"
                    rel="noreferrer"
                    href={hint.link}
                  >
                    {hint.text}
                  </a>
                </li>
              )
            )}
          </ul>
        </>
      )}
    </Box>
  </Paper>
);

export default function DescriptionBox({ focusedElement }) {
  const content = useMemo(() => descriptions[focusedElement], [focusedElement]);

  return <Box>{content && <DescriptionCard {...content} />}</Box>;
}

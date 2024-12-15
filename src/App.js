import React, { useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

function App() {
  //const [currentTime, setCurrentTime] = useState(0);

  // useEffect(() => {
  //   fetch('/time').then(res => res.json()).then(data => {
  //     setCurrentTime(data.time);
  //   });
  // }, []);


    const [isContainerInputFocused, setIsContainerInputFocused] = useState(false);
    const [isTitleInputFocused, setIsTitleInputFocused] = useState(false);
    const [isLinkInputFocused, setIsLinkInputFocused] = useState(false);

  return (
    <div className="App">
      <Container maxWidth="sm">
        <Grid container spacing={2}>
          <Grid key={1} item xs={12} md={6}>
            <div>
              <h4>Website Url</h4>
              <TextField id="outlined-basic" label="Outlined" variant="outlined" sx={{ width: 1 }} />
              <h4>Container Xpath</h4>
              <TextField 
              id="outlined-basic" 
              label="Outlined" 
              variant="outlined"
              onFocus={() => setIsContainerInputFocused(true)} 
              onBlur={() => setIsContainerInputFocused(false)}   
            />
              <h4>Title Xpath</h4>
              <TextField 
              id="outlined-basic" 
              label="Outlined" 
              variant="outlined" 
              onFocus={() => setIsTitleInputFocused(true)} 
              onBlur={() => setIsTitleInputFocused(false)}
              />
              <h4>Title Attribute</h4>
              <TextField 
              id="outlined-basic" 
              label="Outlined" 
              variant="outlined"
              onFocus={() => setIsTitleInputFocused(true)} 
              onBlur={() => setIsTitleInputFocused(false)}  />
              <h4>Link Xpath</h4>
              <TextField 
              id="outlined-basic" 
              label="Outlined" 
              variant="outlined" 
              onFocus={() => setIsLinkInputFocused(true)} 
              onBlur={() => setIsLinkInputFocused(false)}
              />
            </div>
            </Grid>
            <Grid key={2} item xs={12} md={6}>
              <Box component="section" sx={{ p: 2, border: '1px solid #ccc' }}>
                <h3>Job Results</h3>
                {[...Array(3)].map((value, index) => (
                  <Box 
                    key={value}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px',
                      border: `1px solid ${isContainerInputFocused ? 'blue' : '#ccc'}`, 
                      transition: 'border-color 0.3s ease',
                      borderRadius: '5px', 
                      marginBottom: '10px', 
                    }}
                  >
                  <h4 className={isTitleInputFocused ? 'focusedElement' : ''}>
                    Job Title
                  </h4>
                  <p className={isLinkInputFocused ? 'focusedElement' : ''}>
                    <u>Click Here</u>
                  </p>
                </Box>
                ))}
              </Box>
            </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
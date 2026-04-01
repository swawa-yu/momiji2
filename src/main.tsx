import './index.css';

import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

const momijiLight = 'hsl(12, 86.80%, 58.40%)'; // From index.css
// const momijiDark = 'rgb(200, 84, 55)'; // For later dark mode

const theme = createTheme({
  palette: {
    // mode: 'light', // Explicitly set mode if not relying on CssBaseline default
    primary: {
      main: momijiLight, // Set the main orange color
      // light: '#ff...', // MUI can often calculate these
      // dark: '#b2...',
      // contrastText: '#fff', // MUI usually calculates this too
    },
    // secondary: { // Optionally define secondary color
    //   main: '#...',
    // },
    // background: { // Optionally override default backgrounds
    //   default: '#f5f5f5',
    //   paper: '#ffffff',
    // }
  },
  // typography: { ... }, // Optionally customize fonts
  // components: { ... }, // Optionally override component styles
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

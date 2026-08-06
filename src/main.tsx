import './index.css';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { initializeSubject } from './subject';
import { loadSubjectData } from './subject/activeSubjectData';

const momijiLight = 'hsl(12, 86.80%, 58.40%)';

const theme = createTheme({
  palette: {
    primary: {
      main: momijiLight,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
let loadAttempt = 0;

function render(content: React.ReactNode) {
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {content}
      </ThemeProvider>
    </React.StrictMode>
  );
}

const renderLoadingScreen = () => {
  return <p role="status">授業データを読み込んでいます…</p>;
};

const renderErrorScreen = (error: Error, retry: () => void) => {
  return (
    <Alert severity="error">
      授業データを読み込めませんでした。{error.message}
      <Button onClick={retry} color="inherit" size="small">
        再読み込み
      </Button>
    </Alert>
  );
};

function loadAndRender(reload = false) {
  const attempt = ++loadAttempt;
  render(renderLoadingScreen());

  void loadSubjectData(reload ? 'reload' : 'default')
    .then((data) => {
      if (attempt !== loadAttempt) {
        return;
      }
      initializeSubject(data);
      render(<App />);
    })
    .catch((error: unknown) => {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error('不明なエラーが発生しました。');
      if (attempt !== loadAttempt) {
        return;
      }
      render(renderErrorScreen(normalizedError, () => loadAndRender(true)));
    });
}

render(renderLoadingScreen());
loadAndRender();

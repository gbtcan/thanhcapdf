import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { installViteErrorHandler } from './utils/fixViteConnection';

// Install error handler to fix connection issues
if (import.meta.env.DEV) {
  installViteErrorHandler();
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
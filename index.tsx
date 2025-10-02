import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: The error "File '.../App.tsx' is not a module" was caused by the content of App.tsx being invalid. With App.tsx now fixed, this import will work correctly.
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

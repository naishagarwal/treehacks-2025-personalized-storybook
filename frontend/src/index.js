import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // You can add your global styles here
import App from './App';  // Make sure this points to your main App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import React from 'react';
import './Loading.css'; // Create a CSS file for styles

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}
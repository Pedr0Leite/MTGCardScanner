import React from 'react';
import WebcamOCR from './components/WebcamOCR';
// import styles from '../styles/WebcamOCR.module.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>MTG Card Scanner</h1>
      <WebcamOCR />
    </div>
  );
}

export default App;

// src/App.js
import React from 'react';
import './App.css';
import AudioStreamer from './pages/AudioStreamer';

function App() {
  const wsUrl = 'ws://localhost:8000/ws/stream/';

  return (
      <div className="App">
        <header className="App-header">
          <p>React Audio Streamer</p>
          <AudioStreamer url={wsUrl} />
        </header>
      </div>
  );
}

export default App;

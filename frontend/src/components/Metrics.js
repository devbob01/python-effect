import React from 'react';
import './Metrics.css';

const Metrics = ({ boxes, lines, frameCount, isRecording }) => {
  return (
    <div className="metrics">
      <div>Boxes: <span className="metric-value">{boxes?.length || 0}</span></div>
      <div>Lines: <span className="metric-value">{lines?.length || 0}</span></div>
      <div>Frame: <span className="metric-value">{frameCount || 0}</span></div>
      {isRecording && (
        <div className="recording-indicator">
          🔴 Recording...
        </div>
      )}
    </div>
  );
};

export default Metrics; 
import React from 'react';
import './ConnectionStatus.css';

const ConnectionStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#4ecdc4';
      case 'connecting': return '#f093fb';
      case 'disconnected': return '#ff6b6b';
      default: return '#aaa';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected to server';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Initializing...';
    }
  };

  return (
    <div className="status" style={{ color: getStatusColor() }}>
      <span className="status-indicator" style={{ backgroundColor: getStatusColor() }}></span>
      {getStatusText()}
    </div>
  );
};

export default ConnectionStatus; 
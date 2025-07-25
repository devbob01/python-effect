import React from 'react';
import Button from './Button';

const CameraControls = ({ isStreaming, onStartCamera, onStopCamera }) => {
  return (
    <div style={{ marginBottom: '15px' }}>
      <Button
        onClick={onStartCamera}
        disabled={isStreaming}
        variant="primary"
      >
        Start Camera
      </Button>
      <Button
        onClick={onStopCamera}
        disabled={!isStreaming}
        variant="secondary"
      >
        Stop Camera
      </Button>
    </div>
  );
};

export default CameraControls; 
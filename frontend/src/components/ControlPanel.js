import React, { useState } from 'react';
import ConnectionStatus from './ConnectionStatus';
import RecordingControls from './RecordingControls';
import EffectControls from './EffectControls';
import Metrics from './Metrics';
import Button from './Button';
import './ControlPanel.css';

const ControlPanel = ({
  connectionStatus,
  isStreaming,
  isRecording,
  hasRecording,
  boxes,
  lines,
  frameCount,
  config,
  onStartRecording,
  onStopRecording,
  onDownloadVideo,
  onShareVideo,
  onConfigChange
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`controls ${isMinimized ? 'minimized' : 'expanded'}`}>
      <div className="controls-header">
        <Button
          onClick={toggleMinimized}
          variant="secondary"
          className="toggle-button"
        >
          {isMinimized ? '⬆️ Show Controls' : '⬇️ Hide Controls'}
        </Button>
      </div>

      {!isMinimized && (
        <div className="controls-content">
          <div className="config-section">
            <ConnectionStatus status={connectionStatus} />
            
            <RecordingControls
              isStreaming={isStreaming}
              isRecording={isRecording}
              hasRecording={hasRecording}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
              onDownloadVideo={onDownloadVideo}
              onShareVideo={onShareVideo}
            />
            
            <Metrics
              boxes={boxes}
              lines={lines}
              frameCount={frameCount}
              isRecording={isRecording}
            />
          </div>

          <EffectControls
            config={config}
            onConfigChange={onConfigChange}
          />
        </div>
      )}
    </div>
  );
};

export default ControlPanel; 
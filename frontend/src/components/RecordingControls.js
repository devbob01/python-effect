import React from 'react';
import Button from './Button';

const RecordingControls = ({
  isStreaming,
  isRecording,
  hasRecording,
  onStartRecording,
  onStopRecording,
  onDownloadVideo,
  onShareVideo
}) => {
  return (
    <div style={{ marginBottom: '15px' }}>
      {/* Recording Controls */}
      <div style={{ marginBottom: '10px' }}>
        {!isRecording ? (
          <Button
            onClick={onStartRecording}
            disabled={!isStreaming}
            variant="record"
          >
            🔴 Start Recording
          </Button>
        ) : (
          <Button
            onClick={onStopRecording}
            variant="stop"
          >
            ⏹️ Stop Recording
          </Button>
        )}
      </div>

      {/* Video Actions - Only show when we have a recording */}
      {hasRecording && (
        <div className="video-actions" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          padding: '10px',
          background: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <div style={{ 
            fontSize: '10px', 
            color: '#4CAF50', 
            textAlign: 'center',
            marginBottom: '5px',
            fontWeight: 'bold'
          }}>
            ✅ Video Ready!
          </div>
          
          <Button
            onClick={onShareVideo}
            variant="share"
            style={{ width: '100%', marginBottom: '5px' }}
          >
            📤 Share Video
          </Button>
          
          <Button
            onClick={onDownloadVideo}
            variant="download"
            style={{ width: '100%' }}
          >
            📥 Download Video
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecordingControls; 
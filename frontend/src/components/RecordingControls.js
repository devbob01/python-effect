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

      {/* Video Actions - Always show section but conditionally show content */}
      <div className="video-actions" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        padding: hasRecording ? '12px' : '8px',
        background: hasRecording ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: hasRecording ? '1px solid rgba(76, 175, 80, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
        minHeight: '60px',
        justifyContent: 'center'
      }}>
        {hasRecording ? (
          <>
            <div style={{ 
              fontSize: '12px', 
              color: '#4CAF50', 
              textAlign: 'center',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              ✅ Video Ready to Share!
            </div>
            
            <Button
              onClick={onShareVideo}
              variant="share"
              style={{ width: '100%', marginBottom: '6px', fontSize: '14px' }}
            >
              📤 Share Video
            </Button>
            
            <Button
              onClick={onDownloadVideo}
              variant="download"
              style={{ width: '100%', fontSize: '14px' }}
            >
              📥 Download Video
            </Button>
          </>
        ) : (
          <div style={{ 
            fontSize: '11px', 
            color: 'rgba(255, 255, 255, 0.6)', 
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {isRecording ? '🎬 Recording in progress...' : '📹 Record a video to share'}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingControls; 
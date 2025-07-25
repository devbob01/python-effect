import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ControlPanel from './components/ControlPanel';
import ShareModal from './components/ShareModal';
import { useWebSocket } from './hooks/useWebSocket';
import { useCamera } from './hooks/useCamera';
import { useRecording } from './hooks/useRecording';
import { useEffects } from './hooks/useEffects';
import './App.css';

function App() {
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Custom hooks for functionality
  const { socket, connectionStatus } = useWebSocket();
  const { 
    video, 
    canvas, 
    isStreaming, 
    error, 
    startCamera: startCameraBase, 
    stopCamera: stopCameraBase,
    setupCanvas,
    startVideoStreaming,
    stopVideoStreaming,
    videoRef,
    canvasRef
  } = useCamera();
  
  const {
    isRecording,
    recordedVideoBlob,
    convertedMP4Blob,
    startRecording,
    stopRecording,
    downloadVideo
  } = useRecording(video, canvas);
  
  const {
    config,
    updateConfig,
    renderEffect,
    boxes,
    lines,
    frameCount
  } = useEffects(socket, canvas);

  // Enhanced camera controls with streaming
  const startCamera = useCallback(async () => {
    try {
      await startCameraBase();
      // Start streaming to backend after camera is ready
      setTimeout(() => {
        if (socket) {
          startVideoStreaming(socket);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  }, [startCameraBase, socket, startVideoStreaming]);

  const stopCamera = useCallback(() => {
    stopVideoStreaming();
    stopCameraBase();
  }, [stopVideoStreaming, stopCameraBase]);

  // Auto-start camera when component mounts
  useEffect(() => {
    const autoStartCamera = async () => {
      try {
        await startCameraBase();
        // Start streaming to backend after camera is ready
        setTimeout(() => {
          if (socket) {
            startVideoStreaming(socket);
          }
        }, 1000);
      } catch (error) {
        console.error('Auto-start camera failed:', error);
      }
    };

    // Small delay to ensure hooks are ready
    const timer = setTimeout(autoStartCamera, 500);
    return () => clearTimeout(timer);
  }, [startCameraBase, socket, startVideoStreaming]); // Proper dependencies

  // Start video streaming when socket connects and camera is running
  useEffect(() => {
    if (socket && isStreaming) {
      startVideoStreaming(socket);
    }
  }, [socket, isStreaming, startVideoStreaming]);

  const handleShareVideo = useCallback(async () => {
    if (!convertedMP4Blob) {
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const fileName = `popbox-effect-${timestamp}.mp4`;

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([convertedMP4Blob], fileName, {
          type: 'video/mp4'
        });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Check out my Popbox Effect video!',
            text: 'I created this cool video with motion detection effects 🎬✨',
            files: [file]
          });
          return;
        }
      } catch (error) {
        console.error('Native sharing failed:', error);
      }
    }
    
    // Fallback: Show sharing modal
    setShowShareModal(true);
  }, [convertedMP4Blob]);

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <ControlPanel
          connectionStatus={connectionStatus}
          isStreaming={isStreaming}
          isRecording={isRecording}
          hasRecording={!!convertedMP4Blob}
          boxes={boxes}
          lines={lines}
          frameCount={frameCount}
          config={config}
          onStartRecording={() => startRecording(setupCanvas)}
          onStopRecording={stopRecording}
          onDownloadVideo={downloadVideo}
          onShareVideo={handleShareVideo}
          onConfigChange={updateConfig}
        />
        
        <VideoPlayer
          videoRef={videoRef}
          canvasRef={canvasRef}
          error={error}
          onRenderEffect={renderEffect}
        />
      </main>

      {showShareModal && (
        <ShareModal
          videoBlob={convertedMP4Blob}
          onClose={() => setShowShareModal(false)}
          onDownload={downloadVideo}
        />
      )}
    </div>
  );
}

export default App; 
import React, { useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoRef, canvasRef, error, onRenderEffect }) => {
  useEffect(() => {
    if (onRenderEffect && canvasRef.current && videoRef.current) {
      // Set up canvas dimensions when video metadata loads
      const handleLoadedMetadata = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.style.width = video.offsetWidth + 'px';
        canvas.style.height = video.offsetHeight + 'px';
      };

      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, [videoRef, canvasRef, onRenderEffect]);

  if (error) {
    return (
      <div className="video-section">
        <div className="error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="video-section">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="video"
        />
        <canvas
          ref={canvasRef}
          className="canvas-overlay"
        />
      </div>
    </div>
  );
};

export default VideoPlayer; 
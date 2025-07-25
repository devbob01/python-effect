import { useState, useRef, useCallback, useEffect } from 'react';
import { VideoStreamer } from '../utils/videoStreaming';

export const useCamera = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamerRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied or not available');
      setIsStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    // Stop video streaming to backend
    if (streamerRef.current) {
      streamerRef.current.stopStreaming();
    }

    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setError(null);
  }, []);

  const setupCanvas = useCallback(() => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.style.width = video.offsetWidth + 'px';
      canvas.style.height = video.offsetHeight + 'px';
      
      return canvas;
    }
    return null;
  }, []);

  const startVideoStreaming = useCallback((socket) => {
    if (streamerRef.current && socket && videoRef.current) {
      streamerRef.current.updateSocket(socket);
      streamerRef.current.updateVideo(videoRef.current);
      streamerRef.current.startStreaming();
    }
  }, []);

  const stopVideoStreaming = useCallback(() => {
    if (streamerRef.current) {
      streamerRef.current.stopStreaming();
    }
  }, []);

  // Initialize video streamer
  useEffect(() => {
    if (!streamerRef.current) {
      streamerRef.current = new VideoStreamer(null, null);
    }
  }, []);

  // Update streamer when video changes
  useEffect(() => {
    if (streamerRef.current && videoRef.current) {
      streamerRef.current.updateVideo(videoRef.current);
    }
  }, [isStreaming]);

  return {
    video: videoRef.current,
    canvas: canvasRef.current,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    setupCanvas,
    startVideoStreaming,
    stopVideoStreaming,
    videoRef,
    canvasRef
  };
}; 
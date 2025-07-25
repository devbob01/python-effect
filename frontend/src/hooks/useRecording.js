import { useState, useRef, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

export const useRecording = (video, canvas) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState(null);
  const [convertedMP4Blob, setConvertedMP4Blob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingCanvasRef = useRef(null);
  const recordingContextRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const ffmpegRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize FFmpeg
  useEffect(() => {
    const initFFmpeg = async () => {
      try {
        ffmpegRef.current = new FFmpeg();
        ffmpegRef.current.on('log', ({ message }) => {
          console.log('FFmpeg:', message);
        });
        console.log('FFmpeg initialized');
      } catch (error) {
        console.warn('FFmpeg initialization failed:', error);
      }
    };

    initFFmpeg();
  }, []);

  const setupRecordingCanvas = useCallback(() => {
    if (!video || !canvas) return null;

    recordingCanvasRef.current = document.createElement('canvas');
    recordingCanvasRef.current.width = video.videoWidth;
    recordingCanvasRef.current.height = video.videoHeight;
    recordingContextRef.current = recordingCanvasRef.current.getContext('2d');
    
    return recordingCanvasRef.current;
  }, [video, canvas]);

  const updateRecordingFrame = useCallback(() => {
    if (!isRecording || !recordingCanvasRef.current || !recordingContextRef.current) return;

    const ctx = recordingContextRef.current;
    
    // Draw video frame
    if (video) {
      ctx.drawImage(
        video, 
        0, 0, 
        recordingCanvasRef.current.width, 
        recordingCanvasRef.current.height
      );
    }
    
    // Draw effects overlay
    if (canvas) {
      ctx.drawImage(
        canvas,
        0, 0,
        recordingCanvasRef.current.width,
        recordingCanvasRef.current.height
      );
    }

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateRecordingFrame);
    }
  }, [isRecording, video, canvas]);

  const convertToMP4 = useCallback(async (webmBlob) => {
    try {
      if (!ffmpegRef.current) {
        throw new Error('FFmpeg not available');
      }

      if (!ffmpegRef.current.loaded) {
        await ffmpegRef.current.load();
      }
      
      // Write input file
      const inputData = new Uint8Array(await webmBlob.arrayBuffer());
      await ffmpegRef.current.writeFile('input.webm', inputData);
      
      // Convert to MP4
      await ffmpegRef.current.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '28',
        'output.mp4'
      ]);
      
      // Read output file
      const outputData = await ffmpegRef.current.readFile('output.mp4');
      const mp4Blob = new Blob([outputData], { type: 'video/mp4' });
      
      // Clean up FFmpeg files
      await ffmpegRef.current.deleteFile('input.webm');
      await ffmpegRef.current.deleteFile('output.mp4');
      
      return mp4Blob;
    } catch (error) {
      console.error('MP4 conversion failed:', error);
      throw error;
    }
  }, []);

  const startRecording = useCallback(async (setupCanvasCallback) => {
    if (!video || isRecording) return;

    try {
      const recordingCanvas = setupRecordingCanvas();
      if (!recordingCanvas) return;

      // Setup canvas if callback provided
      if (setupCanvasCallback) {
        setupCanvasCallback();
      }

      // Get recording stream from canvas
      recordingStreamRef.current = recordingCanvas.captureStream(30);
      
      // Setup MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(recordingStreamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        await finalizeRecording();
      };
      
      // Start recording
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      
      // Start recording animation loop
      updateRecordingFrame();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [video, isRecording, setupRecordingCanvas, updateRecordingFrame]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isRecording]);

  const finalizeRecording = useCallback(async () => {
    if (recordedChunksRef.current.length === 0) {
      console.error('No recording data available');
      return;
    }
    
    // Create blob from recorded chunks
    const webmBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    setRecordedVideoBlob(webmBlob);
    
    try {
      // Convert WebM to MP4 using FFmpeg
      if (ffmpegRef.current) {
        const mp4Blob = await convertToMP4(webmBlob);
        setConvertedMP4Blob(mp4Blob);
      } else {
        // Fallback to WebM if FFmpeg not available
        setConvertedMP4Blob(webmBlob);
      }
    } catch (error) {
      console.error('Video conversion failed:', error);
      setConvertedMP4Blob(webmBlob);
    }
    
    // Clean up
    recordedChunksRef.current = [];
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach(track => track.stop());
    }
  }, [convertToMP4]);

  const downloadVideo = useCallback(() => {
    if (!convertedMP4Blob) return;
    
    // Create download link
    const url = URL.createObjectURL(convertedMP4Blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const extension = ffmpegRef.current ? 'mp4' : 'webm';
    
    a.href = url;
    a.download = `popbox-effect-${timestamp}.${extension}`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [convertedMP4Blob]);

  return {
    isRecording,
    recordedVideoBlob,
    convertedMP4Blob,
    startRecording,
    stopRecording,
    downloadVideo
  };
}; 
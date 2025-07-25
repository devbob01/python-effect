export class VideoStreamer {
  constructor(socket, video) {
    this.socket = socket;
    this.video = video;
    this.isStreaming = false;
    this.streamInterval = null;
    this.tempCanvas = null;
    this.tempContext = null;
  }

  setupCanvas() {
    if (!this.tempCanvas) {
      this.tempCanvas = document.createElement('canvas');
      this.tempContext = this.tempCanvas.getContext('2d');
    }
  }

  startStreaming() {
    if (this.isStreaming || !this.socket || !this.video) return;

    this.setupCanvas();
    this.isStreaming = true;

    // Send frames every 100ms (10 FPS) to backend for processing
    this.streamInterval = setInterval(() => {
      if (this.isStreaming && this.video.readyState === 4) {
        this.captureAndSendFrame();
      }
    }, 100);
  }

  stopStreaming() {
    this.isStreaming = false;
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
  }

  captureAndSendFrame() {
    if (!this.tempCanvas || !this.tempContext || !this.video) return;

    try {
      // Set canvas dimensions to match video
      this.tempCanvas.width = this.video.videoWidth;
      this.tempCanvas.height = this.video.videoHeight;

      // Draw current video frame to canvas
      this.tempContext.drawImage(this.video, 0, 0);

      // Convert canvas to base64 image data
      const frameData = this.tempCanvas.toDataURL('image/jpeg', 0.7);

      // Send frame to backend for motion detection
      this.socket.emit('video_frame', { frame: frameData });
    } catch (error) {
      console.error('Error capturing video frame:', error);
    }
  }

  updateVideo(newVideo) {
    this.video = newVideo;
  }

  updateSocket(newSocket) {
    this.socket = newSocket;
  }
} 
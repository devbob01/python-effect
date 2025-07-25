# Popbox Effect - Real-time Video Motion Detection (React + Python)

A modern React + Python web application that creates a synchronized "popbox effect" for real-time video. The application detects movement points in your camera feed and overlays small boxes with hex codes connected by lines.

## Features

- 🎥 Real-time camera access via WebRTC
- 🔍 Motion detection using OpenCV background subtraction
- 📦 Dynamic box generation with random hex codes
- 🔗 Animated lines connecting detected movement points
- ⚡ WebSocket-based real-time communication
- 🎨 Modern React UI with glassmorphism design
- 📱 Responsive and mobile-friendly interface
- 🎬 **Video recording with effects** - Record your camera feed with popbox effects
- 📥 **Download recorded videos** - Save your recordings as MP4 files
- 🎛️ **Live configuration controls** - Adjust effects in real-time
- 🌟 **Multiple effect modes** - Popbox, Neon, Cyberpunk, Particle trails
- 🚀 **Video sharing** - Share your creations with Web Share API

## Tech Stack

- **Frontend**: React 18, Custom Hooks, Canvas API, WebRTC
- **Backend**: Python, Flask, Flask-SocketIO, OpenCV, NumPy
- **Real-time Communication**: WebSocket via Socket.IO
- **Video Processing**: FFmpeg.js for client-side MP4 conversion
- **Computer Vision**: OpenCV background subtraction and contour detection

## Prerequisites

- Python 3.7 or higher
- Node.js 16 or higher
- npm or yarn
- Webcam/camera access
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd popbox-effect
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Install React dependencies
```bash
cd frontend
npm install
cd ..
```

## Development

### For Development (React + Flask)

**Terminal 1 - Start Flask Backend:**
```bash
python app.py
```

**Terminal 2 - Start React Development Server:**
```bash
cd frontend
npm start
```

- Backend runs on: `http://localhost:8080`
- Frontend runs on: `http://localhost:3000` (with proxy to backend)

### For Production Build

**Build React frontend:**
```bash
chmod +x build-frontend.sh
./build-frontend.sh
```

**Start production server:**
```bash
python app.py
```

- Full application runs on: `http://localhost:8080`

## Usage

1. **Start the application** using one of the methods above
2. **Open your web browser** and navigate to the app URL
3. **Allow camera access** when prompted by your browser
4. **Click "Start Camera"** to begin the popbox effect
5. **Move around** in front of the camera to see motion detection boxes appear with hex codes and connecting lines
6. **Adjust settings** in real-time using the control panel
7. **Record videos** by clicking "🔴 Start Recording"
8. **Download your recordings** by clicking "📥 Download MP4" after stopping
9. **Share videos** using the "🚀 Share Video" button

## Project Structure

```
popbox-effect/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main React app
│   │   └── index.js        # React entry point
│   ├── public/             # Static assets
│   ├── package.json        # React dependencies
│   └── build/              # Production build (generated)
├── templates/              # Flask templates (fallback)
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── build-frontend.sh       # Frontend build script
└── README.md              # This file
```

## React Components

- **App.js** - Main application with state management
- **Header** - Animated title header
- **VideoPlayer** - Camera feed and canvas overlay
- **ControlPanel** - Main control interface
- **ConnectionStatus** - WebSocket connection indicator
- **CameraControls** - Start/stop camera buttons
- **RecordingControls** - Video recording interface
- **EffectControls** - Real-time effect configuration
- **ShareModal** - Video sharing options

## Custom React Hooks

- **useWebSocket** - Socket.IO connection management
- **useCamera** - Camera access and video stream
- **useRecording** - Video recording with MP4 conversion
- **useEffects** - Popbox effects rendering and configuration

## Configuration

You can adjust motion detection settings in real-time through the UI, or modify defaults in the `useEffects` hook:

```javascript
const [config, setConfig] = useState({
  sensitivity: 30,        // Motion sensitivity
  minArea: 500,          // Minimum area for detection
  maxBoxes: 10,          // Maximum number of active boxes
  boxColor: '#ffffff',   // Box color
  lineColor: '#ffffff',  // Line color
  effectMode: 'popbox',  // Effect mode
  // ... more options
});
```

## Effect Modes

1. **Popbox** - Classic boxes with hex codes
2. **Neon** - Glowing neon-style effects
3. **Cyberpunk** - Multi-layered cyberpunk aesthetic
4. **Particles** - Animated particle trails

## Browser Compatibility

- ✅ Chrome 80+ (Recommended)
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Deployment

The app is configured for deployment on Railway, Render, or similar platforms:

1. **Push to GitHub**
2. **Connect to hosting platform**
3. **The build script will automatically build React and start Flask**

## Troubleshooting

### Camera Access Issues
- Ensure you're accessing via HTTPS in production
- Grant camera permissions in your browser
- Check if other applications are using the camera

### Build Issues
- Ensure Node.js 16+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf frontend/node_modules && cd frontend && npm install`

### Performance Issues
- Close unnecessary browser tabs
- Reduce video resolution in camera settings
- Adjust motion detection sensitivity

## License

This project is open source and available under the MIT License. 
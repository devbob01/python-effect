# Popbox Effect - Real-time Video Motion Detection

A Python web application that creates a synchronized "popbox effect" for real-time video. The application detects movement points in your camera feed and overlays small boxes with hex codes connected by lines.

## Features

- 🎥 Real-time camera access via WebRTC
- 🔍 Motion detection using OpenCV background subtraction
- 📦 Dynamic box generation with random hex codes
- 🔗 Animated lines connecting detected movement points
- ⚡ WebSocket-based real-time communication
- 🎨 Modern dark UI with live metrics
- 📱 Responsive design for different screen sizes
- 🎬 **Video recording with effects** - Record your camera feed with popbox effects
- 📥 **Download recorded videos** - Save your recordings as WebM files
- 🎛️ **Live configuration controls** - Adjust effects in real-time
- 🌟 **Multiple effect modes** - Popbox, Neon, Cyberpunk, Particle trails

## Prerequisites

- Python 3.7 or higher
- Webcam/camera access
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. **Clone or download the project:**
   ```bash
   cd popbox-effect
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Start the server:**
   ```bash
   python app.py
   ```

2. **Open your web browser** and navigate to:
   ```
   http://127.0.0.1:5000
   ```

3. **Allow camera access** when prompted by your browser

4. **Click "Start Camera"** to begin the popbox effect

5. **Move around** in front of the camera to see motion detection boxes appear with hex codes and connecting lines

6. **Record videos** by clicking "🔴 Start Recording" 

7. **Download your recordings** by clicking "📥 Download Video" after stopping

## How It Works

### Backend (Python)
- **Flask** serves the web application
- **Flask-SocketIO** handles real-time WebSocket communication
- **OpenCV** processes video frames for motion detection using background subtraction
- **Motion detection algorithm** identifies movement areas and generates boxes with random hex codes
- **Line generation** creates connections between detected movement points

### Frontend (JavaScript)
- **WebRTC** accesses the camera feed
- **Canvas API** renders the popbox effect overlay
- **Socket.IO** maintains real-time connection with the backend
- **Responsive design** adapts to different screen sizes

### Motion Detection Process
1. Background subtraction identifies moving objects
2. Morphological operations clean up the detection mask
3. Contour detection finds discrete movement areas
4. Bounding boxes are generated for significant movement
5. Hex codes are randomly assigned to each box
6. Lines connect all active boxes
7. Boxes fade out over time for smooth animation

## Configuration

You can adjust the motion detection sensitivity by modifying these parameters in `app.py`:

```python
self.motion_threshold = 30      # Motion sensitivity
self.min_area = 500            # Minimum area for detection
self.max_boxes = 10            # Maximum number of active boxes
```

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Troubleshooting

### Camera Access Issues
- Ensure you're accessing the app via `http://127.0.0.1:5000` (not `localhost`)
- Grant camera permissions in your browser
- Check if other applications are using the camera

### Performance Issues
- Reduce video resolution in the frontend code
- Adjust frame sending rate (currently 10 FPS)
- Lower motion detection sensitivity

### Connection Issues
- Check that port 5000 is available
- Ensure WebSocket connections are not blocked by firewall
- Try refreshing the page to reconnect

## Technical Stack

- **Backend**: Python, Flask, Flask-SocketIO, OpenCV, NumPy
- **Frontend**: HTML5, CSS3, JavaScript, Canvas API, WebRTC
- **Real-time Communication**: WebSocket via Socket.IO
- **Computer Vision**: OpenCV background subtraction and contour detection

## License

This project is open source and available under the MIT License. 
import cv2
import numpy as np
import base64
import json
import random
import os
from flask import Flask, render_template, request, send_from_directory
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_folder='frontend/build/static')
app.config['SECRET_KEY'] = 'popbox-effect-secret'
socketio = SocketIO(app, cors_allowed_origins="*")

class PopboxEffect:
    def __init__(self):
        self.motion_threshold = 30
        self.min_area = 500
        self.boxes = []
        self.max_boxes = 10
        self.frame_count = 0
        self.fade_duration = 30
        self.confidence_threshold = 0.5
        
        # Initialize object detection
        self.setup_object_detection()
        
    def setup_object_detection(self):
        """Setup lightweight object detection using OpenCV cascades and motion analysis"""
        try:
            # Initialize HOG descriptor for person detection
            self.hog = cv2.HOGDescriptor()
            self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            
            # Face detection cascade
            face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(face_cascade_path)
            
            # Background subtractor for motion detection
            self.background_subtractor = cv2.createBackgroundSubtractorMOG2(detectShadows=True)
            
            print("✅ Lightweight object detection loaded successfully!")
            
        except Exception as e:
            print(f"⚠️ Could not load object detection: {e}")
            print("🔄 Falling back to simple motion detection...")
            self.background_subtractor = cv2.createBackgroundSubtractorMOG2(detectShadows=True)
        
    def update_config(self, config):
        """Update effect configuration from frontend"""
        self.motion_threshold = config.get('sensitivity', 30)
        self.min_area = config.get('minArea', 500)
        self.max_boxes = config.get('maxBoxes', 10)
        self.fade_duration = config.get('fadeDuration', 30)
        self.confidence_threshold = config.get('confidence', 0.5)
        
    def generate_hex_code(self):
        """Generate random hex code for boxes"""
        return ''.join([random.choice('0123456789abcdef') for _ in range(6)])
    
    def detect_objects(self, frame):
        """Detect objects using lightweight OpenCV methods"""
        height, width = frame.shape[:2]
        detected_objects = []
        
        try:
            # 1. Detect people using HOG
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            people, weights = self.hog.detectMultiScale(gray, winStride=(8,8), padding=(32,32), scale=1.05)
            
            for (x, y, w, h) in people:
                if w * h > self.min_area:  # Filter small detections
                    detected_objects.append({
                        'x': int(x + w // 2),  # Convert to Python int
                        'y': int(y + h // 2),
                        'width': int(min(w, 120)),
                        'height': int(min(h, 120)),
                        'hex_code': self.generate_hex_code(),
                        'timestamp': int(self.frame_count),
                        'object_type': 'person',
                        'confidence': float(0.8)  # Convert to Python float
                    })
            
            # 2. Detect faces
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            for (x, y, w, h) in faces:
                # Only add if not already covered by person detection
                overlap = False
                for obj in detected_objects:
                    if (abs(obj['x'] - (x + w//2)) < 60 and abs(obj['y'] - (y + h//2)) < 60):
                        overlap = True
                        break
                        
                if not overlap and w * h > 1000:  # Minimum face size
                    detected_objects.append({
                        'x': int(x + w // 2),
                        'y': int(y + h // 2),
                        'width': int(min(w + 40, 100)),  # Add padding around face
                        'height': int(min(h + 40, 100)),
                        'hex_code': self.generate_hex_code(),
                        'timestamp': int(self.frame_count),
                        'object_type': 'face',
                        'confidence': float(0.7)
                    })
            
            # 3. Detect motion for other objects
            fg_mask = self.background_subtractor.apply(frame)
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
            
            contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > self.min_area:
                    x, y, w, h = cv2.boundingRect(contour)
                    center_x, center_y = x + w // 2, y + h // 2
                    
                    # Check if this motion is not already covered by person/face detection
                    overlap = False
                    for obj in detected_objects:
                        if (abs(obj['x'] - center_x) < 80 and abs(obj['y'] - center_y) < 80):
                            overlap = True
                            break
                    
                    if not overlap:
                        # Analyze the region to determine if it's likely an object
                        roi = frame[y:y+h, x:x+w]
                        if roi.size > 0:
                            # Simple object classification based on color variance and shape
                            color_variance = np.var(roi)
                            aspect_ratio = w / h if h > 0 else 1
                            
                            # Higher variance and reasonable aspect ratio suggest an object
                            if color_variance > 300 and 0.3 < aspect_ratio < 3.0:
                                detected_objects.append({
                                    'x': int(center_x),
                                    'y': int(center_y),
                                    'width': int(min(w, 100)),
                                    'height': int(min(h, 100)),
                                    'hex_code': self.generate_hex_code(),
                                    'timestamp': int(self.frame_count),
                                    'object_type': 'object',
                                    'confidence': float(0.6)
                                })
            
        except Exception as e:
            print(f"Detection error: {e}")
            
        return detected_objects
    
    def update_boxes(self, new_points):
        """Update the list of active boxes"""
        # Add new points
        self.boxes.extend(new_points)
        
        # Remove old boxes (keep only recent ones)
        current_time = self.frame_count
        self.boxes = [box for box in self.boxes if current_time - box['timestamp'] < self.fade_duration]
        
        # Limit total number of boxes
        if len(self.boxes) > self.max_boxes:
            self.boxes = self.boxes[-self.max_boxes:]
    
    def generate_lines(self):
        """Generate lines between boxes"""
        lines = []
        for i, box1 in enumerate(self.boxes):
            for j, box2 in enumerate(self.boxes[i+1:], i+1):
                lines.append({
                    'x1': int(box1['x']),  # Ensure all values are Python int
                    'y1': int(box1['y']),
                    'x2': int(box2['x']),
                    'y2': int(box2['y'])
                })
        return lines
    
    def process_frame(self, frame_data):
        """Process incoming frame and return popbox effect data"""
        try:
            # Decode base64 image
            img_data = base64.b64decode(frame_data.split(',')[1])
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return None
            
            self.frame_count += 1
            
            # Detect objects (people, faces, objects)
            detected_objects = self.detect_objects(frame)
            
            # Update boxes
            self.update_boxes(detected_objects)
            
            # Generate lines
            lines = self.generate_lines()
            
            # Ensure all data is JSON serializable
            return {
                'boxes': self.boxes,
                'lines': lines,
                'frame_count': int(self.frame_count),
                'detected_count': int(len(detected_objects))
            }
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return None

# Initialize popbox effect
effect = PopboxEffect()

@app.route('/')
def index():
    # Serve React build
    if os.path.exists('frontend/build/index.html'):
        return send_from_directory('frontend/build', 'index.html')
    else:
        # Fallback to original template during development
        return render_template('index.html')

@app.route('/health')
def health_check():
    """Health check endpoint for Railway"""
    return {'status': 'healthy', 'message': 'Popbox Effect server is running'}, 200

@app.route('/<path:path>')
def serve_react_assets(path):
    # Serve React static assets
    if os.path.exists(f'frontend/build/{path}'):
        return send_from_directory('frontend/build', path)
    else:
        # Fallback to index.html for client-side routing
        return send_from_directory('frontend/build', 'index.html')

@socketio.on('video_frame')
def handle_video_frame(data):
    """Handle incoming video frame and emit popbox effect data"""
    result = effect.process_frame(data['frame'])
    if result:
        emit('popbox_data', result)

@socketio.on('config_update')
def handle_config_update(config):
    """Handle configuration updates from frontend"""
    effect.update_config(config)
    emit('config_applied', {'status': 'success'})

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {'msg': 'Connected to popbox effect server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Starting Popbox Effect server on port {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)

# For gunicorn
import os
if os.environ.get('RAILWAY_ENVIRONMENT'):
    # Production configuration for Railway
    app.config['DEBUG'] = False 
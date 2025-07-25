import cv2
import numpy as np
import base64
import json
import random
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
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
        self.background_subtractor = cv2.createBackgroundSubtractorMOG2(detectShadows=True)
        
    def update_config(self, config):
        """Update effect configuration from frontend"""
        self.motion_threshold = config.get('sensitivity', 30)
        self.min_area = config.get('minArea', 500)
        self.max_boxes = config.get('maxBoxes', 10)
        self.fade_duration = config.get('fadeDuration', 30)
        
    def generate_hex_code(self):
        """Generate random hex code for boxes"""
        return ''.join([random.choice('0123456789abcdef') for _ in range(6)])
    
    def detect_motion_points(self, frame):
        """Detect motion points in the frame and return box coordinates"""
        # Apply background subtraction
        fg_mask = self.background_subtractor.apply(frame)
        
        # Morphological operations to clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        motion_points = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > self.min_area:
                # Get bounding box
                x, y, w, h = cv2.boundingRect(contour)
                center_x = x + w // 2
                center_y = y + h // 2
                
                motion_points.append({
                    'x': center_x,
                    'y': center_y,
                    'width': min(w, 80),
                    'height': min(h, 80),
                    'hex_code': self.generate_hex_code(),
                    'timestamp': self.frame_count
                })
        
        return motion_points
    
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
                    'x1': box1['x'],
                    'y1': box1['y'],
                    'x2': box2['x'],
                    'y2': box2['y']
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
            
            # Detect motion points
            motion_points = self.detect_motion_points(frame)
            
            # Update boxes
            self.update_boxes(motion_points)
            
            # Generate lines
            lines = self.generate_lines()
            
            return {
                'boxes': self.boxes,
                'lines': lines,
                'frame_count': self.frame_count
            }
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return None

# Initialize popbox effect
effect = PopboxEffect()

@app.route('/')
def index():
    return render_template('index.html')

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
    socketio.run(app, host='0.0.0.0', port=port, debug=False)

# For gunicorn
import os
if os.environ.get('RAILWAY_ENVIRONMENT'):
    # Production configuration for Railway
    app.config['DEBUG'] = False 
import { useState, useCallback, useRef, useEffect } from 'react';

export const useEffects = (socket, canvas) => {
  const [config, setConfig] = useState({
    sensitivity: 30,
    minArea: 500,
    maxBoxes: 10,
    boxColor: '#ffffff',
    lineColor: '#ffffff',
    lineStyle: 'dashed',
    lineOpacity: 60,
    fadeDuration: 30,
    boxSize: 80,
    effectMode: 'popbox',
    glowIntensity: 0
  });

  const [boxes, setBoxes] = useState([]);
  const [lines, setLines] = useState([]);
  const [frameCount, setFrameCount] = useState(0);
  
  const contextRef = useRef(null);

  // Get canvas context
  useEffect(() => {
    if (canvas) {
      contextRef.current = canvas.getContext('2d');
    }
  }, [canvas]);

  // Send config updates to backend
  useEffect(() => {
    if (socket) {
      socket.emit('config_update', config);
    }
  }, [socket, config]);

  // Listen for popbox data from backend
  useEffect(() => {
    if (socket) {
      const handlePopboxData = (data) => {
        setBoxes(data.boxes || []);
        setLines(data.lines || []);
        setFrameCount(data.frame_count || 0);
      };

      socket.on('popbox_data', handlePopboxData);

      return () => {
        socket.off('popbox_data', handlePopboxData);
      };
    }
  }, [socket]);

  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);
  }, []);

  const hexToRgb = useCallback((hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {r: 255, g: 255, b: 255};
  }, []);

  const drawPopBox = useCallback((ctx, box, alpha, size, color) => {
    // Box background
    ctx.fillStyle = `rgba(50, 50, 50, ${alpha * 0.8})`;
    ctx.fillRect(box.x - size/2, box.y - size/2, size, size);
    
    // Box border
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.strokeRect(box.x - size/2, box.y - size/2, size, size);
    
    // Hex code text
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.fillText(box.hex_code, box.x, box.y);
    
    // Small corner indicator
    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
    ctx.fillRect(box.x - size/2, box.y - size/2, 8, 8);
  }, []);

  const drawNeonBox = useCallback((ctx, box, alpha, size, color) => {
    // Neon glow effect
    ctx.shadowBlur = 15 + config.glowIntensity;
    ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    
    // Outer glow
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(box.x - size/2 - 2, box.y - size/2 - 2, size + 4, size + 4);
    
    // Inner box
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x - size/2, box.y - size/2, size, size);
    
    // Hex code with glow
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.fillText(box.hex_code, box.x, box.y);
  }, [config.glowIntensity]);

  const drawCyberpunkBox = useCallback((ctx, box, alpha, size, color) => {
    // Cyberpunk style with multiple layers
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const layerAlpha = alpha * (1 - i * 0.3);
      const layerSize = size + i * 4;
      
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${layerAlpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(box.x - layerSize/2, box.y - layerSize/2, layerSize, layerSize);
    }
    
    // Corner brackets
    const cornerSize = 8;
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.lineWidth = 2;
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(box.x - size/2, box.y - size/2 + cornerSize);
    ctx.lineTo(box.x - size/2, box.y - size/2);
    ctx.lineTo(box.x - size/2 + cornerSize, box.y - size/2);
    ctx.stroke();
    
    // Hex code
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.fillText(box.hex_code, box.x, box.y);
  }, []);

  const drawParticleBox = useCallback((ctx, box, alpha, size, color) => {
    // Central box
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`;
    ctx.fillRect(box.x - size/4, box.y - size/4, size/2, size/2);
    
    // Particle trail effect
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const distance = size/2 + Math.sin(Date.now() * 0.01 + i) * 10;
      const particleX = box.x + Math.cos(angle) * distance;
      const particleY = box.y + Math.sin(angle) * distance;
      
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.6})`;
      ctx.fillRect(particleX - 2, particleY - 2, 4, 4);
    }
    
    // Hex code
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    ctx.fillText(box.hex_code, box.x, box.y);
  }, []);

  const renderEffect = useCallback(() => {
    if (!contextRef.current || !canvas) return;

    const ctx = contextRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas drawing properties
    ctx.lineWidth = 2;
    ctx.font = '12px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Apply glow effect if enabled
    if (config.glowIntensity > 0) {
      ctx.shadowBlur = config.glowIntensity;
      ctx.shadowColor = config.lineColor;
    }
    
    // Draw lines first (behind boxes)
    const lineOpacity = config.lineOpacity / 100;
    const lineColor = hexToRgb(config.lineColor);
    ctx.strokeStyle = `rgba(${lineColor.r}, ${lineColor.g}, ${lineColor.b}, ${lineOpacity})`;
    
    // Set line style
    switch(config.lineStyle) {
      case 'dashed':
        ctx.setLineDash([5, 5]);
        break;
      case 'dotted':
        ctx.setLineDash([2, 3]);
        break;
      case 'solid':
      default:
        ctx.setLineDash([]);
        break;
    }
    
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    
    // Draw boxes with hex codes
    const boxColor = hexToRgb(config.boxColor);
    
    boxes.forEach((box) => {
      const alpha = Math.max(0.3, 1 - (frameCount - box.timestamp) / config.fadeDuration);
      const effectiveBoxSize = config.boxSize;
      
      // Apply different effect modes
      switch(config.effectMode) {
        case 'neon':
          drawNeonBox(ctx, box, alpha, effectiveBoxSize, boxColor);
          break;
        case 'cyberpunk':
          drawCyberpunkBox(ctx, box, alpha, effectiveBoxSize, boxColor);
          break;
        case 'particles':
          drawParticleBox(ctx, box, alpha, effectiveBoxSize, boxColor);
          break;
        case 'popbox':
        default:
          drawPopBox(ctx, box, alpha, effectiveBoxSize, boxColor);
          break;
      }
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }, [
    canvas, 
    config, 
    boxes, 
    lines, 
    frameCount, 
    hexToRgb, 
    drawPopBox, 
    drawNeonBox, 
    drawCyberpunkBox, 
    drawParticleBox
  ]);

  // Auto-render when data changes
  useEffect(() => {
    renderEffect();
  }, [renderEffect]);

  return {
    config,
    updateConfig,
    renderEffect,
    boxes,
    lines,
    frameCount
  };
}; 
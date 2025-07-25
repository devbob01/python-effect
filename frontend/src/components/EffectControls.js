import React from 'react';
import Slider from './Slider';
import ColorPicker from './ColorPicker';
import Select from './Select';
import './EffectControls.css';

const EffectControls = ({ config, onConfigChange }) => {
  const handleChange = (key, value) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="effect-controls">
      {/* Motion Detection */}
      <div className="config-section">
        <div className="config-title">Motion Detection</div>
        
        <Slider
          label="Sensitivity"
          value={config.sensitivity}
          min={10}
          max={100}
          onChange={(value) => handleChange('sensitivity', value)}
        />
        
        <Slider
          label="Min Area"
          value={config.minArea}
          min={100}
          max={2000}
          step={50}
          suffix="px"
          onChange={(value) => handleChange('minArea', value)}
        />
        
        <Slider
          label="Max Boxes"
          value={config.maxBoxes}
          min={1}
          max={20}
          onChange={(value) => handleChange('maxBoxes', value)}
        />
      </div>

      {/* Visual Style */}
      <div className="config-section">
        <div className="config-title">Visual Style</div>
        
        <ColorPicker
          label="Box Color"
          value={config.boxColor}
          onChange={(value) => handleChange('boxColor', value)}
        />
        
        <ColorPicker
          label="Line Color"
          value={config.lineColor}
          onChange={(value) => handleChange('lineColor', value)}
        />
        
        <Select
          label="Line Style"
          value={config.lineStyle}
          options={[
            { value: 'dashed', label: 'Dashed' },
            { value: 'solid', label: 'Solid' },
            { value: 'dotted', label: 'Dotted' }
          ]}
          onChange={(value) => handleChange('lineStyle', value)}
        />
        
        <Slider
          label="Line Opacity"
          value={config.lineOpacity}
          min={10}
          max={100}
          suffix="%"
          onChange={(value) => handleChange('lineOpacity', value)}
        />
      </div>

      {/* Animation */}
      <div className="config-section">
        <div className="config-title">Animation</div>
        
        <Slider
          label="Fade Duration"
          value={config.fadeDuration}
          min={10}
          max={100}
          step={5}
          suffix=" frames"
          onChange={(value) => handleChange('fadeDuration', value)}
        />
        
        <Slider
          label="Box Size"
          value={config.boxSize}
          min={20}
          max={120}
          step={10}
          suffix="px"
          onChange={(value) => handleChange('boxSize', value)}
        />
      </div>

      {/* Effects */}
      <div className="config-section">
        <div className="config-title">Effects</div>
        
        <Select
          label="Effect Mode"
          value={config.effectMode}
          options={[
            { value: 'popbox', label: 'Popbox (Default)' },
            { value: 'neon', label: 'Neon Glow' },
            { value: 'cyberpunk', label: 'Cyberpunk' },
            { value: 'particles', label: 'Particle Trail' }
          ]}
          onChange={(value) => handleChange('effectMode', value)}
        />
        
        <Slider
          label="Glow Intensity"
          value={config.glowIntensity}
          min={0}
          max={20}
          onChange={(value) => handleChange('glowIntensity', value)}
        />
      </div>
    </div>
  );
};

export default EffectControls; 
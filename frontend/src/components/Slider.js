import React from 'react';
import './Slider.css';

const Slider = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  suffix = '', 
  onChange 
}) => {
  return (
    <div className="control-group">
      <label className="control-label">{label}</label>
      <input
        type="range"
        className="slider"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
      <div className="value-display">{value}{suffix}</div>
    </div>
  );
};

export default Slider; 
import React from 'react';
import './ColorPicker.css';

const ColorPicker = ({ label, value, onChange }) => {
  return (
    <div className="control-group">
      <label className="control-label">{label}</label>
      <input
        type="color"
        className="color-picker"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ColorPicker; 
import React from 'react';
import './Select.css';

const Select = ({ label, value, options, onChange }) => {
  return (
    <div className="control-group">
      <label className="control-label">{label}</label>
      <select
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select; 
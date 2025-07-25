import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  ...props 
}) => {
  return (
    <button
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 
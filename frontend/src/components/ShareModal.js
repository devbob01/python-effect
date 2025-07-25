import React from 'react';
import Button from './Button';
import './ShareModal.css';

const ShareModal = ({ videoBlob, onClose, onDownload }) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
      console.log('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackgroundClick}>
      <div className="modal-content">
        <h3 className="modal-title">Share Your Popbox Video</h3>
        <p className="modal-description">
          Your video is ready! Choose how you'd like to share it:
        </p>
        
        <div className="modal-buttons">
          <Button variant="download" onClick={handleCopyLink}>
            📋 Copy Video Link
          </Button>
          <Button variant="primary" onClick={onDownload}>
            📥 Download Again
          </Button>
          <Button variant="secondary" onClick={onClose}>
            ✕ Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 
import { useState } from 'react';
import './VideoModalButton.css';

const VideoModalButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div 
        className="video-btn-container" 
        onClick={handleOpen}
      >
        <span className="video-btn-icon">🍎</span>
        <span className="video-btn-message">Don't Click Me</span>
      </div>

      {isOpen && (
        <div className="video-modal-overlay" onClick={handleClose}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-close-btn" onClick={handleClose}>
              ✕
            </button>
            
            <video 
              src="/Badapple.mp4" 
              controls 
              autoPlay 
              className="video-player"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoModalButton;
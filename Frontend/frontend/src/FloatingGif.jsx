import { useState, useRef } from 'react';
import './FloatingGif.css';

const mascotData = [
  { gif: `${import.meta.env.BASE_URL}Speaki1.gif`, sound: `${import.meta.env.BASE_URL}squash.mp3` },
  { gif: `${import.meta.env.BASE_URL}Speaki2.gif`, sound: `${import.meta.env.BASE_URL}deruzibazeyo.mp3` },
];

const FloatingGif = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  
  const audioRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startPos: { x: 0, y: 0 }, mouseOffset: { x: 0, y: 0 } });

  const handleMouseDown = (e) => {
    dragRef.current.isDragging = true;
    dragRef.current.startPos = { x: e.clientX, y: e.clientY };
    dragRef.current.mouseOffset = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;
    setPosition({
      x: e.clientX - dragRef.current.mouseOffset.x,
      y: e.clientY - dragRef.current.mouseOffset.y
    });
  };

  const handleMouseUp = (e) => {
    const moved = Math.abs(e.clientX - dragRef.current.startPos.x) > 5 || 
                  Math.abs(e.clientY - dragRef.current.startPos.y) > 5;
    
    dragRef.current.isDragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    if (!moved) handleClick();
  };

  const handleClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * mascotData.length);
    } while (nextIndex === currentIndex && mascotData.length > 1);
    
    setCurrentIndex(nextIndex);
    const newAudio = new Audio(mascotData[nextIndex].sound);
    audioRef.current = newAudio;
    newAudio.play().catch((e) => console.log("Playback failed", e));
  };

  return (
    <div 
      className="floating-gif-container"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
      onMouseDown={handleMouseDown}
      title="ลากเพื่อย้ายที่ หรือคลิกเพื่อสุ่ม!"
    >
      <img src={mascotData[currentIndex].gif} alt="Mascot" className="floating-gif-image" />
    </div>
  );
};

export default FloatingGif;
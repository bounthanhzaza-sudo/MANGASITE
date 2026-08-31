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
  const dragRef = useRef({ isDragging: false, mouseOffset: { x: 0, y: 0 } });
  
  // ใช้ตัวแปรนี้เช็กชัวร์ๆ ว่ามีการขยับนิ้ว/เมาส์จริงๆ หรือเป็นการกดจิ้มธรรมดา
  const hasMovedRef = useRef(false);

  const handleStart = (clientX, clientY) => {
    dragRef.current.isDragging = true;
    hasMovedRef.current = false; // เริ่มต้นนับว่ายังไม่ได้ลาก
    dragRef.current.mouseOffset = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  };

  const handleMove = (clientX, clientY) => {
    if (!dragRef.current.isDragging) return;
    hasMovedRef.current = true; // ถ้ามีการขยับเมาส์/นิ้ว แปลว่ากำลังลากแน่นอน
    setPosition({
      x: clientX - dragRef.current.mouseOffset.x,
      y: clientY - dragRef.current.mouseOffset.y
    });
  };

  const handleEnd = () => {
    if (!dragRef.current.isDragging) return;
    
    dragRef.current.isDragging = false;

    // ถอด Event ออกเมื่อปล่อย
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchend);

    // ถ้าไม่ได้ขยับ (เป็นการกดจิ้มเฉยๆ) ให้สั่งสุ่มทำงาน!
    if (!hasMovedRef.current) {
      handleClick();
    }
  };

  // --- Mouse Events ---
  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();

  // --- Touch Events (สำหรับมือถือ) ---
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchend);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchend = () => handleEnd();

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
        top: `${position.y}px`,
        position: 'fixed',
        zIndex: 9999,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      title="ลากเพื่อย้ายที่ หรือคลิกเพื่อสุ่ม!"
    >
      <img src={mascotData[currentIndex].gif} alt="Mascot" className="floating-gif-image" style={{ pointerEvents: 'none' }} />
    </div>
  );
};

export default FloatingGif;
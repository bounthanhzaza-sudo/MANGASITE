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

  // ฟังก์ชันคำนวณตำแหน่งเริ่มต้น (รองรับทั้ง Mouse และ Touch)
  const handleStart = (clientX, clientY) => {
    dragRef.current.isDragging = true;
    dragRef.current.startPos = { x: clientX, y: clientY };
    dragRef.current.mouseOffset = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  };

  // ฟังก์ชันขณะกำลังลาก
  const handleMove = (clientX, clientY) => {
    if (!dragRef.current.isDragging) return;
    setPosition({
      x: clientX - dragRef.current.mouseOffset.x,
      y: clientY - dragRef.current.mouseOffset.y
    });
  };

  // ฟังก์ชันเมื่อปล่อยมือ/เมาส์
  const handleEnd = (clientX, clientY) => {
    if (!dragRef.current.isDragging) return;

    const moved = Math.abs(clientX - dragRef.current.startPos.x) > 5 || 
                  Math.abs(clientY - dragRef.current.startPos.y) > 5;
    
    dragRef.current.isDragging = false;

    // ถอด Event ออกเมื่อปล่อย
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchend);

    if (!moved) handleClick();
  };

  // --- Mouse Events ---
  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = (e) => handleEnd(e.clientX, e.clientY);

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

  const handleTouchend = (e) => {
    const touch = e.changedTouches[0];
    handleEnd(touch.clientX, touch.clientY);
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
        top: `${position.y}px`,
        position: 'fixed', // แนะนำให้ล็อกตำแหน่งแบบ fixed เสมอเวลาลอยบนจอ
        zIndex: 9999,
        touchAction: 'none' // ป้องกันไม่ให้จอมือถือสั่นหรือเลื่อนแปลกๆ เวลาใช้นิ้วลากมาสคอต
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
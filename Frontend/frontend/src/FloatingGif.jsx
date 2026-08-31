import { useState, useRef, useEffect } from 'react';
import './FloatingGif.css';

const mascotData = [
  { gif: `${import.meta.env.BASE_URL}Speaki1.gif`, sound: `${import.meta.env.BASE_URL}squash.mp3` },
  { gif: `${import.meta.env.BASE_URL}Speaki2.gif`, sound: `${import.meta.env.BASE_URL}deruzibazeyo.mp3` },
];

const FloatingGif = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  
  const dragRef = useRef({ isDragging: false, mouseOffset: { x: 0, y: 0 } });
  const hasMovedRef = useRef(false);

  // Preload เสียงเตรียมไว้ล่วงหน้า
  const audioRefs = useRef([]);
  useEffect(() => {
    audioRefs.current = mascotData.map((item) => new Audio(item.sound));
  }, []);

  // --- ระบบลากสำหรับ Mouse (คอมพิวเตอร์) ---
  const handleMouseDown = (e) => {
    dragRef.current.isDragging = true;
    hasMovedRef.current = false;
    dragRef.current.mouseOffset = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;
    hasMovedRef.current = true;
    setPosition({
      x: e.clientX - dragRef.current.mouseOffset.x,
      y: e.clientY - dragRef.current.mouseOffset.y
    });
  };

  const handleMouseUp = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    if (!hasMovedRef.current) {
      handleClick();
    }
  };

  // --- ระบบลากสำหรับ Touch (มือถือ) ---
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    dragRef.current.isDragging = true;
    hasMovedRef.current = false;
    dragRef.current.mouseOffset = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (!dragRef.current.isDragging) return;
    hasMovedRef.current = true;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragRef.current.mouseOffset.x,
      y: touch.clientY - dragRef.current.mouseOffset.y
    });
  };

  const handleTouchEnd = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);

    if (!hasMovedRef.current) {
      handleClick();
    }
  };

  // --- ฟังก์ชันจัดการคลิกแบบเคลียร์เสียงเก่าทิ้ง 100% ---
  const handleClick = () => {
    // 1. สั่งหยุดและรีเซ็ตเสียงทุกอันในระบบทันที ป้องกันเสียงซ้อนกัน
    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // 2. สลับรูปภาพ
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex === 0 ? 1 : 0;
      
      // 3. เล่นเฉพาะเสียงของตัวใหม่ที่ถูกสลับไป
      const newAudio = audioRefs.current[nextIndex];
      if (newAudio) {
        newAudio.play().catch((e) => console.log("Playback failed", e));
      }

      return nextIndex;
    });
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
      <img 
        src={mascotData[currentIndex].gif} 
        alt="Mascot" 
        className="floating-gif-image" 
        style={{ pointerEvents: 'none' }} 
      />
    </div>
  );
};

export default FloatingGif;
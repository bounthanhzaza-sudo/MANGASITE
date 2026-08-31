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
  const hasMovedRef = useRef(false);

  // --- ใช้ Pointer Events (รองรับทั้งคอมและมือถือโดยไม่เบิ้ล) ---
  const handlePointerDown = (e) => {
    dragRef.current.isDragging = true;
    hasMovedRef.current = false;
    dragRef.current.mouseOffset = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    // ล็อกเป้าหมายการลาก
    e.target.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    hasMovedRef.current = true; // ถ้ามีการเคลื่อนที่ แปลว่ากำลังลาก
    setPosition({
      x: e.clientX - dragRef.current.mouseOffset.x,
      y: e.clientY - dragRef.current.mouseOffset.y
    });
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;

    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (err) {}

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);

    // ถ้าไม่ได้ลาก (เป็นการจิ้มคลิกธรรมดา) ให้สุ่มทำงานรอบเดียวเป๊ะๆ
    if (!hasMovedRef.current) {
      handleClick();
    }
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
        position: 'fixed',
        zIndex: 9999,
        touchAction: 'none' // ป้องกันหน้าจอเลื่อนเวลาเอานิ้วลากมาสคอต
      }}
      onPointerDown={handlePointerDown}
      title="ลากเพื่อย้ายที่ หรือคลิกเพื่อสุ่ม!"
    >
      <img src={mascotData[currentIndex].gif} alt="Mascot" className="floating-gif-image" style={{ pointerEvents: 'none' }} />
    </div>
  );
};

export default FloatingGif;
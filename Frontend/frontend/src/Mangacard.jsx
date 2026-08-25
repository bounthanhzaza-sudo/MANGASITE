import React from 'react';
import './MangaCard.css';

const PLACEHOLDER_IMAGE = 'https://placehold.co/300x400/1f2937/ffffff?text=No+Image';

const MangaCard = ({ id, rank, title, category, coverUrl, onDelete }) => {
  // ตรวจสอบสถานะ Admin จาก localStorage
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleDeleteClick = async (e) => {
    e.stopPropagation(); // ป้องกันไม่ให้กดปุ่มแล้วเด้งไปหน้าอื่น
    if (window.confirm(`คุณต้องการลบเรื่อง "${title}" ใช่หรือไม่?`)) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/manga/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          if (onDelete) onDelete(id); // แจ้งหน้าหลักให้นำการ์ดนี้ออกทันที
        } else {
          alert('เกิดข้อผิดพลาดในการลบมังงะ');
        }
      } catch (err) {
        console.error('Error deleting manga:', err);
      }
    }
  };

  return (
    <div className="manga-card relative group">
      <img
        src={coverUrl || PLACEHOLDER_IMAGE}
        alt={title}
        className="manga-card-image"
        onError={(event) => {
          event.currentTarget.src = PLACEHOLDER_IMAGE;
        }}
      />
      
      {/* ปุ่มลบ (แสดงเฉพาะเมื่อเป็น Admin และเอาเมาส์ชี้ที่การ์ด) */}
      {isAdmin && (
        <button 
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg cursor-pointer"
          title="ลบมังงะ"
        >
          &times;
        </button>
      )}

      {rank && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          #{rank}
        </div>
      )}
      <div className="manga-card-overlay">
        <div className="manga-card-info">
          {category && (
            <span className="bg-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full mb-1 inline-block line-clamp-1">
              {category}
            </span>
          )}
          <h3 className="text-white font-bold text-md line-clamp-1">{title}</h3>
        </div>
      </div>
    </div>
  );
};

export default MangaCard;
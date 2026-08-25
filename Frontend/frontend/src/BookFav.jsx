import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import './BookFav.css'; // เรียกใช้งานไฟล์ CSS ที่ชื่อตรงกัน

const BookFav = () => {
  const [favoriteManga, setFavoriteManga] = useState([]);

  // 1. ดึงข้อมูลมังงะโปรดจาก localStorage เมื่อเปิดหน้านี้
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoriteMangas')) || [];
    setFavoriteManga(savedFavs);
  }, []);

  // 2. ฟังก์ชันลบมังงะออกจากรายการโปรด พร้อมอัปเดต localStorage
  const removeFavorite = (id) => {
    const updatedFavs = favoriteManga.filter(manga => String(manga.id) !== String(id));
    setFavoriteManga(updatedFavs);
    localStorage.setItem('favoriteMangas', JSON.stringify(updatedFavs));
  };

  return (
    <div className="bookfav-container">
      <div className="bookfav-header">
        <h1 className="bookfav-title">
          <Bookmark className="inline-block mr-2 text-purple-500" size={28} />
          My Bookmarks & Favorites
        </h1>
        <p className="bookfav-subtitle">รวมมังงะเรื่องโปรดที่คุณบันทึกไว้ อ่านต่อได้ทันที</p>
      </div>

      {favoriteManga.length === 0 ? (
        <div className="bookfav-empty">
          <p>ยังไม่มีมังงะในรายการโปรดของคุณ</p>
          <Link to="/" className="back-home-btn">กลับไปหน้าแรกเพื่อเลือกมังงะ</Link>
        </div>
      ) : (
        <div className="bookfav-grid">
          {favoriteManga.map((manga) => (
            <div key={manga.id} className="manga-card">
              <div className="manga-img-wrapper">
                <img src={manga.cover} alt={manga.title} />
                <span className="chapter-badge">{manga.totalChapter || '0 Chapters'}</span>
              </div>
              
              <div className="manga-info">
                <h3 className="manga-name">{manga.title}</h3>
                
                <div className="manga-actions">
                  <Link to={`/manga/${manga.id}`} className="read-btn">
                    <ExternalLink size={16} /> อ่านต่อ
                  </Link>
                  <button 
                    onClick={() => removeFavorite(manga.id)} 
                    className="remove-btn"
                    title="ลบออกจากรายการโปรด"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookFav;
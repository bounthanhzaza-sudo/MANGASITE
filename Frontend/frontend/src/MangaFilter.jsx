import React, { useState, useEffect } from 'react';
import './MangaFilter.css'; // นำเข้าไฟล์ CSS ที่สร้างขึ้น

// กำหนด Base URL: ดึงจากค่า Environment Variable ของ Vite หรือใช้ค่า Railway เป็นค่าสำรอง
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cheerful-stillness-production-1be7.up.railway.app";

const MangaFilter = () => {
  const [mangas, setMangas] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMangas = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE_URL}/api/manga?`;
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedGenre && selectedGenre !== 'All') params.append('genre', selectedGenre);

        const response = await fetch(url + params.toString());
        const data = await response.json();
        if (response.ok) {
          setMangas(data);
        }
      } catch (err) {
        console.error('Error fetching mangas:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchMangas();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedGenre]);

  const genres = ['All', 'Action', 'Romance', 'Fantasy', 'Comedy', 'Isekai', 'Drama'];

  return (
    <div className="manga-filter-container">
      <h2 className="manga-filter-title">Manga Library</h2>

      {/* แผงค้นหาและตัวกรอง */}
      <div className="filter-bar-card">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อเรื่อง..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="manga-search-input"
        />

        <div className="genre-buttons-group">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* ผลลัพธ์ */}
      {loading ? (
        <p className="manga-status-text">กำลังโหลดข้อมูล...</p>
      ) : mangas.length === 0 ? (
        <p className="manga-status-text">ไม่พบมังงะที่คุณค้นหา</p>
      ) : (
        <div className="manga-grid">
          {mangas.map((manga) => (
            <div key={manga.id} className="manga-card">
              <img src={manga.coverUrl} alt={manga.title} className="manga-card-img" />
              <div className="manga-card-body">
                <span className="manga-genre-badge">{manga.genre}</span>
                <h3 className="manga-card-title">{manga.title}</h3>
                <p className="manga-card-desc">{manga.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MangaFilter;
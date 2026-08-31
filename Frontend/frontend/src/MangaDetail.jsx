import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Bookmark, BookOpen, Plus, Trash2 } from 'lucide-react';
import './MangaDetail.css';

// กำหนด Base URL: ดึงจากค่า Environment Variable ของ Vite หรือใช้ค่า Railway เป็นค่าสำรอง
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cheerful-stillness-production-1be7.up.railway.app";

const MangaDetail = () => {
  const { id } = useParams(); // รับค่า ID จาก URL เช่น /manga/4
  const [mangaData, setMangaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // ตรวจสอบสถานะ Admin จาก localStorage
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const fetchMangaDetail = async () => {
    try {
      setLoading(true);
      // ดึงรายการมังงะทั้งหมดจาก Backend ผ่าน API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/manga`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch manga list');
      }

      const result = await response.json();

      // ค้นหาเรื่องที่ id ตรงกับที่ส่งมาทาง URL
      const foundManga = result.find((item) => String(item.id) === String(id));

      if (foundManga) {
        // ดัดแปลงและแปลงรูปแบบ chapters ให้แสดงผลเป็น Chapter X อย่างถูกต้อง
        let processedChapters = [];
        if (Array.isArray(foundManga.chapters)) {
          processedChapters = foundManga.chapters.map((chap, idx) => {
            const chapNum = typeof chap === 'object' && chap !== null 
              ? (chap.chapter_number || chap.title || idx + 1)
              : chap;
            
            const parsedNum = parseFloat(chapNum);
            const displayNum = !isNaN(parsedNum) && parsedNum > 0 ? parsedNum : idx + 1;

            return {
              id: (typeof chap === 'object' && chap !== null && chap.id) ? chap.id : idx + 1,
              title: `Chapter ${displayNum}`,
              date: (typeof chap === 'object' && chap !== null) ? (chap.date || '') : ''
            };
          });
        }

        // ดึง Category หลัก (เช่น Manhwa, Manga) และ Genre มารวมกันเป็น Array ของแท็ก
        const categoryTag = foundManga.category || foundManga.type || 'Manga';
        let parsedGenres = [];
        
        if (foundManga.genre) {
          parsedGenres = foundManga.genre.split(',').map(g => g.trim()).filter(Boolean);
        } else if (Array.isArray(foundManga.genres)) {
          parsedGenres = foundManga.genres;
        }

        // นำ Category มารวมไว้หน้าสุด และกรองไม่ให้ชื่อซ้ำกัน
        const combinedGenres = [categoryTag, ...parsedGenres.filter(g => g.toLowerCase() !== categoryTag.toLowerCase())];

        const formattedManga = {
          id: foundManga.id,
          title: foundManga.title,
          cover: foundManga.coverUrl || foundManga.cover_image_url || foundManga.cover,
          type: categoryTag,
          status: foundManga.status || 'Ongoing',
          rating: foundManga.rating || '9.0',
          bookmarksCount: '0 Users Bookmarked',
          published: foundManga.published || '2026',
          author: foundManga.author || 'Unknown',
          totalChapter: foundManga.totalChapter || `${processedChapters.length} Chapters`,
          serialization: foundManga.serialization || 'Local',
          genres: combinedGenres,
          chapters: processedChapters
        };

        setMangaData(formattedManga);

        // ตรวจสอบว่าเรื่องนี้เคยถูกบันทึกใน localStorage หรือยัง เพื่อเปิดสถานะปุ่ม
        const savedFavs = JSON.parse(localStorage.getItem('favoriteMangas')) || [];
        const isExist = savedFavs.some((item) => String(item.id) === String(id));
        setIsFavorite(isExist);

      } else {
        // กรณีหาไม่พบ ให้แสดงข้อมูลสำรอง
        const fallbackData = {
          id,
          title: `Manga ID: ${id}`,
          cover: '',
          status: 'Ongoing',
          type: 'Manga',
          rating: '9.0',
          genres: ['Manga', 'Action'],
          chapters: []
        };
        setMangaData(fallbackData);
      }
    } catch (error) {
      console.error('Error loading manga detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangaDetail();
  }, [id]);

  // ฟังก์ชันกดปุ่ม Favorite เพื่อบันทึกหรือลบออกจาก localStorage
  const toggleFavorite = () => {
    if (!mangaData) return;

    const savedFavs = JSON.parse(localStorage.getItem('favoriteMangas')) || [];

    if (isFavorite) {
      const updatedFavs = savedFavs.filter((item) => String(item.id) !== String(id));
      localStorage.setItem('favoriteMangas', JSON.stringify(updatedFavs));
      setIsFavorite(false);
    } else {
      const updatedFavs = [...savedFavs, mangaData];
      localStorage.setItem('favoriteMangas', JSON.stringify(updatedFavs));
      setIsFavorite(true);
    }
  };

  // ฟังก์ชันสำหรับลบตอน
  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("คุณต้องการลบตอนนี้ใช่หรือไม่?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chapter/${chapterId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // อัปเดตสเตตฝั่ง UI ทันทีโดยตัดตอนที่ถูกลบออก
        setMangaData((prev) => {
          const updatedChapters = prev.chapters.filter((chap) => chap.id !== chapterId);
          return {
            ...prev,
            chapters: updatedChapters,
            totalChapter: `${updatedChapters.length} Chapters`
          };
        });
      } else {
        alert('ไม่สามารถลบตอนได้จากเซิร์ฟเวอร์');
      }
    } catch (err) {
      console.error('Error deleting chapter:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  if (loading) {
    return <div className="text-white p-12 text-center text-xl">Loading manga details...</div>;
  }

  if (!mangaData) {
    return <div className="text-white p-12 text-center text-xl">ไม่พบข้อมูลมังงะเรื่องนี้</div>;
  }

  return (
    <div className="manga-detail-container">
      {/* ส่วนบน: ข้อมูลหลักและรายชื่อตอน */}
      <div className="manga-top-section">
        
        {/* ฝั่งซ้าย: รูปปก และปุ่มสถานะต่างๆ */}
        <div className="manga-sidebar">
          <div className="manga-cover-box">
            <img src={mangaData.cover} alt={mangaData.title} />
          </div>
          
          <div className="manga-badges">
            <span className="badge-type">{mangaData.type}</span>
            <span className="badge-status">{mangaData.status}</span>
          </div>

          <div className="manga-rating-box">
            <Star className="text-yellow-400 fill-yellow-400" size={18} />
            <span>{mangaData.rating}</span>
          </div>

          <button 
            onClick={toggleFavorite} 
            className={`favorite-main-btn ${isFavorite ? 'active' : ''}`}
          >
            <Bookmark size={18} className={isFavorite ? 'fill-current' : ''} />
            {isFavorite ? 'Bookmarked' : 'Favorite ♡'}
          </button>
          <span className="bookmark-count">{mangaData.bookmarksCount}</span>

          {/* รายละเอียดเพิ่มเติมด้านล่าง */}
          <div className="manga-meta-info">
            <div className="meta-item"><span>Published</span> <p>{mangaData.published}</p></div>
            <div className="meta-item"><span>Author</span> <p>{mangaData.author}</p></div>
            <div className="meta-item"><span>Total Chapter</span> <p>{mangaData.totalChapter}</p></div>
            <div className="meta-item"><span>Serialization</span> <p>{mangaData.serialization}</p></div>
          </div>
        </div>

        {/* ฝั่งขวา: ชื่อเรื่อง, แท็กแนว และ Chapter List */}
        <div className="manga-main-content">
          <h1 className="manga-title">{mangaData.title}</h1>

          {/* แท็กหมวดหมู่รวม Category และ Genres ทั้งหมด */}
          <div className="genre-tags">
            {mangaData.genres && mangaData.genres.map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>

          {/* กล่องรายชื่อตอน (Chapter List) */}
          <div className="chapter-section">
            <div className="flex justify-between items-center mb-4">
              <h2 className="chapter-section-title m-0">Chapter List</h2>
              
              {/* ปุ่มเพิ่มตอนใหม่ (แสดงเฉพาะ Admin) */}
              {isAdmin && (
                <Link 
                  to={`/manga/${id}/add-chapter`} 
                  className="add-chapter-btn flex items-center gap-1"
                >
                  <Plus size={16} /> Add Chapter
                </Link>
              )}
            </div>
            
            <div className="chapter-list-container">
              {mangaData.chapters && mangaData.chapters.length > 0 ? (
                mangaData.chapters.map((chap) => (
                  <div key={chap.id} className="chapter-item flex justify-between items-center">
                    {/* ลิงก์กดเข้าไปอ่านตอน */}
                    <Link to={`/read/${chap.id}`} className="chapter-left flex items-center gap-2 flex-1" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                      <BookOpen size={18} className="text-gray-400" />
                      <span>{chap.title}</span>
                    </Link>

                    {/* ฝั่งขวา: วันที่ และปุ่มลบ (ปุ่มลบแสดงเฉพาะ Admin) */}
                    <div className="flex items-center gap-4">
                      <span className="chapter-date">{chap.date}</span>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteChapter(chap.id);
                          }}
                          className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer p-1 transition"
                          title="ลบตอนนี้"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-400 text-center">ยังไม่มีรายชื่อตอนในขณะนี้</div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default MangaDetail;
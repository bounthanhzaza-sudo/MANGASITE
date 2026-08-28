import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './ReadManga.css';

// กำหนด Base URL: ดึงจากค่า Environment Variable ของ Vite หรือใช้ค่า Railway เป็นค่าสำรอง
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://mangasite-production.up.railway.app";

const ReadManga = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  
  const [chapterData, setChapterData] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapterContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/chapter/${chapterId}`);
        if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลตอนนี้ได้');

        const data = await response.json();
        setChapterData(data);

        const chapListRes = await fetch(`${API_BASE_URL}/api/manga/${data.manga_id}/chapters`);
        if (chapListRes.ok) {
          const chapListData = await chapListRes.json();
          setAllChapters(chapListData);
        }

      } catch (err) {
        console.error('Error loading chapter:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterContent();
    window.scrollTo(0, 0);
  }, [chapterId]);

  // ค้นหา Index ของตอนปัจจุบันเพื่อเชื่อมโยงปุ่ม ตอนก่อนหน้า / ตอนต่อไป
  const currentIndex = allChapters.findIndex(chap => String(chap.id) === String(chapterId));
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex !== -1 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  if (loading) {
    return <div className="text-white p-12 text-center text-xl bg-[#0b0f19] min-h-screen flex items-center justify-center">กำลังโหลดเนื้อหาตอน...</div>;
  }

  if (error || !chapterData) {
    return (
      <div className="text-white p-12 text-center text-xl bg-[#0b0f19] min-h-screen flex flex-col items-center justify-center gap-4">
        <p>เกิดข้อผิดพลาดในการโหลดตอน หรือไม่พบข้อมูล</p>
        <Link to="/" className="reader-back-btn">กลับหน้าแรก</Link>
      </div>
    );
  }

  return (
    <div className="reader-container">
      {/* แถบด้านบน (Top Bar) */}
      <div className="reader-header">
        <Link to={`/manga/${chapterData.manga_id}`} className="reader-back-btn">
          <ArrowLeft size={18} /> หน้าหลักมังงะ
        </Link>
        
        <div className="reader-header-actions">
          {/* ปุ่มย่อ: ตอนก่อนหน้า (บน) */}
          <button
            onClick={() => prevChapter && navigate(`/read/${prevChapter.id}`)}
            disabled={!prevChapter}
            className="reader-back-btn"
            title="ตอนก่อนหน้า"
          >
            <ChevronLeft size={18} />
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="chapter-title-display cursor-pointer"
          >
            <Menu size={18} /> Chapter {parseInt(chapterData.chapter_number) || 1}
          </button>

          {/* ปุ่มย่อ: ตอนต่อไป (บน) */}
          <button
            onClick={() => nextChapter && navigate(`/read/${nextChapter.id}`)}
            disabled={!nextChapter}
            className="reader-back-btn"
            title="ตอนต่อไป"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ส่วนแสดงหน้าการ์ตูน */}
      <div className="reader-pages-wrapper">
        {chapterData.pages && chapterData.pages.length > 0 ? (
          chapterData.pages.map((pageUrl, index) => (
            <img 
              key={index} 
              src={pageUrl} 
              alt={`Page ${index + 1}`} 
              className="manga-page-img"
            />
          ))
        ) : (
          <div className="text-gray-400 py-20 text-center flex flex-col items-center gap-4">
            <BookOpen size={48} />
            <p>ยังไม่มีรูปภาพหน้าการ์ตูนในตอนนี้</p>
          </div>
        )}
      </div>

      {/* --- ส่วนปุ่มเปลี่ยนตอนด้านล่างสุด (Bottom Navigation) แยกใช้คลาส CSS --- */}
      <div className="reader-bottom-nav">
        <button
          onClick={() => {
            if (prevChapter) {
              navigate(`/read/${prevChapter.id}`);
              window.scrollTo(0, 0);
            }
          }}
          disabled={!prevChapter}
          className="reader-nav-btn"
        >
          <ChevronLeft size={18} /> ตอนก่อนหน้า
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          className="reader-nav-btn"
        >
          <Menu size={18} /> เลือกตอนทั้งหมด
        </button>

        <button
          onClick={() => {
            if (nextChapter) {
              navigate(`/read/${nextChapter.id}`);
              window.scrollTo(0, 0);
            }
          }}
          disabled={!nextChapter}
          className="reader-nav-btn primary"
        >
          ตอนต่อไป <ChevronRight size={18} />
        </button>
      </div>

      {/* --- Drawer รายชื่อตอนด้านขวา --- */}
      {isModalOpen && (
        <div className="drawer-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            
            {/* หัวข้อ Drawer */}
            <div className="drawer-header">
              <h3 className="drawer-title">
                <BookOpen size={20} className="text-amber-500" /> รายชื่อตอนทั้งหมด
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="drawer-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* รายการตอน */}
            <div className="drawer-body">
              {allChapters.length > 0 ? (
                allChapters.map((chap) => {
                  const isCurrent = String(chap.id) === String(chapterId);
                  return (
                    <div 
                      key={chap.id}
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate(`/read/${chap.id}`);
                        window.scrollTo(0, 0);
                      }}
                      className={`chapter-item ${isCurrent ? 'active' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm opacity-60">#{chap.id}</span>
                        <span>Chapter {parseInt(chap.chapter_number) || 1}</span>
                      </div>
                      {isCurrent && <span className="active-badge">กำลังอ่าน</span>}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-10">ไม่พบรายชื่อตอน</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReadManga;
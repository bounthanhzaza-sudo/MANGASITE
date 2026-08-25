import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Menu, X } from 'lucide-react';
import './ReadManga.css';

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
        
        const response = await fetch(`http://127.0.0.1:5000/api/chapter/${chapterId}`);
        if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลตอนนี้ได้');

        const data = await response.json();
        setChapterData(data);

        const chapListRes = await fetch(`http://127.0.0.1:5000/api/manga/${data.manga_id}/chapters`);
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

  if (loading) {
    return <div className="text-white p-12 text-center text-xl bg-[#0b0f19] min-h-screen">กำลังโหลดเนื้อหาตอน...</div>;
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
      {/* แถบด้านบน */}
      <div className="reader-header">
        <Link to={`/manga/${chapterData.manga_id}`} className="reader-back-btn">
          <ArrowLeft size={18} /> หน้าหลักมังงะ
        </Link>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="chapter-title-display"
        >
          <Menu size={18} /> Chapter {parseInt(chapterData.chapter_number) || 1}
        </button>
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
                  const isCurrent = chap.id === chapterData.id;
                  return (
                    <div 
                      key={chap.id}
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate(`/read/${chap.id}`);
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
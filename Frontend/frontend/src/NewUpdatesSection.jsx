import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // เปลี่ยนมาใช้ useNavigate แทน Link ครอบทั้งการ์ด
import MangaCard from './Mangacard';
import './MangaSection.css';

// กำหนด Base URL: ดึงจากค่า Environment Variable ของ Vite หรือใช้ค่า Railway เป็นค่าสำรอง
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cheerful-stillness-production-1be7.up.railway.app";
const API_URL = `${API_BASE_URL}/api/manga`;

const NewUpdatesSection = () => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 36;

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch manga');
        }

        setMangas(result);
      } catch (error) {
        console.error('Error fetching new updates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, []);

  if (loading) {
    return <section className="manga-section-container text-white">Loading updates...</section>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMangas = mangas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(mangas.length / itemsPerPage);

  return (
    <section className="manga-section-container">
      <h2 className="manga-section-title">New Updates</h2>
      
      <div className="manga-scroll-wrapper">
        {currentMangas.map((manga) => (
          <div 
            key={manga.id} 
            className="manga-card-item cursor-pointer"
            onClick={() => navigate(`/manga/${manga.id}`)} // เปลี่ยนมากดคลิกที่ตัวการ์ดเพื่อไปหน้ารายละเอียดแทน
          >
            <MangaCard
              id={manga.id}
              title={manga.title}
              category={manga.category}
              coverUrl={manga.coverUrl || manga.cover_image_url}
              onDelete={(deletedId) => {
                // กรองข้อมูลออกเพื่อให้การ์ดหายไปจากหน้าจอทันทีเมื่อลบสำเร็จ
                setMangas(prev => prev.filter(m => m.id !== deletedId));
              }}
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentPage === index + 1
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewUpdatesSection;
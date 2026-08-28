import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // 1. นำเข้า Link สำหรับกดไปหน้าดีเทล
import MangaCard from './MangaCard';
import './MangaSection.css';

// กำหนด Base URL: ดึงจากค่า Environment Variable ของ Vite หรือใช้ค่า Railway เป็นค่าสำรอง
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://mangasite-production.up.railway.app";
const API_URL = `${API_BASE_URL}/api/manga`;

const TrendingSection = () => {
  const [mangas, setMangas] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch trending manga');
        }

        setMangas(result.slice(0, 6));
      } catch (error) {
        console.error('Error fetching trending manga:', error);
      }
    };

    fetchTrending();
  }, []);

  return (
    <section className="manga-section-container">
      <h2 className="manga-section-title">Trending</h2>
      
      <div className="manga-scroll-wrapper">
        {mangas.map((manga, index) => (
          /* 2. ใช้ Link ครอบเพื่อให้คลิกแล้วพุ่งไปที่หน้า /manga/:id */
          <Link to={`/manga/${manga.id}`} key={manga.id} className="no-underline">
            <div className="manga-card-item">
              <MangaCard
                rank={index + 1}
                title={manga.title}
                category={manga.category}
                coverUrl={manga.coverUrl || manga.cover_image_url}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrendingSection;
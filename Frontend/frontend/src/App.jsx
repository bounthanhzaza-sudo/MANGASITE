import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import AddMangaForm from './AddMangaForm';
import NewUpdatesSection from './NewUpdatesSection';
import TrendingSection from './TrendingSection';
import BookFav from './BookFav';
import MangaDetail from './MangaDetail';
import AddChapter from "./AddChapter";
import ReadManga from './ReadManga';
import MangaFilter from './MangaFilter';
import FloatingGif from './FloatingGif'; // นำเข้า FloatingGif
import VideoModalButton from './VideoModalButton'; // นำเข้า VideoModalButton (ปรับ Path ตามที่เก็บไฟล์จริง เช่น './components/VideoModalButton')

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={isDarkMode ? { backgroundImage: 'linear-gradient(to bottom, #111e38, #0a1128)' } : { backgroundColor: '#ffffff' }}>
      <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
 
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="space-y-8">
                <TrendingSection />
                <NewUpdatesSection />
              </div>
            } 
          />
          <Route path="/manga/:id" element={<div className="py-6"><MangaDetail /></div>} />
          <Route path="/catalog" element={<div className="py-6"><MangaFilter /></div>} />
          <Route path="/add-manga" element={<div className="py-6"><AddMangaForm /></div>} />
          <Route path="/bookmarks" element={<div className="py-6"><BookFav /></div>} />
          <Route path="/BookFav" element={<div className="py-6"><BookFav /></div>} />
          <Route path="/manga/:id/add-chapter" element={<AddChapter />} />
          <Route path="/read/:chapterId" element={<ReadManga />} />
        </Routes>
      </div>

      {/* เรียกใช้งาน FloatingGif และปุ่ม Video Modal ไว้ล่างสุดเพื่อให้แสดงทุกหน้า */}
      <FloatingGif />
      <VideoModalButton />
    </div>
  );
};

export default App;
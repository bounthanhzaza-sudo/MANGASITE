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
import FloatingGif from './FloatingGif'; 
import VideoModalButton from './VideoModalButton'; 
import Login from './Login'; 
import Signin from './Sighin'; 

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // เพิ่ม State สำหรับเก็บสถานะการเข้าสู่ระบบ
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // ตรวจสอบสถานะ Login จาก localStorage เมื่อโหลดแอปครั้งแรก
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('currentUser') !== null;
    setIsLoggedIn(loggedInStatus);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={isDarkMode ? { backgroundImage: 'linear-gradient(to bottom, #111e38, #0a1128)' } : { backgroundColor: '#ffffff' }}>
      
      {/* ส่งสถานะ isDarkMode และ setIsLoggedIn ให้ Navbar */}
      <Navbar 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn}
      />
 
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
          
          {/* ส่ง setIsLoggedIn ไปให้หน้า Login เพื่ออัปเดตสถานะเมื่อล็อกอินสำเร็จ */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </div>

      <FloatingGif />
      <VideoModalButton />
    </div>
  );
};

export default App;
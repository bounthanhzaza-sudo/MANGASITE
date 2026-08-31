import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Bookmark, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import './Navbar.css';

// กำหนด Base URL: ดึงจากค่า Environment Variable ของ Vite หรือใช้ค่า Railway เป็นค่าสำรอง
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cheerful-stillness-production-1be7.up.railway.app";

const Navbar = ({ isDarkMode, setIsDarkMode, isLoggedIn, setIsLoggedIn }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State สำหรับควบคุมการเปิด-ปิดเมนูบนมือถือ
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // ตรวจสอบสถานะ Admin จาก localStorage
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const currentUser = localStorage.getItem('currentUser');

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // ฟังก์ชันจัดการออกจากระบบ พร้อมแจ้งเตือนแบบ Toast สวยงามเข้ากับธีม
  const handleLogout = async () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentUser');
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }

    // แสดง Toast แจ้งเตือนมุมขวาบนแบบเข้ากับธีมเว็บไซต์
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#1b2f4c', // สีเข้ากับ Navbar ธีมมืด
      color: '#ffffff',      // ตัวหนังสือสีขาว
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    await Toast.fire({
      icon: 'success',
      title: 'ออกจากระบบสำเร็จ',
      iconColor: '#f59e0b' // สีไอคอนสอดคล้องกับธีม
    });

    navigate('/login');
    window.location.reload(); // รีเฟรชหน้าจอให้อัปเดตสถานะ Navbar
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsDropdownOpen(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/manga?search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (response.ok) {
          setSearchResults(data);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error('Error searching manga:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className={`navbar flex items-center justify-between px-4 sm:px-6 py-3 border-b shadow-md transition-colors duration-200 ${isDarkMode ? 'bg-[#1b2f4c] border-[#2c4a75] text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        
        {/* ฝั่งซ้าย: ปุ่ม Hamburger (มือถือ) + โลโก้ + เมนู Desktop */}
        <div className="flex items-center gap-3">
          {/* ปุ่ม Hamburger สำหรับจอมือถือ (ซ่อนบนหน้าจอคอมพิวเตอร์ md:hidden) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link to="/" className="navbar-logo no-underline text-lg sm:text-xl font-bold">
            MangaSite
          </Link>

          {/* เมนูสำหรับหน้าจอคอมพิวเตอร์ (Desktop) */}
          <div className="navbar-links hidden md:flex items-center gap-2">
            <Link to="/" className="nav-link h-10 flex items-center px-4 rounded-lg font-medium transition-colors">
              Home
            </Link>
            <Link to="/catalog" className="nav-link h-10 flex items-center px-4 rounded-lg font-medium transition-colors">
              <BookOpen className="inline-block mr-2" size={16} />
              Catalog
            </Link>
            <Link to="/BookFav" className="nav-btn h-10 flex items-center px-4 rounded-lg font-medium shadow-sm">
              <Bookmark className="inline-block mr-2 text-purple-400" size={16} />
              Book Mark
            </Link>
            
            {isAdmin && (
              <Link to="/add-manga" className="nav-btn h-10 flex items-center px-4 rounded-lg font-medium shadow-sm">
                + Add New Manga
              </Link>
            )}
          </div>
        </div>
        
        {/* ฝั่งขวาของ Navbar (Search, Login/Logout, Theme) */}
        <div className="nav-right flex items-center gap-2 sm:gap-3" ref={searchRef}>
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsDropdownOpen(true);
              }}
              className={`search-input ${isDarkMode ? 'bg-[#15253d] text-white placeholder-gray-400 border-[#2c4a75]' : 'bg-gray-100 text-gray-900 border-gray-300'} w-32 sm:w-60`}
            />

            {isDropdownOpen && searchQuery.trim() && (
              <div className={`search-dropdown ${isDarkMode ? 'bg-[#1b2f4c] border-[#2c4a75] text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                {searchResults.length > 0 ? (
                  searchResults.map((manga) => (
                    <div
                      key={manga.id || manga._id}
                      className={`search-item ${isDarkMode ? 'hover:bg-[#2c4a75] border-[#2c4a75]' : 'hover:bg-gray-50 border-gray-100'}`}
                      onClick={() => {
                        navigate(`/manga/${manga.id || manga._id}`);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <img 
                        src={manga.coverUrl || manga.image || 'https://via.placeholder.com/40x55'} 
                        alt={manga.title} 
                      />
                      <span>{manga.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="search-item" style={{ justifyContent: 'center', color: '#94a3b8', cursor: 'default' }}>
                    ไม่พบมังงะที่คุณค้นหา
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ปุ่ม Login / Logout */}
          {isLoggedIn || isAdmin || currentUser ? (
            <button onClick={handleLogout} className="auth-action-btn logout-btn cursor-pointer text-xs sm:text-sm px-2 sm:px-4">
              Logout
            </button>
          ) : (
            <Link to="/login" className="auth-action-btn login-action-btn text-xs sm:text-sm px-2 sm:px-4">
              Login
            </Link>
          )}

          {/* ปุ่มสลับโหมด Dark/Light */}
          <button 
            onClick={toggleTheme}
            className={`theme-btn p-2 rounded-lg border ${isDarkMode ? 'bg-[#15253d] text-slate-300 border-[#2c4a75] hover:bg-[#2c4a75]' : 'bg-gray-100 text-yellow-500 border-gray-300 hover:bg-gray-200'}`}
            title="Toggle Theme"
          >
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </nav>

      {/* เมนูแบบ Dropdown สำหรับมือถือ (แสดงเมื่อกดปุ่ม Hamburger) */}
      {isMobileMenuOpen && (
        <div className={`md:hidden px-4 pt-3 pb-4 space-y-2 border-b transition-colors duration-200 ${isDarkMode ? 'bg-[#1b2f4c] border-[#2c4a75] text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <Link 
            to="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium hover:bg-black/10 transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/catalog" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg font-medium hover:bg-black/10 transition-colors"
          >
            <BookOpen className="inline-block mr-2" size={16} />
            Catalog
          </Link>
          <Link 
            to="/BookFav" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center px-3 py-2 rounded-lg font-medium hover:bg-black/10 transition-colors"
          >
            <Bookmark className="inline-block mr-2 text-purple-400" size={16} />
            Book Mark
          </Link>
          
          {isAdmin && (
            <Link 
              to="/add-manga" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium hover:bg-black/10 transition-colors"
            >
              + Add New Manga
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
import { useState } from 'react';
import './AddMangaForm.css'; // นำเข้าไฟล์ CSS โทนสีทะเล

const AddMangaForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'ongoing',
    category: 'manga',
  });
  
  // เปลี่ยน genre ให้เก็บบันทึกเป็น Array เพื่อรองรับการเลือกหลายค่า
  const [selectedGenres, setSelectedGenres] = useState(['Action']);
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');

  // กำหนด Base URL: ดึงจากค่า Environment Variable ของ Vite หรือใช้ Localhost เป็นค่าสำรองเวลาเทสบนเครื่อง
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // รายการหมวดหมู่ทั้งหมดที่มีให้เลือก
  const availableGenres = ['Action', 'Romance', 'Fantasy', 'Comedy', 'Isekai', 'Drama'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // ฟังก์ชันสลับเลือก/ยกเลิกแท็กหมวดหมู่
  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        // ถ้าเลือกอยู่แล้ว และไม่ใช่ตัวสุดท้าย ให้เอาออกได้
        if (prev.length > 1) {
          return prev.filter(g => g !== genre);
        }
        return prev; // บังคับให้ต้องเลือกอย่างน้อย 1 อัน
      } else {
        // ถ้ายังไม่ได้เลือก ให้เพิ่มเข้าไป
        return [...prev, genre];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('status', formData.status);
    data.append('category', formData.category);
    
    // รวม Array ของแท็กให้เป็นข้อความคั่นด้วยจุลภาค ส่งไปหลังบ้าน
    data.append('genre', selectedGenres.join(', ')); 

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/manga/add_with_image`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Success: ${result.message}`);
        setFormData({
          title: '', 
          description: '',
          status: 'ongoing', 
          category: 'manga',
        });
        setSelectedGenres(['Action']);
        setImageFile(null);
        e.target.reset();
      } else {
        setMessage(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="ocean-form-container">
      <h2 className="ocean-form-title">
        Add New Manga
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="ocean-form-group">
          <input
            type="text" name="title" value={formData.title} onChange={handleChange}
            placeholder="Title" required
            className="ocean-input"
          />
        </div>
        
        <div className="ocean-form-group">
          <label className="block text-sm mb-1">Cover Image File:</label>
          <input
            type="file" accept="image/*" onChange={handleFileChange} required
            className="ocean-input ocean-file-input cursor-pointer"
          />
        </div>

        <div className="ocean-form-group">
          <textarea
            name="description" value={formData.description} onChange={handleChange}
            placeholder="Description" required rows="3"
            className="ocean-textarea"
          ></textarea>
        </div>

        {/* แถวตัวเลือก Status และ Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="ocean-form-group w-full">
            <label className="block text-xs text-slate-300 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="ocean-select cursor-pointer">
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="hiatus">Hiatus</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="ocean-form-group w-full">
            <label className="block text-xs text-slate-300 mb-1">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="ocean-select cursor-pointer">
              <option value="manga">Manga</option>
              <option value="manhwa">Manhwa</option>
              <option value="manhua">Manhua</option>
            </select>
          </div>
        </div>

        {/* ส่วนเลือก Genre หลายอันแบบปุ่ม Tags */}
        <div className="ocean-form-group">
          <label className="block text-sm mb-2 font-medium">Genres (Select multiple):</label>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border ${
                    isSelected 
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/50 scale-105' 
                      : 'bg-[#15253d] text-slate-300 border-[#2c4a75] hover:bg-[#1e365c]'
                  }`}
                >
                  {genre} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="ocean-submit-btn">
          Add Manga
        </button>
      </form>

      {message && (
        <p className={`ocean-message ${message.startsWith('Error') ? 'text-red-300' : 'text-emerald-300'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AddMangaForm;
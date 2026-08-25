import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import './AddChapter.css';

const AddChapter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [chapterNumber, setChapterNumber] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // เก็บเป็น Array
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    // แปลง FileList เป็น Array เพื่อให้จัดการและแสดงผลชื่อไฟล์ได้ง่ายขึ้น
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chapterNumber || selectedFiles.length === 0) {
      alert("กรุณากรอกเลขตอนและเลือกรูปภาพอย่างน้อย 1 รูป");
      return;
    }

    const formData = new FormData();
    formData.append('chapter_number', chapterNumber);
    // ส่งไฟล์จาก Array ที่เราเก็บไว้ใน State
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      setUploading(true);
      const response = await fetch(`http://127.0.0.1:5000/api/manga/${id}/add_chapter`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("เพิ่มตอนสำเร็จ!");
        navigate(`/manga/${id}`);
      } else {
        alert("เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-chapter-container">
      <h2 className="add-chapter-title">Add New Chapter</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Chapter Number</label>
          <input 
            type="text" 
            value={chapterNumber} 
            onChange={(e) => setChapterNumber(e.target.value)} 
            placeholder="เช่น 1 หรือ 2.5"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Upload Chapter Pages (เลือกได้หลายรูป)</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange}
            className="form-input"
          />
          
          {/* ส่วนแสดงรายชื่อไฟล์ที่เลือก */}
          {selectedFiles.length > 0 && (
            <div className="file-preview-list">
              <p className="file-count">เลือกแล้วทั้งหมด {selectedFiles.length} รูป:</p>
              <ul className="file-list">
                {selectedFiles.map((file, index) => (
                  <li key={index} title={file.name}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button type="submit" disabled={uploading} className="submit-btn">
          {uploading ? 'Uploading...' : 'Upload & Save Chapter'}
        </button>
      </form>
    </div>
  );
};

export default AddChapter;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from './firebase'; // ปรับ path ตามตำแหน่งไฟล์ firebase.js ของคุณ

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ล็อกอินแบบปกติ (Username / Password & Admin)
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (name.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('currentUser', JSON.stringify({ name: ADMIN_USERNAME }));
      alert('เข้าสู่ระบบสำเร็จ (ผู้ดูแลระบบ / Admin)');
      navigate('/');
      return;
    }

    const registeredUser = localStorage.getItem('registeredUser');
    if (registeredUser) {
      const userData = JSON.parse(registeredUser);
      if (userData.name === name && userData.password === password) {
        localStorage.setItem('isAdmin', 'false');
        localStorage.setItem('currentUser', JSON.stringify(userData));
        alert('เข้าสู่ระบบสำเร็จ');
        navigate('/');
        return;
      }
    }

    setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  };

  // ล็อกอินด้วย Social (Google / Facebook ของจริง)
  const handleSocialLogin = async (providerName) => {
    setError('');
    try {
      const provider = providerName === 'Google' ? googleProvider : facebookProvider;
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // บันทึกข้อมูลผู้ใช้ที่ล็อกอินผ่าน Social ลง localStorage
      localStorage.setItem('isAdmin', 'false');
      localStorage.setItem('currentUser', JSON.stringify({
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        photo: user.photoURL
      }));

      alert(`เข้าสู่ระบบสำเร็จด้วย ${providerName} (${user.displayName || user.email})`);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(`ไม่สามารถเข้าสู่ระบบด้วย ${providerName} ได้: ${err.message}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl border backdrop-blur-md transition-colors duration-200 bg-[#1b2f4c]/80 border-[#2c4a75] text-white">
        <h2 className="text-3xl font-bold text-center mb-6 text-sky-400">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 rounded-lg bg-[#15253d] border border-[#2c4a75] text-white placeholder-gray-400 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-[#15253d] border border-[#2c4a75] text-white placeholder-gray-400 focus:outline-none focus:border-sky-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition shadow-lg shadow-sky-600/30 cursor-pointer"
          >
            Login
          </button>
        </form>

        {/* เส้นคั่น */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-[#2c4a75]"></div>
          <span className="px-3 text-sm text-slate-400">or continue with</span>
          <div className="flex-grow border-t border-[#2c4a75]"></div>
        </div>

        {/* ปุ่ม Social Login ของจริง */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#15253d] border border-[#2c4a75] hover:bg-[#2c4a75]/50 text-white text-sm font-medium transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.6C3.5 19.4 7.4 23 12 23z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('Facebook')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#15253d] border border-[#2c4a75] hover:bg-[#2c4a75]/50 text-white text-sm font-medium transition cursor-pointer"
          >
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signin" className="text-sky-400 hover:underline font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
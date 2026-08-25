import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignin = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    // ตรวจสอบว่ามีข้อมูลผู้ใช้อยู่แล้วหรือยัง
    const existingUser = localStorage.getItem('registeredUser');
    if (existingUser) {
      const userData = JSON.parse(existingUser);
      if (userData.name === name) {
        setError('ชื่อนี้มีผู้ใช้งานแล้ว กรุณาใช้ชื่ออื่น');
        return;
      }
    }

    // บันทึกข้อมูลผู้ใช้ทั่วไปลงใน localStorage
    const newUser = { name, email, password };
    localStorage.setItem('registeredUser', JSON.stringify(newUser));

    alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
    navigate('/login'); // สมัครเสร็จพาไปหน้า Login
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl border backdrop-blur-md transition-colors duration-200 bg-[#1b2f4c]/80 border-[#2c4a75] text-white">
        <h2 className="text-3xl font-bold text-center mb-6 text-sky-400">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignin} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-2 rounded-lg bg-[#15253d] border border-[#2c4a75] text-white placeholder-gray-400 focus:outline-none focus:border-sky-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition shadow-lg shadow-sky-600/30 cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
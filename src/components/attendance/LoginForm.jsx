import { useState } from 'react';
import { LogIn, Eye, EyeOff, Loader2, Shield, UserCircle2 } from 'lucide-react';
import { db } from '../../data/db';

const DEMO_ACCOUNTS = [
  { label: '👷 Công nhân', id: 'NV001', pass: '123456' },
  { label: '👔 HR Admin', id: 'HR001', pass: 'admin123' },
];

export default function LoginForm({ onLogin, showToast }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Vui lòng nhập Mã NV / SĐT và mật khẩu');
      return;
    }
    setIsLoading(true);
    setError('');

    await new Promise(r => setTimeout(r, 700));

    const user = db.getUserByCredentials(identifier.trim(), password);
    if (user) {
      onLogin(user);
    } else {
      setError('Mã NV/SĐT hoặc mật khẩu không đúng');
      showToast('Đăng nhập thất bại. Kiểm tra lại thông tin.', 'error');
    }
    setIsLoading(false);
  };

  const quickLogin = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-8 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-800 flex items-center justify-center mb-4 shadow-2xl glow-teal">
          <Shield size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Đăng Nhập Chấm Công</h1>
        <p className="text-slate-400 text-sm">GPS GeoFence Attendance · AFOODS</p>
      </div>

      {/* Demo Accounts */}
      <div className="glass border border-slate-700/30 rounded-2xl p-4 mb-6">
        <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">🔑 Tài khoản Demo nhanh</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.id}
              onClick={() => quickLogin(acc.id, acc.pass)}
              className="flex flex-col items-center py-3 px-2 rounded-xl border border-slate-700 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all text-center"
            >
              <span className="text-xs font-semibold text-slate-200">{acc.label}</span>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5">{acc.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            <UserCircle2 size={12} className="inline mr-1" />
            Mã Nhân Viên / Số Điện Thoại
          </label>
          <input
            type="text"
            value={identifier}
            onChange={e => { setIdentifier(e.target.value); setError(''); }}
            placeholder="NV001 hoặc 09xxxxxxxx"
            className="input-field"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Mật Khẩu</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              className="input-field pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-xl"
          style={{ boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35)' }}
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Đang xác thực...</>
          ) : (
            <><LogIn size={18} /> Đăng Nhập</>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-6">
        Liên hệ HR để được cấp tài khoản: <span className="text-teal-500">huutho@afoods.vn</span>
      </p>
    </div>
  );
}

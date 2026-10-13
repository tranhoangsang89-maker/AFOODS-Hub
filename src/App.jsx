import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import ChatbotModule from './components/chatbot/ChatbotModule';
import AttendanceModule from './components/attendance/AttendanceModule';
import HRDashboard from './components/hr/HRDashboard';
import ParticleBackground from './components/ui/ParticleBackground';
import Toast from './components/ui/Toast';
import { db } from './data/db';

export default function App() {
  const [activeModule, setActiveModule] = useState('chatbot');
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Check for saved session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('afoods_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    sessionStorage.setItem('afoods_user', JSON.stringify(user));
    showToast(`Chào mừng, ${user.full_name}! 👋`, 'success');
    // Auto-switch to appropriate module
    if (user.role === 'HR_ADMIN') setActiveModule('hr');
    else if (user.role === 'WORKER') setActiveModule('attendance');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('afoods_user');
    setActiveModule('chatbot');
    showToast('Đã đăng xuất thành công.', 'info');
  };

  return (
    <div className="min-h-screen hero-gradient relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-hidden">
          {activeModule === 'chatbot' && (
            <ChatbotModule
              onInquirySubmit={(inquiry) => {
                const saved = db.addInquiry(inquiry);
                showToast('✅ Yêu cầu đã được ghi nhận! Chúng tôi sẽ phản hồi sớm.', 'success');
                return saved;
              }}
            />
          )}
          {activeModule === 'attendance' && (
            <AttendanceModule
              currentUser={currentUser}
              onLogin={handleLogin}
              showToast={showToast}
            />
          )}
          {activeModule === 'hr' && (
            <HRDashboard
              currentUser={currentUser}
              onLogin={handleLogin}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

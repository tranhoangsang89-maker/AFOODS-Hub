import { useState } from 'react';
import { Bot, MapPin, LayoutDashboard, Menu, X, ChevronRight, LogOut, User, Wifi, WifiOff } from 'lucide-react';

const MODULES = [
  {
    id: 'chatbot',
    label: 'Trợ Lý AI',
    labelFull: 'AI Sales & CSKH',
    icon: Bot,
    description: '24/7 Chatbot',
    color: 'text-teal-400',
    activeBg: 'from-teal-500/20 to-teal-600/10',
    activeBorder: 'border-teal-500/40',
  },
  {
    id: 'attendance',
    label: 'Chấm Công',
    labelFull: 'GPS Chấm Công',
    icon: MapPin,
    description: 'GeoFence',
    color: 'text-indigo-400',
    activeBg: 'from-indigo-500/20 to-indigo-600/10',
    activeBorder: 'border-indigo-500/40',
  },
  {
    id: 'hr',
    label: 'HR Dashboard',
    labelFull: 'Quản Trị HR',
    icon: LayoutDashboard,
    description: 'Admin',
    color: 'text-orange-400',
    activeBg: 'from-orange-500/20 to-orange-600/10',
    activeBorder: 'border-orange-500/40',
  },
];

export default function Header({ activeModule, setActiveModule, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline] = useState(navigator.onLine);

  return (
    <>
      <header className="glass-dark sticky top-0 z-50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="relative">
                <img
                  src="/logo-afoods-wbg.png"
                  alt="AFOODS Logo"
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-teal-500 to-blue-900 items-center justify-center text-white font-black text-sm">AF</div>
              </div>
              <div className="hidden sm:block">
                <img
                  src="/header-afoods.png"
                  alt="AFOODS"
                  className="h-6 sm:h-7 w-auto object-contain mb-0.5"
                />
                <div className="text-slate-400 text-[10px] leading-tight font-medium">Good food, good health · <span className="text-teal-400">afoods.vn</span></div>
              </div>
              <div className="block sm:hidden">
                <img
                  src="/header-afoods.png"
                  alt="AFOODS"
                  className="h-5 w-auto object-contain"
                />
              </div>
            </div>

            {/* Desktop Module Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/50 rounded-xl p-1 border border-slate-700/50">
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-br ${mod.activeBg} ${mod.color} border ${mod.activeBorder}`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{mod.labelFull}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Online indicator */}
              <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
                <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* User info */}
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white">
                      {currentUser.full_name?.charAt(0)}
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-200 font-medium">{currentUser.full_name?.split(' ').pop()}</div>
                      <div className="text-slate-500">{currentUser.emp_code}</div>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    title="Đăng xuất"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                  <User size={13} />
                  <span>Chưa đăng nhập</span>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg glass text-slate-300 hover:text-white transition-all"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl animate-slide-up">
            <div className="px-3 py-3 space-y-1">
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveModule(mod.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${mod.activeBg} ${mod.color} border ${mod.activeBorder}`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                    <div className="text-left flex-1">
                      <div className="font-semibold">{mod.labelFull}</div>
                      <div className="text-[11px] opacity-70">{mod.description}</div>
                    </div>
                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                );
              })}

              {currentUser && (
                <div className="border-t border-slate-700/50 pt-2 mt-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white">
                        {currentUser.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm text-slate-200 font-medium">{currentUser.full_name}</div>
                        <div className="text-xs text-slate-500">{currentUser.emp_code}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={13} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

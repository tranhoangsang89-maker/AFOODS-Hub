import { useState, useEffect } from 'react';
import {
  Users, Clock, CheckCircle, AlertTriangle, Download, RefreshCw,
  Filter, Search, TrendingUp, Calendar, Shield, FileSpreadsheet,
  ChevronLeft, ChevronRight, Loader2, Building2, MapPin, Award
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { db } from '../../data/db';
import { exportAttendanceToExcel } from '../../utils/excel';
import LoginForm from '../attendance/LoginForm';

const SHIFT_COLORS = {
  CA_NGAY: '#0d9488',
  CA_DEM: '#6366f1',
  TANG_CA: '#ea580c',
};

const SHIFT_LABELS = {
  CA_NGAY: 'Ca Ngày',
  CA_DEM: 'Ca Đêm',
  TANG_CA: 'Tăng Ca',
};

const PIE_COLORS = ['#0d9488', '#6366f1', '#ea580c'];

function StatCard({ label, value, icon: Icon, trend, color = 'teal', accent }) {
  const colors = {
    teal: { bg: 'from-teal-500/20 to-teal-600/5', border: 'border-teal-500/30', text: 'text-teal-400', icon: 'bg-teal-500/20 text-teal-400' },
    blue: { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'bg-blue-500/20 text-blue-400' },
    orange: { bg: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'bg-orange-500/20 text-orange-400' },
    green: { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'bg-emerald-500/20 text-emerald-400' },
    red: { bg: 'from-red-500/20 to-red-600/5', border: 'border-red-500/30', text: 'text-red-400', icon: 'bg-red-500/20 text-red-400' },
  };
  const c = colors[color];

  return (
    <div className={`glass rounded-2xl p-4 border ${c.border} bg-gradient-to-br ${c.bg} relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl sm:text-3xl font-black ${c.text}`}>{value}</p>
          {trend && <p className="text-slate-400 text-xs mt-1">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-semibold">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function HRDashboard({ currentUser, onLogin, showToast }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', emp_code: '', shift_type: '', status: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const isHR = currentUser?.role === 'HR_ADMIN';

  useEffect(() => {
    if (currentUser) loadData();
  }, [currentUser, filters]);

  const loadData = () => {
    const s = db.getDashboardStats();
    setStats(s);
    const l = db.getAttendanceLogs(filters);
    setLogs(l);
    setInquiries(db.getInquiries());
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 400));
    loadData();
    setIsRefreshing(false);
    showToast('Đã cập nhật số liệu mới nhất toàn nhà máy', 'success');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      const filename = exportAttendanceToExcel(logs);
      showToast(`✅ Xuất Excel thành công: ${filename}`, 'success');
    } catch (err) {
      showToast('Lỗi xuất Excel: ' + err.message, 'error');
    }
    setIsExporting(false);
  };

  const setFilter = (key) => (e) => {
    setFilters(f => ({ ...f, [key]: e.target.value }));
  };

  const paginatedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);

  // Require login
  if (!currentUser) {
    return <LoginForm onLogin={onLogin} showToast={showToast} />;
  }

  // Require HR role
  if (!isHR) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center">
          <Shield size={28} className="text-orange-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Không Có Quyền Truy Cập</h2>
        <p className="text-slate-400 text-sm text-center max-w-xs">
          Trang này chỉ dành cho HR Admin. Đăng nhập bằng tài khoản HR để xem Dashboard.
        </p>
        <div className="glass border border-orange-500/20 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-slate-400">Demo HR: <span className="text-orange-400 font-mono font-bold">HR001 / admin123</span></p>
        </div>
      </div>
    );
  }

  // Pie chart data
  const pieData = stats ? [
    { name: 'Ca Ngày', value: stats.caAngay },
    { name: 'Ca Đêm', value: stats.caDem },
    { name: 'Tăng Ca', value: stats.tangCa },
  ].filter(d => d.value > 0) : [];

  const TABS = [
    { id: 'dashboard', label: '📊 Dashboard Tổng Quan', mobile: '📊' },
    { id: 'attendance', label: `📋 Chấm Công (${stats?.checkedInToday || 0})`, mobile: '📋' },
    { id: 'inquiries', label: `📬 Khách Hàng Quốc Tế${stats?.newInquiries > 0 ? ` (${stats.newInquiries})` : ''}`, mobile: '📬' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 animate-fade-in">
      {/* HR Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">HR & Factory Dashboard</h1>
            <span className="badge-teal text-[11px] font-semibold">Quy mô 1,000+ nhân sự</span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Nhà máy AFOODS Kim Sơn · EU Code DL 422, DH 323 · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-teal-400 hover:border-teal-500/40 transition-all text-xs sm:text-sm"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Làm mới dữ liệu</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs sm:text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg"
          >
            {isExporting ? (
              <><Loader2 size={14} className="animate-spin" /> Đang xuất...</>
            ) : (
              <><FileSpreadsheet size={14} /> Xuất Excel ({logs.length})</>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 glass border border-slate-700/50 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-br from-teal-500/20 to-blue-600/10 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.mobile}</span>
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-5">
          {/* Main KPI Cards: Scaled to 1,000 personnel */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Tổng Nhân Sự"
              value={stats.totalStaff?.toLocaleString() || '1,000'}
              icon={Users}
              color="blue"
              trend={`${stats.totalWorkers || 915} Công nhân · ${stats.totalManagers || 85} Quản lý`}
            />
            <StatCard
              label="Đã Chấm Công HN"
              value={stats.checkedInToday?.toLocaleString() || '876'}
              icon={CheckCircle}
              color="green"
              trend={`${stats.attendanceRate}% hiện diện toàn nhà máy`}
            />
            <StatCard
              label="Đi Trễ Hôm Nay"
              value={stats.lateArrivals}
              icon={AlertTriangle}
              color="orange"
              trend="Ca sáng check-in > 06:00"
            />
            <StatCard
              label="Khách Hàng Quốc Tế"
              value={stats.newInquiries}
              icon={TrendingUp}
              color="teal"
              trend="Đối tác B2B mới chờ xử lý"
            />
          </div>

          {/* Shift Distribution Cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Ca Ngày (06:00 - 14:00)"
              value={stats.caAngay?.toLocaleString() || '520'}
              icon={Calendar}
              color="teal"
              trend="59.4% lực lượng hôm nay"
            />
            <StatCard
              label="Ca Đêm (22:00 - 06:00)"
              value={stats.caDem?.toLocaleString() || '245'}
              icon={Clock}
              color="blue"
              trend="28.0% công nhân ca đêm"
            />
            <StatCard
              label="Tăng Ca (14:00 - 22:00)"
              value={stats.tangCa?.toLocaleString() || '111'}
              icon={Clock}
              color="orange"
              trend="12.6% đơn hàng xuất khẩu"
            />
          </div>

          {/* GPS Geofence Compliance */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="GPS Hợp Lệ Tại Nhà Máy"
              value={stats.validGPS?.toLocaleString() || '862'}
              icon={CheckCircle}
              color="green"
              trend="Bán kính <= 200m (Ấp Đông Hoà, Kim Sơn)"
            />
            <StatCard
              label="GPS Ngoài Phạm Vi Cảnh Báo"
              value={stats.invalidGPS}
              icon={AlertTriangle}
              color="red"
              trend="Cần HR xác minh vị trí chấm công"
            />
          </div>

          {/* Department Breakdown Section */}
          <div className="glass rounded-2xl p-4 sm:p-5 border border-slate-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Building2 size={16} className="text-teal-400" />
                  Cơ Cấu Nhân Sự Theo Bộ Phận Nhà Máy (1,000 Người)
                </h3>
                <p className="text-slate-400 text-xs">
                  Phân bổ chuyên sâu: 915 công nhân 6 dây chuyền sản xuất + 85 cán bộ quản lý, QA/QC, Sales & Văn phòng
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-teal text-[11px]">91.5% Khối Sản Xuất</span>
                <span className="badge-blue text-[11px]">8.5% Khối Quản Lý</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.departmentBreakdown?.map((dept, idx) => (
                <div key={idx} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{dept.icon}</span>
                      <span className="text-slate-200 text-xs font-semibold">{dept.name}</span>
                    </div>
                    <span className="text-teal-400 font-bold text-xs">{dept.count} người</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-1.5 rounded-full"
                      style={{ width: `${dept.percent * 3.5}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500">
                    <span>{dept.type}</span>
                    <span className="font-medium text-slate-400">{dept.percent}% tổng nhân sự</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Weekly Trend Chart */}
            <div className="lg:col-span-2 glass rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm">📈 Xu Hướng Đi Làm 7 Ngày (Quy Mô 1,000 Người)</h3>
                <span className="text-[11px] text-slate-400">Trung bình ~860 lượt/ngày</span>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={stats.weeklyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 1000]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="total" name="Tổng Đi Làm" stroke="#0d9488" fill="url(#colorTotal)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="caAngay" name="Ca Ngày" stroke="#059669" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="caDem" name="Ca Đêm" stroke="#6366f1" fill="url(#colorNight)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="tangCa" name="Tăng Ca" stroke="#ea580c" strokeWidth={1.5} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="glass rounded-2xl p-4 border border-slate-700/50">
              <h3 className="font-bold text-white text-sm mb-4">🍕 Tỷ Trọng Phân Bổ Ca Hôm Nay</h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                          <span className="text-slate-400">{d.name}</span>
                        </div>
                        <span className="text-slate-200 font-semibold">{d.value?.toLocaleString()} người</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Chưa có dữ liệu hôm nay</div>
              )}
            </div>
          </div>

          {/* Bar Chart: Daily breakdown */}
          <div className="glass rounded-2xl p-4 border border-slate-700/50">
            <h3 className="font-bold text-white text-sm mb-4">📊 Số Lượng Nhân Viên Theo Ca (7 Ngày Qua)</h3>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats.weeklyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 600]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="caAngay" name="Ca Ngày" fill="#0d9488" radius={[3, 3, 0, 0]} />
                <Bar dataKey="caDem" name="Ca Đêm" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="tangCa" name="Tăng Ca" fill="#ea580c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE TAB ── */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="glass rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-teal-400" />
              <span className="text-sm font-semibold text-white">Bộ Lọc Dữ Liệu Chấm Công</span>
              <span className="ml-auto badge-blue text-[11px]">{logs.length.toLocaleString()} bản ghi tìm thấy</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={setFilter('dateFrom')}
                className="input-field text-xs py-2"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={setFilter('dateTo')}
                className="input-field text-xs py-2"
                placeholder="Đến ngày"
              />
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={filters.emp_code}
                  onChange={setFilter('emp_code')}
                  placeholder="Tìm mã NV (NV001, HR001...)"
                  className="input-field text-xs py-2 pl-7"
                />
              </div>
              <select value={filters.shift_type} onChange={setFilter('shift_type')} className="input-field text-xs py-2">
                <option value="">Tất cả ca</option>
                <option value="CA_NGAY">Ca Ngày</option>
                <option value="CA_DEM">Ca Đêm</option>
                <option value="TANG_CA">Tăng Ca</option>
              </select>
              <select value={filters.status} onChange={setFilter('status')} className="input-field text-xs py-2">
                <option value="">Tất cả vị trí GPS</option>
                <option value="VALID">GPS Hợp lệ (&lt;=200m)</option>
                <option value="INVALID">Ngoài phạm vi (&gt;200m)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-900/50">
                    {['Mã NV', 'Họ Tên', 'Bộ Phận', 'Ngày', 'Giờ Vào', 'Giờ Ra', 'Tổng (h)', 'Ca', 'Khoảng Cách', 'Trạng Thái'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="table-row-hover">
                      <td className="px-3 py-2.5 text-teal-400 font-mono text-xs font-bold">{log.emp_code}</td>
                      <td className="px-3 py-2.5 text-slate-200 whitespace-nowrap font-medium">{log.full_name}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">{log.department}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(log.check_in_time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="px-3 py-2.5 text-slate-200 text-xs tabular-nums">
                        {new Date(log.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        {log.is_late && <span className="ml-1 text-[10px] text-amber-400 font-semibold">(Trễ)</span>}
                      </td>
                      <td className="px-3 py-2.5 text-slate-200 text-xs tabular-nums">
                        {log.check_out_time
                          ? new Date(log.check_out_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                          : <span className="text-orange-400 text-[11px]">Đang làm việc</span>}
                      </td>
                      <td className="px-3 py-2.5 text-teal-300 font-bold text-xs tabular-nums">
                        {log.total_hours ? `${log.total_hours}h` : '--'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          log.shift_type === 'CA_NGAY' ? 'bg-teal-500/20 text-teal-400' :
                          log.shift_type === 'CA_DEM' ? 'bg-indigo-500/20 text-indigo-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {SHIFT_LABELS[log.shift_type]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                        {log.distance_meters}m
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          log.status === 'VALID'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {log.status === 'VALID' ? '✓ Hợp lệ' : '✗ Ngoài phạm vi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {paginatedLogs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Không có dữ liệu chấm công phù hợp</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-slate-700/30">
                <span className="text-xs text-slate-500">
                  Trang {currentPage} / {totalPages} · Tổng {logs.length.toLocaleString()} bản ghi chấm công
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                          currentPage === page
                            ? 'bg-teal-500 text-white font-bold'
                            : 'border border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── INQUIRIES TAB ── */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Yêu Cầu & Báo Giá Khách Hàng Quốc Tế</h3>
              <p className="text-slate-400 text-xs">Thu thập tự động từ AI Chatbot 24/7 (Thị trường Mỹ, EU, Nhật Bản, Trung Quốc)</p>
            </div>
            <span className="badge-blue text-xs">{inquiries.length} đối tác</span>
          </div>
          <div className="space-y-3">
            {inquiries.map(inq => (
              <div key={inq.id} className="glass rounded-2xl p-4 border border-slate-700/50 hover:border-teal-500/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {inq.buyer_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{inq.buyer_name}</span>
                        <span className={inq.status === 'NEW' ? 'badge-orange text-[10px]' : 'badge-green text-[10px]'}>
                          {inq.status === 'NEW' ? '🆕 Mới' : '✅ Đã liên hệ'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        🏢 {inq.company} · 🌍 {inq.country}
                      </div>
                      <div className="text-slate-400 text-xs">📧 {inq.email} {inq.phone && `· 📞 ${inq.phone}`}</div>
                      <div className="mt-2 glass-teal rounded-lg px-3 py-2">
                        <div className="text-teal-300 text-xs font-semibold mb-0.5">🦐 Sản phẩm quan tâm: {inq.product_interest}</div>
                        <div className="text-slate-300 text-xs">{inq.message}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-[11px] text-slate-500">
                      {new Date(inq.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {inq.status === 'NEW' && (
                      <button
                        onClick={() => {
                          db.updateInquiryStatus(inq.id, 'CONTACTED');
                          loadData();
                          showToast('Đã cập nhật trạng thái liên hệ!', 'success');
                        }}
                        className="text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                      >
                        ✓ Đã liên hệ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {inquiries.length === 0 && (
              <div className="text-center py-12 text-slate-500">Chưa có yêu cầu nào từ khách hàng</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

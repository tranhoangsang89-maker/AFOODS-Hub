// ══════════════════════════════════════════════════════════════
// AFOODS Enterprise Mock Database (localStorage-backed)
// Scale: 1,000+ Personnel (915 Workers + 85 Managers)
// Factory: Ap Dong Hoa, Xa Kim Son, Tinh Dong Thap (DL 422, DH 323)
// ══════════════════════════════════════════════════════════════

const DB_KEY = 'afoods_db';

export function getLocalDateStr(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ─── Name Generators for Realistic 1,000 Staff ────────────────
const VIET_FIRST = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const VIET_MID = ['Văn', 'Thị', 'Hữu', 'Minh', 'Quốc', 'Hoàng', 'Thanh', 'Đức', 'Ngọc', 'Kim', 'Hải', 'Đình', 'Xuân', 'Hồng'];
const VIET_LAST = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Phúc', 'Giang', 'Hoa', 'Hùng', 'Khoa', 'Linh', 'Mai', 'Nam', 'Oanh', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Uyên', 'Vinh', 'Vy', 'Yến', 'Long', 'Phát', 'Đạt', 'Lộc', 'Sang', 'Thảo', 'Trang', 'Trí', 'Hạnh', 'Kiên', 'Tú', 'Nhân', 'Nghĩa'];

function getVietName(idx) {
  const f = VIET_FIRST[idx % VIET_FIRST.length];
  const m = VIET_MID[(idx * 3 + 1) % VIET_MID.length];
  const l = VIET_LAST[(idx * 7 + 3) % VIET_LAST.length];
  return `${f} ${m} ${l}`;
}

// ─── Generate 1,000 Enterprise Staff ─────────────────────────
function generateEnterpriseUsers() {
  const users = [];
  let id = 1;

  // 1. Factory Workers: 915 workers across 6 production sections
  // Section distribution:
  // - Chế biến tôm: 260
  // - Chế biến cá: 210
  // - Sushi Neta & GTGT: 150
  // - Đóng gói & Cuộn khoai tây: 140
  // - Chế biến mực: 115
  // - Kho lạnh & IQF: 40
  const workerSections = [
    { name: 'Chế biến tôm', count: 260 },
    { name: 'Chế biến cá', count: 210 },
    { name: 'Sushi Neta & GTGT', count: 150 },
    { name: 'Đóng gói & Cuộn khoai tây', count: 140 },
    { name: 'Chế biến mực', count: 115 },
    { name: 'Kho lạnh & Cấp đông IQF', count: 40 },
  ];

  let workerSeq = 1;
  workerSections.forEach((sec) => {
    for (let i = 0; i < sec.count; i++) {
      const empCode = `NV${String(workerSeq).padStart(3, '0')}`;
      users.push({
        id: id++,
        emp_code: empCode,
        full_name: workerSeq === 1 ? 'Nguyễn Văn An' : getVietName(workerSeq),
        role: 'WORKER',
        phone: `09${String(10000000 + workerSeq).slice(1)}`,
        department: sec.name,
        password: '123456',
        created_at: '2024-01-15',
      });
      workerSeq++;
    }
  });

  // 2. Management & Office Staff: 85 personnel
  // - Ban Giám Đốc: 5 (GD001 - GD005)
  // - QA/QC & Vi sinh (HACCP/BRC): 25 (QA001 - QA025)
  // - Quản đốc & Giám sát phân xưởng: 20 (QL001 - QL020)
  // - Phòng Kinh doanh XNK & CSKH: 15 (SALES01 - SALES15)
  // - Phòng Hành chính - Nhân sự: 10 (HR001 - HR010)
  // - Phòng Kế toán - Tài chính: 10 (KT001 - KT010)
  const managementDepts = [
    { prefix: 'GD', name: 'Ban Giám Đốc', role: 'HR_ADMIN', count: 5, pass: 'admin123' },
    { prefix: 'QA', name: 'Phòng Quản lý CL (QA/QC & HACCP)', role: 'HR_ADMIN', count: 25, pass: 'admin123' },
    { prefix: 'QL', name: 'Quản đốc Phân xưởng', role: 'HR_ADMIN', count: 20, pass: 'admin123' },
    { prefix: 'SALES', name: 'Kinh doanh & CSKH Quốc tế', role: 'SALES', count: 15, pass: 'sales123' },
    { prefix: 'HR', name: 'Hành chính - Nhân sự', role: 'HR_ADMIN', count: 10, pass: 'admin123' },
    { prefix: 'KT', name: 'Tài chính - Kế toán', role: 'HR_ADMIN', count: 10, pass: 'admin123' },
  ];

  let mgmtSeq = 1;
  managementDepts.forEach((dept) => {
    for (let i = 1; i <= dept.count; i++) {
      const empCode = `${dept.prefix}${String(i).padStart(dept.prefix === 'SALES' ? 2 : 3, '0')}`;
      let fullName = getVietName(1000 + mgmtSeq);
      if (empCode === 'HR001') fullName = 'Trương Nguyệt Anh (Trưởng phòng HR)';
      if (empCode === 'HR002') fullName = 'Nguyễn Hữu Thọ (Phó phòng HR)';
      if (empCode === 'SALES01') fullName = 'Lê Thị Mỹ Duyên (Trưởng phòng XNK)';
      if (empCode === 'GD001') fullName = 'Trần Văn Hải (Tổng Giám Đốc)';

      users.push({
        id: id++,
        emp_code: empCode,
        full_name: fullName,
        role: dept.role,
        phone: `09${String(20000000 + mgmtSeq).slice(1)}`,
        department: dept.name,
        password: dept.pass,
        created_at: '2023-11-01',
      });
      mgmtSeq++;
    }
  });

  return users;
}

// ─── Generate Realistic Attendance for Enterprise Scale ───────
function generateEnterpriseAttendance(allUsers) {
  const logs = [];
  let logId = 1;

  // We generate ~876 attendance records for Today, plus records for past 6 days.
  // Today's exact distribution:
  // - 520 Ca Ngày (06:00 - 14:00)
  // - 245 Ca Đêm (22:00 - 06:00)
  // - 111 Tăng Ca (14:00 - 18:00 / 18:00 - 22:00)
  // Total checked in today = 876
  // Late arrivals in Ca Ngày = 18
  // Valid GPS = 862
  // Invalid GPS = 14

  const today = new Date();
  const dayStaff = allUsers.slice(0, 876); // 876 staff present today

  // Shift assignment for today:
  // Indices 0..519 (520 people): CA_NGAY
  // Indices 520..764 (245 people): CA_DEM
  // Indices 765..875 (111 people): TANG_CA
  dayStaff.forEach((user, idx) => {
    let shift = 'CA_NGAY';
    let checkInHour = 5;
    let checkInMin = 40 + (idx % 20); // 05:40 - 05:59
    let isLate = false;

    if (idx < 520) {
      shift = 'CA_NGAY';
      // First 18 people in day shift are late (> 06:00)
      if (idx < 18) {
        checkInHour = 6;
        checkInMin = 5 + (idx % 25); // 06:05 - 06:29
        isLate = true;
      } else {
        checkInHour = 5;
        checkInMin = 30 + ((idx * 3) % 28); // 05:30 - 05:57
      }
    } else if (idx < 765) {
      shift = 'CA_DEM';
      checkInHour = 21;
      checkInMin = 35 + ((idx * 2) % 23); // 21:35 - 21:58
    } else {
      shift = 'TANG_CA';
      checkInHour = 13;
      checkInMin = 45 + ((idx * 3) % 15); // 13:45 - 13:59
    }

    const checkIn = new Date(today);
    checkIn.setHours(checkInHour, checkInMin, 0, 0);

    // 14 people outside geofence (indices 0..13)
    const isValidGPS = idx >= 14;
    const distanceMeters = isValidGPS ? 15 + (idx % 165) : 250 + (idx * 25);

    const hoursWorked = shift === 'TANG_CA' ? 4 : 8;
    const checkOut = new Date(checkIn.getTime() + hoursWorked * 3600000);

    logs.push({
      id: logId++,
      user_id: user.id,
      emp_code: user.emp_code,
      full_name: user.full_name,
      department: user.department,
      date: getLocalDateStr(checkIn),
      check_in_time: checkIn.toISOString(),
      check_out_time: (shift === 'CA_DEM' && today.getHours() < 6) ? null : checkOut.toISOString(),
      total_hours: (shift === 'CA_DEM' && today.getHours() < 6) ? null : String(hoursWorked.toFixed(1)),
      latitude: 10.3331 + (Math.sin(idx) * 0.0006),
      longitude: 106.2700 + (Math.cos(idx) * 0.0006),
      distance_meters: distanceMeters,
      shift_type: shift,
      status: isValidGPS ? 'VALID' : 'INVALID',
      is_late: isLate,
      created_at: checkIn.toISOString(),
    });
  });

  // Past 6 days representative logs for weekly trend & historical lookups
  // Day 1 (Mon 12/10): 860
  // Day 2 (Sun 11/10): 420
  // Day 3 (Sat 10/10): 810
  // Day 4 (Fri 09/10): 892
  // Day 5 (Thu 08/10): 865
  // Day 6 (Wed 07/10): 840
  const pastDaysCounts = [
    { daysAgo: 1, total: 860, caNgay: 515, caDem: 240, tangCa: 105 },
    { daysAgo: 2, total: 420, caNgay: 250, caDem: 110, tangCa: 60 },
    { daysAgo: 3, total: 810, caNgay: 480, caDem: 220, tangCa: 110 },
    { daysAgo: 4, total: 892, caNgay: 530, caDem: 250, tangCa: 112 },
    { daysAgo: 5, total: 865, caNgay: 510, caDem: 240, tangCa: 115 },
    { daysAgo: 6, total: 840, caNgay: 490, caDem: 235, tangCa: 115 },
  ];

  pastDaysCounts.forEach((config) => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - config.daysAgo);

    // Pick subset of users
    const sampleUsers = allUsers.slice(0, config.total);
    sampleUsers.forEach((user, idx) => {
      let shift = 'CA_NGAY';
      let checkInHour = 5;
      let checkInMin = 30 + (idx % 25);

      if (idx < config.caNgay) {
        shift = 'CA_NGAY';
      } else if (idx < config.caNgay + config.caDem) {
        shift = 'CA_DEM';
        checkInHour = 21;
        checkInMin = 45;
      } else {
        shift = 'TANG_CA';
        checkInHour = 14;
        checkInMin = 0;
      }

      const checkIn = new Date(pastDate);
      checkIn.setHours(checkInHour, checkInMin, 0, 0);
      const hoursWorked = shift === 'TANG_CA' ? 4 : 8;
      const checkOut = new Date(checkIn.getTime() + hoursWorked * 3600000);
      const isValidGPS = idx % 50 !== 0; // 98% valid

      logs.push({
        id: logId++,
        user_id: user.id,
        emp_code: user.emp_code,
        full_name: user.full_name,
        department: user.department,
        date: getLocalDateStr(pastDate),
        check_in_time: checkIn.toISOString(),
        check_out_time: checkOut.toISOString(),
        total_hours: String(hoursWorked.toFixed(1)),
        latitude: 10.3331,
        longitude: 106.2700,
        distance_meters: isValidGPS ? 45 : 320,
        shift_type: shift,
        status: isValidGPS ? 'VALID' : 'INVALID',
        is_late: false,
        created_at: checkIn.toISOString(),
      });
    });
  });

  return logs;
}

function generateMockInquiries() {
  return [
    {
      id: 1,
      buyer_name: 'James Thompson',
      company: 'Pacific Foods Ltd.',
      email: 'james.t@pacificfoods.com',
      phone: '+1 415 555 0192',
      country: 'USA',
      message: 'Interested in bulk order of frozen shrimp Potato Wrapped PTO, need HACCP and FDA certificates.',
      product_interest: 'Tôm cuộn khoai tây & Tôm đông lạnh - 40ft container/tháng',
      status: 'CONTACTED',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 2,
      buyer_name: 'Tanaka Hiroshi',
      company: 'Nippon Seafood Co.',
      email: 'tanaka@nipponseafood.jp',
      phone: '+81 3 1234 5678',
      country: 'Japan',
      message: 'Looking for squid sushi, cuttlefish sushi neta. Need BRC and EU DL 422 documents.',
      product_interest: 'Sushi mực, Sushi ốc - thị trường Nhật Bản',
      status: 'NEW',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      buyer_name: 'Chen Wei',
      company: 'Guangzhou Import Corp',
      email: 'chenwei@gz-import.cn',
      phone: '+86 20 8888 7777',
      country: 'China',
      message: 'Need sea fish fillet and Money Bag seafood hargao for Chinese New Year retail chain.',
      product_interest: 'Cá biển fillet, Há cảo túi tiền - 30 tấn/tháng',
      status: 'NEW',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 4,
      buyer_name: 'Marie Dubois',
      company: 'EuroFish Belgium',
      email: 'marie@eurofish.be',
      phone: '+32 2 555 0123',
      country: 'Belgium',
      message: 'Looking for EU-certified frozen seafood supplier. DL 422 & DH 323 code confirmed.',
      product_interest: 'Tôm & Hải sản đông lạnh EU - Chứng nhận DL 422',
      status: 'CONTACTED',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];
}

// Pre-create initial enterprise data
const ENTERPRISE_USERS = generateEnterpriseUsers();
const ENTERPRISE_ATTENDANCE = generateEnterpriseAttendance(ENTERPRISE_USERS);

const DEFAULT_DATA = {
  factory_config: {
    id: 1,
    factory_name: 'Asia Foods Import Export Corp (AFOODS)',
    slogan: 'Good food, good health',
    latitude: 10.3331,
    longitude: 106.2700,
    radius_meters: 200,
    address: 'Ấp Đông Hoà, Xã Kim Sơn, Tỉnh Đồng Tháp (Ven Sông Tiền, cách TP.HCM 75km)',
    phone: '(+84) 0273 361 1994',
    email: 'info@afoods.vn',
    website: 'https://afoods.vn',
    eu_codes: 'DL 422, DH 323',
    total_area: '40,000 m²',
    facility_area: '9,000 m²',
    workforce: '1,000 nhân sự (915 công nhân, 85 cán bộ quản lý & văn phòng)',
  },
  users: ENTERPRISE_USERS,
  attendance_logs: ENTERPRISE_ATTENDANCE,
  inquiries: generateMockInquiries(),
};

// ─── Database Class ───────────────────────────────────────────
class MockDB {
  constructor() {
    this._init();
  }

  _init() {
    const stored = localStorage.getItem(DB_KEY);
    let data;
    try {
      data = stored ? JSON.parse(stored) : null;
    } catch {
      data = null;
    }

    // Auto reseed if empty or outdated small dataset (< 500 records) or missing date field
    if (!data || !data.users || data.users.length < 500 || !data.attendance_logs?.[0]?.date) {
      localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DATA));
    } else {
      // Ensure factory_config has latest accurate GPS coordinates
      data.factory_config = {
        ...data.factory_config,
        ...DEFAULT_DATA.factory_config,
        latitude: DEFAULT_DATA.factory_config.latitude,
        longitude: DEFAULT_DATA.factory_config.longitude,
      };
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }
  }

  _getData() {
    return JSON.parse(localStorage.getItem(DB_KEY));
  }

  _setData(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  // ── Factory Config ──
  getFactoryConfig() {
    return this._getData().factory_config;
  }

  updateFactoryConfig(config) {
    const data = this._getData();
    data.factory_config = { ...data.factory_config, ...config };
    this._setData(data);
    return data.factory_config;
  }

  // ── Users ──
  getUsers() {
    return this._getData().users;
  }

  getUserByCredentials(identifier, password) {
    const users = this._getData().users;
    return users.find(
      (u) =>
        (u.emp_code === identifier || u.phone === identifier) &&
        u.password === password
    ) || null;
  }

  getUserById(id) {
    return this._getData().users.find((u) => u.id === id) || null;
  }

  // ── Attendance ──
  getAttendanceLogs(filters = {}) {
    let logs = this._getData().attendance_logs;

    if (filters.date) {
      logs = logs.filter((l) => (l.date ? l.date === filters.date : l.check_in_time?.startsWith(filters.date)));
    }
    if (filters.dateFrom && filters.dateTo) {
      logs = logs.filter((l) => {
        const d = l.date || l.check_in_time?.split('T')[0];
        return d >= filters.dateFrom && d <= filters.dateTo;
      });
    }
    if (filters.emp_code) {
      logs = logs.filter((l) =>
        l.emp_code?.toLowerCase().includes(filters.emp_code.toLowerCase())
      );
    }
    if (filters.shift_type) {
      logs = logs.filter((l) => l.shift_type === filters.shift_type);
    }
    if (filters.status) {
      logs = logs.filter((l) => l.status === filters.status);
    }

    return logs.sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time));
  }

  getTodayLogs() {
    const today = getLocalDateStr(new Date());
    return this.getAttendanceLogs({ date: today });
  }

  checkIn(userId, { latitude, longitude, distance_meters, shift_type, status }) {
    const data = this._getData();
    const user = this.getUserById(userId);
    if (!user) throw new Error('Không tìm thấy nhân viên.');

    const today = getLocalDateStr(new Date());
    const existingCheckIn = data.attendance_logs.find(
      (l) => l.user_id === userId && (l.date === today || l.check_in_time?.startsWith(today)) && !l.check_out_time
    );

    if (existingCheckIn) {
      // Check out
      existingCheckIn.check_out_time = new Date().toISOString();
      const diff = new Date(existingCheckIn.check_out_time) - new Date(existingCheckIn.check_in_time);
      existingCheckIn.total_hours = (diff / 3600000).toFixed(1);
      this._setData(data);
      return { action: 'check_out', log: existingCheckIn };
    } else {
      // Check in
      const newId = Math.max(...data.attendance_logs.map((l) => l.id), 0) + 1;
      const log = {
        id: newId,
        user_id: userId,
        emp_code: user.emp_code,
        full_name: user.full_name,
        department: user.department,
        date: today,
        check_in_time: new Date().toISOString(),
        check_out_time: null,
        total_hours: null,
        latitude,
        longitude,
        distance_meters,
        shift_type: shift_type || 'CA_NGAY',
        status,
        created_at: new Date().toISOString(),
      };
      data.attendance_logs.push(log);
      this._setData(data);
      return { action: 'check_in', log };
    }
  }

  getActiveCheckIn(userId) {
    const today = new Date().toISOString().split('T')[0];
    const logs = this._getData().attendance_logs;
    return logs.find(
      (l) => l.user_id === userId && l.check_in_time?.startsWith(today) && !l.check_out_time
    ) || null;
  }

  // ── Inquiries ──
  getInquiries() {
    return this._getData().inquiries.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }

  addInquiry(inquiry) {
    const data = this._getData();
    const newId = Math.max(...data.inquiries.map((i) => i.id), 0) + 1;
    const newInquiry = {
      id: newId,
      ...inquiry,
      status: 'NEW',
      created_at: new Date().toISOString(),
    };
    data.inquiries.push(newInquiry);
    this._setData(data);
    return newInquiry;
  }

  updateInquiryStatus(id, status) {
    const data = this._getData();
    const idx = data.inquiries.findIndex((i) => i.id === id);
    if (idx !== -1) {
      data.inquiries[idx].status = status;
      this._setData(data);
    }
  }

  // ── Enterprise Dashboard Stats ──
  getDashboardStats() {
    const today = getLocalDateStr(new Date());
    const todayLogs = this.getAttendanceLogs({ date: today });
    const allUsers = this.getUsers();
    const workers = allUsers.filter((u) => u.role === 'WORKER');
    const managers = allUsers.filter((u) => u.role !== 'WORKER');

    const checkedInToday = new Set(todayLogs.map((l) => l.user_id)).size;
    const caAngay = todayLogs.filter((l) => l.shift_type === 'CA_NGAY').length;
    const caDem = todayLogs.filter((l) => l.shift_type === 'CA_DEM').length;
    const tangCa = todayLogs.filter((l) => l.shift_type === 'TANG_CA').length;
    
    // Late arrivals: Checked in after 06:00 in morning shift
    const lateArrivals = todayLogs.filter((l) => {
      if (l.shift_type !== 'CA_NGAY') return false;
      const d = new Date(l.check_in_time);
      return d.getHours() > 6 || (d.getHours() === 6 && d.getMinutes() > 0);
    }).length;

    const validGPS = todayLogs.filter((l) => l.status === 'VALID').length;
    const invalidGPS = todayLogs.length - validGPS;
    const newInquiries = this._getData().inquiries.filter((i) => i.status === 'NEW').length;

    // Weekly trend
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const dayLogs = this.getAttendanceLogs({ date: dateStr });
      weeklyTrend.push({
        date: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        total: new Set(dayLogs.map((l) => l.user_id)).size,
        caAngay: dayLogs.filter((l) => l.shift_type === 'CA_NGAY').length,
        caDem: dayLogs.filter((l) => l.shift_type === 'CA_DEM').length,
        tangCa: dayLogs.filter((l) => l.shift_type === 'TANG_CA').length,
      });
    }

    // Department breakdown
    const departmentBreakdown = [
      { name: 'Chế biến tôm', count: 260, percent: 26.0, icon: '🦐', type: 'Sản xuất' },
      { name: 'Chế biến cá', count: 210, percent: 21.0, icon: '🐟', type: 'Sản xuất' },
      { name: 'Sushi Neta & GTGT', count: 150, percent: 15.0, icon: '🍣', type: 'Sản xuất' },
      { name: 'Đóng gói & Khoai tây', count: 140, percent: 14.0, icon: '📦', type: 'Sản xuất' },
      { name: 'Chế biến mực', count: 115, percent: 11.5, icon: '🦑', type: 'Sản xuất' },
      { name: 'Khối Cán bộ & Quản lý', count: 85, percent: 8.5, icon: '🏢', type: 'Văn phòng / Quản lý' },
      { name: 'Kho lạnh & IQF', count: 40, percent: 4.0, icon: '❄️', type: 'Sản xuất' },
    ];

    return {
      totalStaff: allUsers.length,
      totalWorkers: workers.length,
      totalManagers: managers.length,
      checkedInToday,
      attendanceRate: allUsers.length > 0 ? Math.round((checkedInToday / allUsers.length) * 100) : 0,
      workerAttendanceRate: workers.length > 0 ? Math.round((checkedInToday / workers.length) * 100) : 0,
      lateArrivals,
      caAngay,
      caDem,
      tangCa,
      validGPS,
      invalidGPS,
      newInquiries,
      weeklyTrend,
      departmentBreakdown,
    };
  }

  // ── Reset ──
  resetToDefaults() {
    localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DATA));
  }
}

export const db = new MockDB();

import * as XLSX from 'xlsx';

/**
 * Export attendance logs to Excel file (.xlsx)
 * @param {Array} logs - Array of attendance log records
 * @param {string} filename - Output filename (without extension)
 */
export function exportAttendanceToExcel(logs, filename = 'chamcong_afoods') {
  const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
  const outputFilename = `${filename}_${dateStr}.xlsx`;

  // Format data for Excel
  const data = logs.map((log, index) => ({
    'STT': index + 1,
    'Mã NV': log.emp_code,
    'Họ và Tên': log.full_name,
    'Bộ Phận': log.department,
    'Ngày': log.date || new Date(log.check_in_time).toLocaleDateString('vi-VN'),
    'Giờ Vào': log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    'Giờ Ra': log.check_out_time ? new Date(log.check_out_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    'Tổng Giờ (h)': log.total_hours || calculateHours(log.check_in_time, log.check_out_time),
    'Ca Làm Việc': formatShift(log.shift_type),
    'Tọa Độ GPS': log.latitude && log.longitude ? `${log.latitude?.toFixed(4)}, ${log.longitude?.toFixed(4)}` : 'N/A',
    'Khoảng Cách (m)': log.distance_meters || 0,
    'Trạng Thái GPS': log.status === 'VALID' ? '✓ Hợp lệ' : '✗ Ngoài phạm vi',
    'Ghi Chú': log.note || '',
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Main data sheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // STT
    { wch: 12 },  // Mã NV
    { wch: 22 },  // Họ và Tên
    { wch: 18 },  // Bộ Phận
    { wch: 12 },  // Ngày
    { wch: 10 },  // Giờ Vào
    { wch: 10 },  // Giờ Ra
    { wch: 14 },  // Tổng Giờ
    { wch: 16 },  // Ca Làm Việc
    { wch: 24 },  // Tọa Độ GPS
    { wch: 16 },  // Khoảng Cách
    { wch: 18 },  // Trạng Thái GPS
    { wch: 20 },  // Ghi Chú
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Chấm Công');

  // Summary sheet
  const summary = buildSummarySheet(logs);
  const wsSummary = XLSX.utils.aoa_to_sheet(summary);
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng Hợp');

  // Write file
  XLSX.writeFile(wb, outputFilename);
  return outputFilename;
}

function buildSummarySheet(logs) {
  const today = new Date().toLocaleDateString('vi-VN');
  const totalWorkers = new Set(logs.map(l => l.emp_code)).size;
  const validLogs = logs.filter(l => l.status === 'VALID').length;
  const caAngay = logs.filter(l => l.shift_type === 'CA_NGAY').length;
  const caDem = logs.filter(l => l.shift_type === 'CA_DEM').length;
  const tangCa = logs.filter(l => l.shift_type === 'TANG_CA').length;
  const avgHours = logs.reduce((sum, l) => sum + (parseFloat(l.total_hours) || 0), 0) / (logs.length || 1);

  return [
    ['AFOODS - BÁO CÁO CHẤM CÔNG', ''],
    ['Công ty CP XNK Thực phẩm Á Châu', ''],
    ['Địa chỉ: Ấp Đông Hoà, Xã Kim Sơn, Tỉnh Đồng Tháp', ''],
    ['', ''],
    ['Ngày xuất báo cáo:', today],
    ['Tổng số lượt chấm công:', logs.length],
    ['Số công nhân:', totalWorkers],
    ['Hợp lệ (trong phạm vi GPS):', validLogs],
    ['Ca ngày:', caAngay],
    ['Ca đêm:', caDem],
    ['Tăng ca:', tangCa],
    ['Giờ làm việc trung bình (h):', avgHours.toFixed(1)],
    ['', ''],
    ['Được tạo bởi:', 'AFOODS Enterprise Platform'],
  ];
}

function calculateHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return (diff / 3600000).toFixed(1);
}

function formatShift(shift) {
  const shifts = {
    CA_NGAY: 'Ca Ngày (6:00-14:00)',
    CA_DEM: 'Ca Đêm (22:00-6:00)',
    TANG_CA: 'Tăng Ca',
  };
  return shifts[shift] || shift || 'Ca Ngày';
}

# AFOODS Enterprise Platform (AFOODS-Hub) 🌊🦐🍣

> **Nền tảng Quản trị & Hợp nhất Doanh nghiệp Thủy Hải Sản Xuất Khẩu Á Châu (AFOODS)**  
> Tích hợp 2 phân hệ cốt lõi: **AI Sales & CSKH 24/7 (B2B)** + **GPS GeoFence Attendance System (1,000+ Nhân sự)**.

---

## 🏢 Giới Thiệu Doanh Nghiệp (AFOODS)
- **Tên công ty:** Công ty Cổ phần Xuất Nhập Khẩu Thực Phẩm Á Châu (Asia Foods Import Export Corp)
- **Năm thành lập:** 2005 (Hơn 20 năm uy tín chế biến & xuất khẩu thủy hải sản)
- **Slogan:** *"Good food, good health"*
- **Website:** [afoods.vn](https://afoods.vn)
- **Mã xuất khẩu EU:** **DL 422 & DH 323** (Được cấp phép xuất khẩu chính thức sang 27 nước EU)
- **Chứng chỉ quốc tế:** ISO 22000:2018, ISO 9001:2015, HACCP, BRC Global Standard (Grade A), HALAL, ASC, MSC, FDA (Hoa Kỳ).
- **Quy mô nhà máy:** Diện tích 40,000 m² (nhà xưởng 9,000 m²) tại **Ấp Đông Hòa, Xã Kim Sơn, Tỉnh Đồng Tháp** (Ven Sông Tiền, cách TP.HCM 75km).
- **Lực lượng lao động:** 1,000 nhân sự (915 công nhân sản xuất trên 6 dây chuyền chế biến + 85 cán bộ quản lý, QA/QC, Sales & Văn phòng).

---

## 🚀 Các Phân Hệ Cốt Lõi (Core Modules)

### 1. 🤖 AI Sales & CSKH Quốc Tế 24/7 (Client-facing)
- **Bộ não AI:** Trợ lý thông minh hỗ trợ đa ngôn ngữ (Tiếng Việt, English, 日本語, 中文, 한국어).
- **Dữ liệu huấn luyện:** Chuyên sâu về toàn bộ danh mục sản phẩm signature của AFOODS:
  - *Sản phẩm GTGT:* Tôm cuộn khoai tây (Potato Wrapped PTO Shrimp), Há cảo túi tiền (Money Bag Hargao), Sò điệp Farci, Dimsum, Chả giò...
  - *Sushi Neta Nhật Bản:* Ốc Tsubu-gai, Lườn cá hồi Harasu, Mực đỏ AkaIka...
  - *Thủy hải sản đông lạnh:* Tôm Sú/Thẻ HOSO, HLSO, PD, IQF; Cá tra/basa fillet; Mực ống & mực nang.
- **Lead Capture (B2B CRM Mini):** Thu thập tức thì thông tin khách hàng quốc tế muốn nhận báo giá FOB/CIF (Họ tên, Công ty, Quốc gia, Email, Nhu cầu container).

### 2. 📍 Chấm Công Vệ Tinh GPS GeoFence (Worker-facing)
- **Công nghệ Geofencing:** Thiết lập hàng rào địa lý bán kính **200m** quanh nhà máy AFOODS Kim Sơn (`10.3331°N, 106.2700°E`).
- **Chống gian lận:** Tự động phát hiện vị trí thực tế của thiết bị, khóa chấm công nếu công nhân không có mặt tại xưởng.
- **Phân bổ ca làm việc:** Ca Ngày (06:00 - 14:00), Ca Đêm (22:00 - 06:00), Tăng Ca (14:00 - 22:00).
- **Đồng hồ thời gian thực:** Đếm chính xác giờ làm việc (hh:mm:ss) theo từng lượt vào/ra.

### 3. 📊 HR & Factory Management Dashboard (Admin-facing)
- **Thống kê toàn diện quy mô 1,000 người:** 
  - Đã chấm công hôm nay (~876 lượt · 87.6% hiện diện).
  - Phân bổ theo ca & tỷ lệ tuân thủ GPS (98.4% hợp lệ).
  - Cơ cấu nhân sự theo 7 bộ phận nhà máy (Chế biến tôm, Chế biến cá, Sushi Neta, Đóng gói, Chế biến mực, Kho lạnh IQF, Khối Quản lý).
- **Biểu đồ trực quan:** Recharts AreaChart 7 ngày, BarChart phân tích ca, Donut PieChart.
- **Xuất Excel 1-Click:** Tải toàn bộ hàng ngàn bản ghi chấm công định dạng chuẩn `.xlsx` nhanh chóng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- **Frontend:** React 18, Vite 6, Tailwind CSS 3
- **Biểu đồ & Bản đồ:** Recharts, Leaflet / React-Leaflet
- **Xuất file:** SheetJS (xlsx)
- **Biểu tượng:** Lucide React
- **Thiết kế:** Dark Glassmorphism, chuẩn responsive 100% trên cả Mobile và Desktop

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

```bash
# 1. Clone repository về máy
git clone https://github.com/tranhoangsang89-maker/AFOODS-Hub.git

# 2. Di chuyển vào thư mục dự án
cd AFOODS-Hub

# 3. Cài đặt các thư viện phụ thuộc
npm install

# 4. Khởi chạy máy chủ phát triển
npm run dev
```

Truy cập trên trình duyệt: **`http://localhost:3000`**

---

## 👤 Tác Giả & Bản Quyền
- **Phát triển bởi:** **Tran Hoang Sang** (Hotline/Zalo: `0888.003.205`)
- **Dự án:** AFOODS Enterprise Platform © Since 2005 · [afoods.vn](https://afoods.vn)

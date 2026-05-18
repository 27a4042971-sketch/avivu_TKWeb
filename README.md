# AVIVU 🧭

Website booking tour du lịch Việt Nam — Học phần Thiết kế Web.

## 👥 Nhóm phát triển

| Thành viên | Vai trò | Phụ trách |
|---|---|---|
| A (Trưởng nhóm) | UI Foundation | `index.html`, `global.css`, `components.css` |
| B | Tour Explorer | `pages/tours.html`, `js/tours.js` |
| C | Detail & UX | `pages/tour-detail.html`, `css/responsive.css` |
| D | Conversion | `pages/booking.html`, `pages/login.html` |

## 📁 Cấu trúc

```
AVIVU/
├── index.html          ← Trang chủ (hoàn chỉnh)
├── pages/              ← Các trang con
├── css/                ← Stylesheet
├── js/                 ← JavaScript
│   └── data/tours-data.js  ← 29 tour mẫu
└── assets/             ← Ảnh, icons
```

## 🚀 Chạy dự án

Mở file `index.html` trực tiếp trên trình duyệt (không cần server).  
Hoặc dùng VS Code + extension **Live Server** để hot-reload.

## 📦 Thư viện (CDN)

- [Font Awesome 6](https://fontawesome.com) — Icons
- [Google Fonts](https://fonts.google.com) — Inter + Playfair Display
- [AOS.js](https://michalsnik.github.io/aos/) — Scroll animations
- [Flatpickr](https://flatpickr.js.org) — Date picker (tour-detail)
- [SweetAlert2](https://sweetalert2.github.io) — Alerts đẹp (booking)

## 🌿 Git Workflow

```bash
# Mỗi thành viên tạo nhánh riêng
git checkout -b feature/ten-tinh-nang

# Commit theo quy tắc
git commit -m "feat: thêm filter sidebar trang tours"

# Tạo Pull Request → Trưởng nhóm review & merge
```

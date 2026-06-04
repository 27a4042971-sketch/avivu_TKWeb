/**
 * AVIVU — tours-data.js
 * Tác giả: Thành viên B
 * Dữ liệu 29 tour mẫu (giả lập API)
 */
const toursData = [
  // ── BIỂN & ĐẢO ──────────────────────────────────────────────
  { id:1, name:"Khám Phá Phú Quốc", category:"bien-dao", location:"Phú Quốc, Kiên Giang", duration:"4 ngày 3 đêm", price:3500000, rating:4.8, reviewCount:243, badge:"Bán chạy", badgeType:"hot", departure:"TP.HCM", image: "../assets/images/tours/1/1.cover.jpg", highlights:["Lặn ngắm san hô","Cáp treo Hòn Thơm","Sunset Sanato"], includes:["Vé máy bay","Khách sạn 4★","HDV"] },
  { id:2, name:"Thiên Đường Côn Đảo", category:"bien-dao", location:"Côn Đảo, Bà Rịa-VT", duration:"3 ngày 2 đêm", price:4200000, rating:4.9, reviewCount:187, badge:"Hot", badgeType:"hot", departure:"TP.HCM", image: "../assets/images/tours/2/2.cover.jpg", highlights:["Rùa biển đẻ trứng","Lặn biển","Nghĩa trang Hàng Dương"], includes:["Vé máy bay","Resort 4★","HDV"] },
  { id:3, name:"Cù Lao Chàm Xanh", category:"bien-dao", location:"Hội An, Quảng Nam", duration:"2 ngày 1 đêm", price:1800000, rating:4.6, reviewCount:312, badge:"Mới", badgeType:"new", departure:"Đà Nẵng", image: "../assets/images/tours/3/3.cover.jpg", highlights:["Lặn ngắm san hô","Câu cá","Phố cổ Hội An"], includes:["Tàu cao tốc","Khách sạn 3★","Ăn sáng"] },
  { id:4, name:"Vịnh Hạ Long Huyền Bí", category:"bien-dao", location:"Hạ Long, Quảng Ninh", duration:"3 ngày 2 đêm", price:5500000, rating:4.9, reviewCount:521, badge:"Bán chạy", badgeType:"hot", departure:"Hà Nội", image: "../assets/images/tours/4/4.cover.jpg", highlights:["Cruise cao cấp","Kayak hang động","Đỉnh Bài Thơ"], includes:["Xe đưa đón","Cruise 5★","Toàn bộ bữa ăn"] },
  { id:5, name:"Đảo Lý Sơn", category:"bien-dao", location:"Quảng Ngãi", duration:"3 ngày 2 đêm", price:2900000, rating:4.7, reviewCount:156, badge:null, badgeType:"", departure:"Đà Nẵng", image: "../assets/images/tours/5/5.cover.jpg", highlights:["Cổng Tò Vò","Miệng núi lửa","Hải sản tươi sống"], includes:["Tàu cao tốc","Homestay","HDV"] },

  // ── NÚI & TREKKING ───────────────────────────────────────────
  { id:6, name:"Chinh Phục Fansipan", category:"nui-trekking", location:"Sa Pa, Lào Cai", duration:"3 ngày 2 đêm", price:4800000, rating:4.8, reviewCount:389, badge:"Hot", badgeType:"hot", departure:"Hà Nội", image: "../assets/images/tours/6/6.cover.jpg", highlights:["Cáp treo Fansipan","Bản làng dân tộc","Ruộng bậc thang"], includes:["Xe giường nằm","Khách sạn 3★","HDV trekking"] },
  { id:7, name:"Khám Phá Mù Cang Chải", category:"nui-trekking", location:"Yên Bái", duration:"3 ngày 2 đêm", price:3200000, rating:4.7, reviewCount:201, badge:"Mới", badgeType:"new", departure:"Hà Nội", image: "../assets/images/tours/7/7.cover.jpg", highlights:["Ruộng bậc thang vàng","Bản Mông","Đèo Khau Phạ"], includes:["Xe limousine","Homestay","Ăn sáng"] },
  { id:8, name:"Trekking Đỉnh Bạch Mã", category:"nui-trekking", location:"Thừa Thiên Huế", duration:"2 ngày 1 đêm", price:2100000, rating:4.5, reviewCount:134, badge:null, badgeType:"", departure:"Đà Nẵng", image: "../assets/images/tours/8/8.cover.jpg", highlights:["Thác Ngũ Hồ","Vọng hải đài","Rừng nguyên sinh"], includes:["Xe đưa đón","Resort","HDV"] },
  { id:9, name:"Rừng Hoàng Liên Sơn", category:"nui-trekking", location:"Sa Pa, Lào Cai", duration:"4 ngày 3 đêm", price:5200000, rating:4.8, reviewCount:267, badge:"Hot", badgeType:"hot", departure:"Hà Nội", image: "../assets/images/tours/9/9.cover.jpg", highlights:["Trekking rừng nguyên sinh","Homestay bản làng","Đỉnh Ky Quan San"], includes:["Xe limousine","Homestay","3 bữa/ngày"] },

  // ── VĂN HÓA & DI SẢN ────────────────────────────────────────
  { id:10, name:"Cố Đô Huế - Di Sản Vương Triều", category:"van-hoa", location:"Huế, TT-Huế", duration:"3 ngày 2 đêm", price:2800000, rating:4.7, reviewCount:298, badge:null, badgeType:"", departure:"Đà Nẵng", image: "../assets/images/tours/10/10.cover.jpg", highlights:["Đại Nội","Lăng Tự Đức","Chùa Thiên Mụ","Ẩm thực Huế"], includes:["Xe đưa đón","Khách sạn 3★","HDV"] },
  { id:11, name:"Phố Cổ Hội An & Mỹ Sơn", category:"van-hoa", location:"Quảng Nam", duration:"3 ngày 2 đêm", price:2500000, rating:4.8, reviewCount:445, badge:"Bán chạy", badgeType:"hot", departure:"Đà Nẵng", image: "../assets/images/tours/11/11.cover.jpg", highlights:["Đèn lồng Hội An","Thánh địa Mỹ Sơn","Làng gốm Thanh Hà"], includes:["Xe đưa đón","Khách sạn 4★","Vé tham quan"] },
  { id:12, name:"Hà Nội - Ninh Bình Cổ Kính", category:"van-hoa", location:"Hà Nội + Ninh Bình", duration:"4 ngày 3 đêm", price:3900000, rating:4.6, reviewCount:312, badge:null, badgeType:"", departure:"TP.HCM",image: "../assets/images/tours/12/12.cover.jpg", highlights:["Phố cổ Hà Nội","Tràng An","Bích Động","Hoa Lư"], includes:["Vé máy bay","Khách sạn 4★","HDV"] },
  { id:13, name:"Làng Nghề Đồng Bằng Sông Cửu Long", category:"van-hoa", location:"Cần Thơ, Vĩnh Long", duration:"3 ngày 2 đêm", price:2200000, rating:4.5, reviewCount:178, badge:"Mới", badgeType:"new", departure:"TP.HCM", image: "../assets/images/tours/13/13.cover.jpg", highlights:["Chợ nổi Cái Răng","Làng kẹo dừa","Vườn trái cây"], includes:["Xe đưa đón","Ghe xuồng","Homestay"] },
  { id:14, name:"Con Đường Di Sản Miền Trung", category:"van-hoa", location:"Huế - Đà Nẵng - Hội An", duration:"5 ngày 4 đêm", price:5800000, rating:4.9, reviewCount:523, badge:"Bán chạy", badgeType:"hot", departure:"TP.HCM", image: "../assets/images/tours/14/14.cover.jpg", highlights:["3 Di sản UNESCO","Bà Nà Hills","Ẩm thực miền Trung"], includes:["Vé máy bay","Khách sạn 4★","HDV chuyên nghiệp"] },

  // ── SINH THÁI ────────────────────────────────────────────────
  { id:15, name:"Rừng Ngập Mặn Cần Giờ", category:"sinh-thai", location:"TP.HCM", duration:"1 ngày", price:850000, rating:4.4, reviewCount:267, badge:null, badgeType:"", departure:"TP.HCM", image: "../assets/images/tours/15/15.cover.jpg", highlights:["Căn cứ Rừng Sác","Khỉ hoang","Đầm tôm sinh thái"], includes:["Xe đưa đón","Thuyền","Trưa"] },
  { id:16, name:"Vườn QG Phong Nha - Kẻ Bàng", category:"sinh-thai", location:"Quảng Bình", duration:"3 ngày 2 đêm", price:4500000, rating:4.9, reviewCount:389, badge:"Hot", badgeType:"hot", departure:"Hà Nội", image: "../assets/images/tours/16/16.cover.jpg", highlights:["Động Thiên Đường","Sông chảy trong hang","Kayak"], includes:["Vé máy bay","Khách sạn 3★","HDV"] },
  { id:17, name:"Miệt Vườn Cửu Long", category:"sinh-thai", location:"Tiền Giang, Bến Tre", duration:"2 ngày 1 đêm", price:1500000, rating:4.5, reviewCount:312, badge:null, badgeType:"", departure:"TP.HCM", image: "../assets/images/tours/17/17.cover.jpg", highlights:["Vườn dừa","Làm kẹo dừa","Chèo thuyền"], includes:["Xe đưa đón","Homestay","Ăn sáng"] },
  { id:18, name:"Vườn QG Cúc Phương", category:"sinh-thai", location:"Ninh Bình", duration:"2 ngày 1 đêm", price:1900000, rating:4.6, reviewCount:189, badge:"Mới", badgeType:"new", departure:"Hà Nội",image: "../assets/images/tours/18/18.cover.jpg", highlights:["Cứu hộ linh trưởng","Trekking rừng","Động Người Xưa"], includes:["Xe đưa đón","Nhà nghỉ sinh thái","HDV"] },

  // ── LỄ HỘI ──────────────────────────────────────────────────
  { id:19, name:"Lễ Hội Đèn Lồng Hội An", category:"le-hoi", location:"Hội An, Quảng Nam", duration:"2 ngày 1 đêm", price:2300000, rating:4.8, reviewCount:445, badge:"Hot", badgeType:"hot", departure:"Đà Nẵng", image: "../assets/images/tours/19/19.cover.jpg", highlights:["Thả đèn hoa đăng","Phố đèn lồng","Làm đèn lồng thủ công"], includes:["Xe đưa đón","Khách sạn","Vé tham quan"] },
  { id:20, name:"Tết Nguyên Đán Hà Nội", category:"le-hoi", location:"Hà Nội", duration:"3 ngày 2 đêm", price:3100000, rating:4.7, reviewCount:201, badge:null, badgeType:"", departure:"TP.HCM", image: "../assets/images/tours/20/20.cover.jpg", highlights:["Hồ Gươm đêm Giao thừa","Chợ hoa Tết","Đền Ngọc Sơn"], includes:["Vé máy bay","Khách sạn 4★","HDV"] },
  { id:21, name:"Lễ Hội Katê Ninh Thuận", category:"le-hoi", location:"Ninh Thuận", duration:"2 ngày 1 đêm", price:1700000, rating:4.6, reviewCount:134, badge:"Mới", badgeType:"new", departure:"TP.HCM", image: "../assets/images/tours/21/21.cover.jpg", highlights:["Tháp Chàm Po Klong Garai","Múa Chăm","Ẩm thực Chăm"], includes:["Xe đưa đón","Khách sạn","HDV"] },

  // ── GIA ĐÌNH ─────────────────────────────────────────────────
  { id:22, name:"Đà Lạt Vui Vẻ Cho Cả Nhà", category:"gia-dinh", location:"Đà Lạt, Lâm Đồng", duration:"4 ngày 3 đêm", price:4100000, rating:4.7, reviewCount:378, badge:"Bán chạy", badgeType:"hot", departure:"TP.HCM", image: "../assets/images/tours/22/22.cover.jpg", highlights:["Thung lũng Tình Yêu","Vườn dâu","Cáp treo Robin"], includes:["Xe limousine","Khách sạn 4★","Xe tham quan"] },
  { id:23, name:"VinWonders Nha Trang", category:"gia-dinh", location:"Nha Trang, Khánh Hòa", duration:"3 ngày 2 đêm", price:5300000, rating:4.8, reviewCount:456, badge:"Hot", badgeType:"hot", departure:"TP.HCM", image: "../assets/images/tours/23/23.cover.jpg", highlights:["VinWonders","Vinpearl Safari","Biển Nha Trang"], includes:["Vé máy bay","Vinpearl Resort","Vé công viên"] },
  { id:24, name:"Bà Nà Hills & Phố Cổ Hội An", category:"gia-dinh", location:"Đà Nẵng", duration:"3 ngày 2 đêm", price:3700000, rating:4.7, reviewCount:312, badge:null, badgeType:"", departure:"TP.HCM", image: "../assets/images/tours/24/24.cover.jpg", highlights:["Cầu Vàng","Bà Nà Hills","Hội An đêm"], includes:["Vé máy bay","Khách sạn 4★","Vé cáp treo"] },
  { id:25, name:"Sun World Hạ Long Park", category:"gia-dinh", location:"Hạ Long, Quảng Ninh", duration:"2 ngày 1 đêm", price:3200000, rating:4.6, reviewCount:267, badge:null, badgeType:"", departure:"Hà Nội", image: "../assets/images/tours/25/25.cover.jpg", highlights:["Sun World","Tham quan vịnh","Đêm trên vịnh"], includes:["Xe đưa đón","Khách sạn","Vé công viên"] },

  // ── PHƯỢT & MẠO HIỂM ────────────────────────────────────────
  { id:26, name:"Vòng Cung Tây Bắc", category:"phuot", location:"Hà Giang → Sa Pa", duration:"6 ngày 5 đêm", price:5900000, rating:4.9, reviewCount:189, badge:"Hot", badgeType:"hot", departure:"Hà Nội", image: "../assets/images/tours/26/26.cover.jpg", highlights:["Đèo Mã Pí Lèng","Đồng Văn","Cột cờ Lũng Cú","Ruộng bậc thang"], includes:["Xe đưa đón","Homestay","HDV địa phương"] },
  { id:27, name:"Cung Đường Ven Biển Đông", category:"phuot", location:"Quy Nhơn → Nha Trang", duration:"5 ngày 4 đêm", price:4700000, rating:4.7, reviewCount:156, badge:"Mới", badgeType:"new", departure:"TP.HCM", image: "../assets/images/tours/27/27.cover.jpg", highlights:["Eo Gió","Kỳ Co","Hòn Chồng","Bãi Dài"], includes:["Xe đưa đón","Khách sạn","HDV"] },
  { id:28, name:"Hang Sơn Đoòng Expedition", category:"phuot", location:"Quảng Bình", duration:"4 ngày 3 đêm", price:9500000, rating:5.0, reviewCount:67, badge:"Hot", badgeType:"hot", departure:"Hà Nội", image: "../assets/images/tours/28/28.cover.jpg", highlights:["Hang lớn nhất thế giới","Rừng trong hang","Cắm trại trong hang"], includes:["Vé máy bay","Trang bị đầy đủ","HDV chuyên nghiệp"] },
  { id:29, name:"Cắm Trại Đảo Hoang Bình Ba", category:"phuot", location:"Khánh Hòa", duration:"2 ngày 1 đêm", price:2100000, rating:4.6, reviewCount:234, badge:null, badgeType:"", departure:"Nha Trang", image: "../assets/images/tours/29/29.cover.jpg", highlights:["Tôm hùm Bình Ba","Lặn biển","Cắm trại bãi hoang"], includes:["Tàu cao tốc","Lều cắm trại","Đồ ăn BBQ"] }
];

// Helper: lọc theo danh mục
function getToursByCategory(cat) {
  return cat ? toursData.filter(t => t.category === cat) : toursData;
}

// Helper: lấy tour theo id
function getTourById(id) {
  return toursData.find(t => t.id === parseInt(id));
}

// Helper: format giá tiền
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ';
}

/**
 * AVIVU — booking.js
 * Tác giả: Thành viên D (Xử lý thông minh & tương tác cao)
 * TODO:
 * - [x] Multi-step wizard: showStep(n), nextStep(), prevStep()
 * - [x] Render tóm tắt tour từ ?id= (Bước 1)
 * - [x] Validation form khách hàng (Bước 2)
 * - Họ tên: không rỗng
 * - SĐT: 10 số
 * - Email: đúng định dạng
 * - [x] Hiện xác nhận + mã đặt tour random (Bước 3)
 * - [x] Lưu booking vào localStorage
 * - [x] Progress bar cập nhật theo bước
 * - [x] Dùng SweetAlert2 thông báo thành công
 * - [x] Tích hợp Trợ lý AI gợi ý theo thời điểm và quy mô đoàn khách
 */

let currentStep = 1;
let selectedTourPrice = 0;
let selectedTourName = "Chưa chọn tour";

document.addEventListener('DOMContentLoaded', () => {
    // Render tóm tắt tour từ ?id= (Bước 1)
    initTourData();
    
    // Đặt ngày mặc định cho ô input là ngày mai
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }

    // Khởi tạo hiển thị Bước 1 ban đầu
    showStep(1);

    // Tự động kích hoạt gợi ý của AI ngay khi tải xong trang dựa trên ngày mặc định
    triggerAISuggestion();
});

// Hàm trích xuất thông tin tour từ URL (?id=...) hoặc toursData toàn cục
function initTourData() {
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');
    
    let activeTour = null;

    // Kiểm tra xem dữ liệu toursData từ file tours-data.js có tồn tại không
    if (typeof toursData !== 'undefined' && Array.isArray(toursData)) {
        activeTour = toursData.find(t => t.id == tourId || t.slug == tourId);
    }

    // Bộ dữ liệu dự phòng phòng trường hợp file tours-data.js chưa đồng bộ ID
    const fallbackDatabase = {
        'halong': { name: 'Vịnh Hạ Long Huyền Diệu', duration: '3N2Đ', price: 2500000, image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400' },
        'phuquoc': { name: 'Đảo Ngọc Phú Quốc Cát Trắng', duration: '4N3Đ', price: 4200000, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
        'sapa': { name: 'Thị Trấn Sương Mù Sa Pa', duration: '3N2Đ', price: 2900000, image: 'https://images.unsplash.com/photo-106905925346-21bda4d32df4?w=400' }
    };

    if (!activeTour && tourId && fallbackDatabase[tourId]) {
        activeTour = fallbackDatabase[tourId];
    }

    // Nếu tìm thấy tour phù hợp, tiến hành render ra màn hình
    if (activeTour) {
        selectedTourName = activeTour.name || activeTour.title;
        selectedTourPrice = activeTour.price;
        
        const summaryCard = document.getElementById('tourSummaryCard');
        if (summaryCard) {
            summaryCard.innerHTML = `
                <div class="summary-flex">
                    <div class="summary-info">
                        <h4>${selectedTourName}</h4>
                        <p><i class="far fa-clock"></i> <strong>Thời gian:</strong> ${activeTour.duration || 'Lịch trình linh hoạt'}</p>
                        <p><i class="fas fa-tags"></i> <strong>Đơn giá cơ bản:</strong> <span class="price-highlight">${selectedTourPrice.toLocaleString('vi-VN')} ₫</span> / khách</p>
                    </div>
                </div>
            `;
        }
    } else {
        // Trường hợp URL không truyền tham số hoặc không tìm thấy ID
        const summaryCard = document.getElementById('tourSummaryCard');
        if (summaryCard) {
            summaryCard.innerHTML = `
                <div class="no-tour-alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Bạn chưa lựa chọn gói tour cụ thể. Vui lòng quay lại danh sách để tiến hành chọn tour ưng ý.</p>
                </div>
            `;
        }
    }
    
    // Cập nhật bảng biên lai bên tay phải
    calculatePrice();
}

// Tính toán lại tổng chi phí dựa trên số lượng khách nhập (input number)
function calculatePrice() {
    const guestsInput = document.getElementById('bookingGuests');
    // Nếu khách xóa trống hoặc nhập số âm, mặc định tính là 1 để tránh lỗi hiển thị/tính toán giá tiền
    let numGuests = guestsInput ? parseInt(guestsInput.value) : 1;
    if (isNaN(numGuests) || numGuests < 1) {
        numGuests = 1; 
    }
    
    const totalPrice = selectedTourPrice * numGuests;

    // Cập nhật bảng sidebar biên lai
    document.getElementById('breakdownTourName').innerText = selectedTourName;
    document.getElementById('breakdownBasePrice').innerText = selectedTourPrice.toLocaleString('vi-VN') + " ₫";
    document.getElementById('breakdownGuests').innerText = numGuests + " người";
    document.getElementById('breakdownTotalPrice').innerText = totalPrice.toLocaleString('vi-VN') + " ₫";
}

// Multi-step wizard: showStep(n), nextStep(), prevStep()
function showStep(n) {
    // Ẩn tất cả các panel bước
    document.querySelectorAll('.step-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Hiện panel chỉ định
    const targetPanel = document.getElementById('step-' + n);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    currentStep = n;
    
    // Progress bar cập nhật theo bước
    updateProgressBar(n);
}

function nextStep() {
    if (currentStep === 1) {
        if (selectedTourPrice === 0) {
            Swal.fire('Thông báo', 'Vui lòng chọn một tour hợp lệ từ hệ thống trước khi tiếp tục.', 'warning');
            return;
        }
        
        // Kiểm tra tính hợp lệ của số lượng khách trước khi qua bước 2
        const guestsInput = document.getElementById('bookingGuests');
        const numGuests = guestsInput ? parseInt(guestsInput.value) : 1;
        if (isNaN(numGuests) || numGuests < 1) {
            Swal.fire('Lỗi Số Lượng', 'Vui lòng nhập số lượng thành viên tham gia tour hợp lệ (tối thiểu là 1 người).', 'error');
            return;
        }
        
        showStep(2);
    } else if (currentStep === 2) {
        // Validation form khách hàng (Bước 2)
        if (validateCustomerForm()) {
            processBookingSubmit();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function updateProgressBar(step) {
    const progressFill = document.getElementById('progressBarFill');
    if (progressFill) {
        // Tính toán thanh phần trăm: Bước 1: 0%, Bước 2: 50%, Bước 3: 100%
        const percent = ((step - 1) / 2) * 100;
        progressFill.style.width = percent + '%';
    }

    // Cập nhật trạng thái các icon tròn chỉ số bước
    document.querySelectorAll('.step-indicator-item').forEach(item => {
        const itemStep = parseInt(item.getAttribute('data-step'));
        if (itemStep <= step) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function validateCustomerForm() {
    const name = document.getElementById('cusName').value.trim();
    const phone = document.getElementById('cusPhone').value.trim();
    const email = document.getElementById('cusEmail').value.trim();
    
    // - Họ tên: không rỗng
    if (name === '') {
        Swal.fire('Lỗi Nhập Liệu', 'Vui lòng cung cấp đầy đủ Họ và tên để làm thủ tục đăng ký danh sách tour!', 'error');
        return false;
    }
    
    // - SĐT: đúng định dạng 10 số di động
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        Swal.fire('Lỗi Nhập Liệu', 'Số điện thoại liên hệ không hợp lệ. Vui lòng nhập đúng chuỗi 10 chữ số!', 'error');
        return false;
    }
    
    // - Email: đúng định dạng chuẩn
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire('Lỗi Nhập Liệu', 'Định dạng email không hợp lệ (Ví dụ chính xác: hotro@avivu.vn)!', 'error');
        return false;
    }
    
    return true;
}

function processBookingSubmit() {
    // Hiện xác nhận + mã đặt tour random sinh ra ngẫu nhiên (Bước 3)
    const randomCode = 'AVI-' + Math.floor(100000 + Math.random() * 900000);
    
    const guestsInput = document.getElementById('bookingGuests');
    let numGuests = guestsInput ? parseInt(guestsInput.value) : 1;
    if (isNaN(numGuests) || numGuests < 1) numGuests = 1;

    const bookingData = {
        bookingCode: randomCode,
        tourName: selectedTourName,
        travelDate: document.getElementById('bookingDate').value,
        guestsCount: numGuests,
        totalPayable: selectedTourPrice * numGuests,
        customerName: document.getElementById('cusName').value.trim(),
        customerPhone: document.getElementById('cusPhone').value.trim(),
        customerEmail: document.getElementById('cusEmail').value.trim(),
        customerNote: document.getElementById('cusNote').value.trim(),
        timestamp: new Date().toISOString()
    };
    
    // Lưu booking hoàn chỉnh vào hệ thống localStorage dữ liệu trình duyệt
    let localBookings = JSON.parse(localStorage.getItem('avivu_bookings')) || [];
    localBookings.push(bookingData);
    localStorage.setItem('avivu_bookings', JSON.stringify(localBookings));
    
    // Hiển thị mã ra màn hình chúc mừng kết quả
    const codeContainer = document.getElementById('finalBookingCode');
    if (codeContainer) codeContainer.innerText = randomCode;
    
    // Dùng SweetAlert2 thông báo thành công vang dội
    Swal.fire({
        title: 'Đặt Chỗ Hoàn Tất!',
        text: 'Hành trình của bạn đã được tiếp nhận thành công.',
        icon: 'success',
        confirmButtonColor: '#FF6B35',
        confirmButtonText: 'Xem mã xác nhận'
    }).then(() => {
        showStep(3); // Chuyển thẳng sang giao diện panel bước cuối cùng
    });
}

// Tính năng Trợ lý AI tư vấn dựa trên Ngày và Số lượng khách tự động
function triggerAISuggestion() {
    const dateVal = document.getElementById('bookingDate').value;
    const guestsInput = document.getElementById('bookingGuests');
    const guestsVal = guestsInput ? parseInt(guestsInput.value) : 1;
    
    const suggestionBox = document.getElementById('aiSuggestionBox');
    const suggestionText = document.getElementById('aiSuggestionText');

    // Chặn nếu các phần tử DOM chưa sẵn sàng hoặc người dùng chưa chọn ngày
    if (!dateVal || !suggestionBox || !suggestionText) return; 

    const selectedDate = new Date(dateVal);
    const month = selectedDate.getMonth() + 1; // getMonth() chạy từ 0-11 nên phải tịnh tiến +1
    let suggestion = "";

    // 1. Phân tích điểm đến lý tưởng dựa theo thời điểm (Mùa du lịch trong năm)
    if (month >= 5 && month <= 8) {
        suggestion += `Tháng ${month} rơi vào giai đoạn cao điểm mùa hè oi bức, cực kỳ lý tưởng để bạn đi các tour biển đảo giải nhiệt. AVIVU gợi ý các hành trình như Vịnh Hạ Long, Phú Quốc hoặc thành phố biển Đà Nẵng năng động. `;
    } else if (month >= 10 || month <= 2) {
        suggestion += `Tháng ${month} tiết trời miền Bắc chuyển sang đông se lạnh rất thơ mộng. Lựa chọn tuyệt vời nhất lúc này là những chặng săn mây, khám phá văn hóa vùng cao độc đáo như Sa Pa, Hà Giang hay ngắm hoa cải trắng. `;
    } else {
        suggestion += `Tháng ${month} là khoảng thời gian tiết trời giao mùa dịu mát, không khí trong lành, vô cùng thích hợp để bạn thong dong dạo bước và check-in phố cổ Hội An, Cố đô Huế cổ kính hoặc dạo chơi miền Tây sông nước thanh bình. `;
    }

    // 2. Tư vấn phương án tối ưu dựa theo số lượng thành viên tự điền
    if (isNaN(guestsVal) || guestsVal < 1) {
        suggestion += `Vui lòng nhập số lượng khách chính xác để Trợ lý tư vấn giải pháp phòng nghỉ và phương tiện thích hợp nhất cho đoàn nhé!`;
    } else if (guestsVal >= 10) {
        suggestion += `Đặc biệt với đoàn đông đảo từ ${guestsVal} thành viên trở lên, hệ thống khuyến nghị bạn nên ghi chú yêu cầu làm "Tour Đoàn Riêng/Teambuilding". Chuyên viên AVIVU sẽ thiết kế lịch trình và chính sách giá chiết khấu đặc cách siêu tiết kiệm cho bạn!`;
    } else if (guestsVal >= 4 && guestsVal <= 9) {
        suggestion += `Với quy mô nhóm ${guestsVal} người (Gia đình / Hội bạn thân), phương án bao trọn gói xe du lịch 16 chỗ đời mới hoặc lựa chọn nghỉ dưỡng tại các căn Villa nguyên căn riêng tư sẽ mang lại sự thoải mái tối đa cho hành trình.`;
    } else if (guestsVal === 2) {
        suggestion += `Chuyến đi dành riêng cho 2 người luôn chứa đựng sự lãng mạn cao. Đừng ngần ngại để lại ghi chú ở Bước 2 nếu nhóm bạn đang đi hưởng tuần trăng mật (Honeymoon) hoặc kỷ niệm ngày cưới để khách sạn chuẩn bị set-up nến, hoa chu đáo nhé!`;
    } else if (guestsVal === 1) {
        suggestion += `Khám phá thế giới một mình (Solo Travel) đang là phong cách sống cực chất! Với 1 người, bạn hoàn toàn có thể yên tâm đăng ký hình thức tour ghép để vừa tiết kiệm chi phí, vừa dễ dàng giao lưu kết bạn bốn phương trong chuyến hành trình sắp tới.`;
    }

    // Đổ nội dung vào thẻ span và hiển thị hộp thoại
    suggestionText.innerText = suggestion;
    suggestionBox.style.display = 'block';
}
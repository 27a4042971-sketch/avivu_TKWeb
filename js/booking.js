/**
 * avivu — booking.js
 * Trang đặt tour
 * Nhận dữ liệu từ tour-detail qua URL:
 * ?id=1&startDate=...&endDate=...&adults=2&children=1&meal=full
 */

let currentStep = 1;
let selectedTour = null;
let selectedTourPrice = 0;
let selectedTourName = 'Chưa chọn tour';
let selectedDate = null;
let selectedEndDate = null;

let calYear;
let calMonth;

const FULL_DAYS = [3, 7, 14, 21];

const MEAL_PLANS = {
    none: {
        label: 'Không bao gồm ăn',
        extra: 0,
        desc: 'Quý khách tự túc ăn uống trong suốt hành trình.'
    },
    full: {
        label: 'Ăn đủ bữa',
        extra: 180000,
        desc: 'Bao gồm bữa sáng tại khách sạn, bữa trưa và tối theo lịch trình.'
    },
    luxury: {
        label: 'Ăn sang trọng 5★',
        extra: 480000,
        desc: 'Các bữa ăn được nâng cấp tại nhà hàng cao cấp, thực đơn chọn lọc.'
    }
};

const PAY_METHOD_LABELS = {
    card: 'Thẻ tín dụng / ghi nợ',
    qr: 'Chuyển khoản QR Bank',
    momo: 'Ví MoMo',
    zalopay: 'ZaloPay / VNPay'
};

document.addEventListener('DOMContentLoaded', () => {
    requireLoginBeforeBooking();
    hydrateUserState();
    bindBaseEvents();
    initHeroStars();
    initTourData();
    initBookingFromUrl();
    initCalendar();
    showStep(1);
    calculatePrice();
    triggerAISuggestion();
});
    
/* =========================
   INIT USER / UI
========================= */
function requireLoginBeforeBooking() {
    const currentUser = safeJsonParse(localStorage.getItem('currentUser'));

    if (currentUser) return;

    const currentUrl = window.location.pathname.split('/').pop() + window.location.search;

    alert('Bạn cần đăng nhập để tiếp tục đặt tour.');
    window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
}

function hydrateUserState() {
    const user = safeJsonParse(localStorage.getItem('currentUser'));

    if (!user) return;

    const loginText = document.getElementById('loginBtnText');
    const guestBanner = document.getElementById('guestBanner');
    const accountPromo = document.getElementById('accountPromo');

    if (loginText && user.name) {
        loginText.textContent = user.name.split(' ').slice(-1)[0];
    }

    if (guestBanner) {
        guestBanner.style.display = 'none';
    }

    if (accountPromo) {
        accountPromo.style.display = 'none';
    }

    const nameInput = document.getElementById('cusName');
    const emailInput = document.getElementById('cusEmail');

    if (nameInput && user.name) nameInput.value = user.name;
    if (emailInput && user.email) emailInput.value = user.email;
}

function bindBaseEvents() {
    document.getElementById('continueAsGuestBtn')?.addEventListener('click', () => {
        const banner = document.getElementById('guestBanner');
        if (banner) banner.style.display = 'none';
    });

    document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
        changeCalMonth(-1);
    });

    document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
        changeCalMonth(1);
    });

    document.getElementById('nextStep1')?.addEventListener('click', nextStep);
    document.getElementById('prevStep2')?.addEventListener('click', prevStep);
    document.getElementById('confirmBookingBtn')?.addEventListener('click', nextStep);

    document.getElementById('bookingGuests')?.addEventListener('input', () => {
        normalizeNumberInput('bookingGuests', 1);
        calculatePrice();
        triggerAISuggestion();
    });

    document.getElementById('bookingChildren')?.addEventListener('input', () => {
        normalizeNumberInput('bookingChildren', 0);
        calculatePrice();
        triggerAISuggestion();
    });

    document.getElementById('mealPlan')?.addEventListener('change', () => {
        updateMealPlanDesc();
        calculatePrice();
        triggerAISuggestion();
    });

    document.querySelectorAll('.itinerary-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            switchItineraryTab(btn.dataset.tab, btn);
        });
    });
}

/* =========================
   TOUR DATA
========================= */

function initTourData() {
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get('id');

    if (typeof toursData !== 'undefined' && Array.isArray(toursData)) {
        selectedTour = toursData.find(tour => String(tour.id) === String(tourId));
    }

    if (!selectedTour && typeof toursData !== 'undefined' && Array.isArray(toursData) && toursData.length > 0) {
        selectedTour = toursData[0];
    }

    const card = document.getElementById('tourSummaryCard');

    if (!card) return;

    if (!selectedTour) {
        card.innerHTML = `
      <div class="no-tour-alert">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Bạn chưa chọn tour. Vui lòng <a href="tours.html" style="color: var(--primary); font-weight: 700;">quay lại danh sách tour</a>.</p>
      </div>
    `;
        return;
    }

    selectedTourName = selectedTour.name || 'Tour du lịch';
    selectedTourPrice = Number(selectedTour.price) || 0;

    card.innerHTML = `
    <div class="summary-inner">
      <h4>${escapeHtml(selectedTourName)}</h4>
      <div class="summary-meta">
        <div class="meta-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${escapeHtml(selectedTour.location || 'Đang cập nhật')}</span>
        </div>

        <div class="meta-item">
          <i class="far fa-clock"></i>
          <span>${escapeHtml(selectedTour.duration || 'Linh hoạt')}</span>
        </div>

        <div class="meta-item">
          <i class="fas fa-plane-departure"></i>
          <span>${escapeHtml(selectedTour.departure || 'Đang cập nhật')}</span>
        </div>

        <div class="meta-item">
          <i class="fas fa-tag"></i>
          <span>Đơn giá: <strong class="price-tag">${formatPrice(selectedTourPrice)}</strong> / người lớn</span>
        </div>
      </div>
    </div>
  `;

    renderIncludedList(selectedTour);
    document.getElementById('tourItinerary').style.display = 'block';

    setText('breakdownTourName', selectedTourName);
}

function renderIncludedList(tour) {
    const list = document.getElementById('includedList');
    if (!list) return;

    const includes = Array.isArray(tour.includes) && tour.includes.length
        ? tour.includes
        : [
            'Xe đưa đón theo lịch trình',
            'Khách sạn tiêu chuẩn',
            'Vé tham quan theo chương trình',
            'Hướng dẫn viên tiếng Việt',
            'Bảo hiểm du lịch'
        ];

    list.innerHTML = includes.map(item => `
    <li><i class="fas fa-check-circle inc-icon"></i> ${escapeHtml(item)}</li>
  `).join('');
}

/* =========================
   INIT FROM URL
========================= */

function initBookingFromUrl() {
    const params = new URLSearchParams(window.location.search);

    const adults = parseInt(params.get('adults'), 10);
    const children = parseInt(params.get('children'), 10);
    const meal = params.get('meal');
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');

    const adultsInput = document.getElementById('bookingGuests');
    const childrenInput = document.getElementById('bookingChildren');
    const mealSelect = document.getElementById('mealPlan');

    if (adultsInput && Number.isFinite(adults) && adults >= 1) {
        adultsInput.value = adults;
    }

    if (childrenInput && Number.isFinite(children) && children >= 0) {
        childrenInput.value = children;
    }

    if (mealSelect && meal && MEAL_PLANS[meal]) {
        mealSelect.value = meal;
        updateMealPlanDesc();
    }

    if (startDate) {
        selectedDate = parseFlexibleDate(startDate);
    }

    if (endDate) {
        selectedEndDate = parseFlexibleDate(endDate);
    }

    if (selectedDate) {
        const hiddenDate = document.getElementById('bookingDate');
        if (hiddenDate) hiddenDate.value = toInputDate(selectedDate);

        renderSelectedDateDisplay(selectedDate);
    }
}

/* =========================
   CALENDAR
========================= */

function initCalendar() {
    const baseDate = selectedDate || new Date();

    calYear = baseDate.getFullYear();
    calMonth = baseDate.getMonth();

    renderCalendar();
}

function changeCalMonth(delta) {
    calMonth += delta;

    if (calMonth > 11) {
        calMonth = 0;
        calYear += 1;
    }

    if (calMonth < 0) {
        calMonth = 11;
        calYear -= 1;
    }

    renderCalendar();
}

function renderCalendar() {
    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
        'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
        'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    setText('calMonthLabel', `${monthNames[calMonth]}, ${calYear}`);

    const grid = document.getElementById('calGrid');
    if (!grid) return;

    grid.innerHTML = '';

    ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].forEach(dayName => {
        const cell = document.createElement('div');
        cell.className = 'cal-day-name';
        cell.textContent = dayName;
        grid.appendChild(cell);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i += 1) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(calYear, calMonth, day);
        const isPast = date < today;
        const isFull = FULL_DAYS.includes(day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isSelected = selectedDate && sameDate(date, selectedDate);

        const cell = document.createElement('div');

        let cls = 'cal-day';
        if (isPast) cls += ' past';
        else if (isFull) cls += ' full';
        else if (isWeekend) cls += ' weekend';
        if (isSelected) cls += ' selected';

        cell.className = cls;

        const dayText = document.createElement('span');
        dayText.textContent = String(day);
        cell.appendChild(dayText);

        if (!isPast && !isFull) {
            const priceText = document.createElement('span');
            priceText.className = 'day-price';
            priceText.textContent = isWeekend ? '+10%' : 'Còn';
            cell.appendChild(priceText);

            cell.addEventListener('click', () => selectCalDate(date));
        }

        grid.appendChild(cell);
    }
}

function selectCalDate(date) {
    selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    selectedEndDate = calculateEndDateByDuration(selectedDate);

    const hiddenDate = document.getElementById('bookingDate');
    if (hiddenDate) hiddenDate.value = toInputDate(selectedDate);

    renderSelectedDateDisplay(selectedDate);
    renderCalendar();
    calculatePrice();
    triggerAISuggestion();
}

function renderSelectedDateDisplay(date) {
    const display = document.getElementById('selectedDateDisplay');
    const text = document.getElementById('selectedDateText');

    if (!display || !text) return;

    text.textContent = formatLongDate(date);
    display.style.display = 'flex';
}

function calculateEndDateByDuration(startDate) {
    const days = parseDurationDays(selectedTour?.duration || '');
    const end = new Date(startDate);
    end.setDate(end.getDate() + Math.max(days - 1, 0));
    return end;
}

function parseDurationDays(durationText) {
    const match = String(durationText || '').match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
}

/* =========================
   PRICE
========================= */

function calculatePrice() {
    const adults = getAdults();
    const children = getChildren();
    const mealPlanId = getMealPlanId();
    const meal = MEAL_PLANS[mealPlanId] || MEAL_PLANS.none;

    const isWeekend = selectedDate && [0, 6].includes(selectedDate.getDay());
    const basePrice = isWeekend
        ? Math.round(selectedTourPrice * 1.1)
        : selectedTourPrice;

    const childPrice = Math.round(basePrice * 0.7);

    const adultTotal = adults * (basePrice + meal.extra);
    const childTotal = children * (childPrice + meal.extra);
    const total = adultTotal + childTotal;

    setText('breakdownTourName', selectedTourName);
    setText('breakdownBasePrice', `${formatPrice(basePrice)}${isWeekend ? ' (+10% cuối tuần)' : ''}`);
    setText('breakdownAdults', `${adults} người`);
    setText('breakdownChildren', `${children} người`);
    setText('breakdownMeal', meal.extra > 0 ? `${meal.label} (+${formatPrice(meal.extra)}/khách)` : meal.label);
    setText('breakdownTotalPrice', formatPrice(total));

    const childrenRow = document.getElementById('childrenBreakdownRow');
    if (childrenRow) {
        childrenRow.style.display = children > 0 ? 'flex' : 'none';
    }

    const mealRow = document.getElementById('mealBreakdownRow');
    if (mealRow) {
        mealRow.style.display = meal.extra > 0 ? 'flex' : 'none';
    }

    return {
        adults,
        children,
        mealPlanId,
        mealLabel: meal.label,
        mealExtra: meal.extra,
        basePrice,
        childPrice,
        isWeekend,
        adultTotal,
        childTotal,
        total
    };
}

function updateMealPlanDesc() {
    const meal = MEAL_PLANS[getMealPlanId()] || MEAL_PLANS.none;
    setText('mealPlanDesc', meal.desc);
}

function getAdults() {
    const value = parseInt(document.getElementById('bookingGuests')?.value, 10);
    return Number.isFinite(value) && value >= 1 ? value : 1;
}

function getChildren() {
    const value = parseInt(document.getElementById('bookingChildren')?.value, 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
}

function getMealPlanId() {
    const value = document.getElementById('mealPlan')?.value || 'none';
    return MEAL_PLANS[value] ? value : 'none';
}

function normalizeNumberInput(id, min) {
    const input = document.getElementById(id);
    if (!input) return;

    const value = parseInt(input.value, 10);

    if (!Number.isFinite(value) || value < min) {
        input.value = min;
    }
}

/* =========================
   WIZARD
========================= */

function showStep(step) {
    document.querySelectorAll('.step-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const panel = document.getElementById(`step-${step}`);
    if (panel) panel.classList.add('active');

    currentStep = step;
    updateProgress(step);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function nextStep() {
    if (currentStep === 1) {
        if (!selectedTour || selectedTourPrice <= 0) {
            showAlert('Chưa chọn tour', 'Vui lòng chọn tour hợp lệ trước khi tiếp tục.', 'warning');
            return;
        }

        if (!selectedDate) {
            showAlert('Chưa chọn ngày', 'Vui lòng chọn ngày khởi hành trên lịch.', 'warning');
            return;
        }

        if (getAdults() < 1) {
            showAlert('Số khách không hợp lệ', 'Vui lòng nhập ít nhất 1 khách người lớn.', 'error');
            return;
        }

        showStep(2);
        return;
    }

    if (currentStep === 2) {
        if (validateCustomerForm()) {
            processBooking();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function updateProgress(step) {
    const fill = document.getElementById('progressBarFill');

    if (fill) {
        fill.style.width = `${((step - 1) / 2) * 100}%`;
    }

    document.querySelectorAll('.step-node').forEach(node => {
        const nodeStep = parseInt(node.dataset.step, 10);

        node.classList.remove('active', 'completed');

        if (nodeStep < step) {
            node.classList.add('completed');
        } else if (nodeStep === step) {
            node.classList.add('active');
        }
    });
}

/* =========================
   VALIDATION / SUBMIT
========================= */

function validateCustomerForm() {
    const name = document.getElementById('cusName')?.value.trim() || '';
    const phone = document.getElementById('cusPhone')?.value.trim() || '';
    const email = document.getElementById('cusEmail')?.value.trim() || '';

    if (!name) {
        showAlert('Thiếu họ tên', 'Vui lòng nhập đầy đủ họ và tên.', 'error');
        return false;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showAlert('SĐT không hợp lệ', 'Số điện thoại phải gồm đúng 10 chữ số.', 'error');
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAlert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email.', 'error');
        return false;
    }

    return true;
}

function processBooking() {
    const price = calculatePrice();

    const bookingCode = `AVI-${Math.floor(100000 + Math.random() * 900000)}`;
    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'card';

    const name = document.getElementById('cusName')?.value.trim() || '';
    const phone = document.getElementById('cusPhone')?.value.trim() || '';
    const email = document.getElementById('cusEmail')?.value.trim() || '';
    const note = document.getElementById('cusNote')?.value.trim() || '';

    const bookingData = {
        bookingCode,
        tourId: selectedTour?.id || null,
        tourName: selectedTourName,
        travelDate: selectedDate ? toInputDate(selectedDate) : '',
        endDate: selectedEndDate ? toInputDate(selectedEndDate) : '',
        adults: price.adults,
        children: price.children,
        mealPlan: price.mealPlanId,
        mealLabel: price.mealLabel,
        basePrice: price.basePrice,
        childPrice: price.childPrice,
        totalPayable: price.total,
        paymentMethod: payMethod,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        customerNote: note,
        timestamp: new Date().toISOString()
    };

    const bookings = safeJsonParse(localStorage.getItem('avivu_bookings')) || [];
    bookings.push(bookingData);
    localStorage.setItem('avivu_bookings', JSON.stringify(bookings));

    fillConfirmation(bookingData);

    showSuccess(bookingCode, selectedTourName, email);
}

function fillConfirmation(data) {
    setText('finalBookingCode', data.bookingCode);
    setText('cfTourName', data.tourName);
    setText('cfDate', data.travelDate ? formatDateFromInput(data.travelDate) : '—');
    setText('cfEndDate', data.endDate ? formatDateFromInput(data.endDate) : '—');
    setText('cfAdults', `${data.adults} người`);
    setText('cfChildren', `${data.children} trẻ em`);
    setText('cfName', data.customerName);
    setText('cfContact', `${data.customerPhone} | ${data.customerEmail}`);
    setText('cfPayMethod', PAY_METHOD_LABELS[data.paymentMethod] || data.paymentMethod);
    setText('cfTotal', formatPrice(data.totalPayable));
}

function showSuccess(code, tourName, email) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '🎉 Đặt tour thành công!',
            html: `
        Hành trình <strong>${escapeHtml(tourName)}</strong> đã được ghi nhận.<br><br>
        Mã đặt chỗ: <strong style="color:#FF6B35;">${code}</strong><br><br>
        <small style="color:#64748b;">Thông tin xác nhận sẽ được gửi tới <strong>${escapeHtml(email)}</strong></small>
      `,
            icon: 'success',
            confirmButtonColor: '#FF6B35',
            confirmButtonText: 'Xem xác nhận'
        }).then(() => showStep(3));
        return;
    }

    alert(`Đặt tour thành công! Mã đặt chỗ: ${code}`);
    showStep(3);
}

/* =========================
   ITINERARY TABS
========================= */

function switchItineraryTab(id, btn) {
    document.querySelectorAll('.itinerary-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.itinerary-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    btn.classList.add('active');

    const target = document.getElementById(`tab-${id}`);
    if (target) target.classList.add('active');
}

/* =========================
   AI SUGGESTION
========================= */

function triggerAISuggestion() {
    const box = document.getElementById('aiSuggestionBox');
    const text = document.getElementById('aiSuggestionText');

    if (!box || !text || !selectedDate) return;

    const month = selectedDate.getMonth() + 1;
    const adults = getAdults();
    const children = getChildren();
    const totalGuests = adults + children;

    let message = '';

    if (month >= 5 && month <= 8) {
        message += `☀️ <strong>Mùa hè tháng ${month}</strong> rất phù hợp với tour biển đảo như Hạ Long, Phú Quốc, Đà Nẵng - Hội An. `;
    } else if (month >= 10 || month <= 2) {
        message += `❄️ <strong>Thời tiết tháng ${month}</strong> thích hợp cho các hành trình săn mây, vùng cao, văn hóa bản địa. `;
    } else {
        message += `🌿 <strong>Tháng ${month}</strong> có khí hậu dễ chịu, phù hợp với tour di sản, sinh thái và nghỉ dưỡng. `;
    }

    if (totalGuests >= 10) {
        message += `👥 Đoàn ${totalGuests} khách nên ghi chú yêu cầu tour riêng để được tư vấn giá tốt hơn.`;
    } else if (totalGuests >= 4) {
        message += `🚐 Nhóm ${totalGuests} khách phù hợp với xe riêng hoặc gói gia đình để di chuyển thoải mái.`;
    } else if (totalGuests === 2) {
        message += `💑 Nhóm 2 người có thể ghi chú nếu muốn setup kỷ niệm, honeymoon hoặc phòng view đẹp.`;
    } else {
        message += `🎒 Du lịch một mình vẫn phù hợp với tour ghép, tiết kiệm chi phí và dễ kết bạn.`;
    }

    if (children > 0) {
        message += ` Có trẻ em đi cùng, bạn nên ghi chú độ tuổi để avivu hỗ trợ phòng nghỉ và lịch trình phù hợp.`;
    }

    text.innerHTML = message;
    box.style.display = 'block';
}

/* =========================
   HERO STARS
========================= */

function initHeroStars() {
    const container = document.getElementById('heroStars');

    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < 60; i += 1) {
        const star = document.createElement('div');
        const size = 1 + Math.random() * 2.5;

        star.className = 'hero-star';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 90}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${1.5 + Math.random() * 3}s`;
        star.style.animationDelay = `${Math.random() * 4}s`;

        container.appendChild(star);
    }
}

/* =========================
   HELPERS
========================= */

function formatPrice(value) {
    return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function formatLongDate(date) {
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatDateFromInput(value) {
    const date = parseFlexibleDate(value);
    return date ? formatLongDate(date) : value;
}

function toInputDate(date) {
    return date.toISOString().split('T')[0];
}

function parseFlexibleDate(value) {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [d, m, y] = value.split('/').map(Number);
        return new Date(y, m - 1, d);
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function sameDate(a, b) {
    return (
        a &&
        b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function safeJsonParse(value) {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function showAlert(title, text, icon = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title,
            text,
            icon,
            confirmButtonColor: '#FF6B35'
        });
        return;
    }

    alert(`${title}\n${text}`);
}
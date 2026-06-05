/**
 * avivu — tour-detail.js (v2)
 * Tác giả: Thành viên C
 * UPDATED: Thêm đánh giá khách hàng (viết được), ràng buộc ngày theo số ngày tour,
 *          khách lớn/trẻ em, khuyến mãi tháng 6, banner promo, tuỳ chọn gói ăn uống,
 *          lịch trình chi tiết theo gói.
 */
document.addEventListener('DOMContentLoaded', () => {
    // ── 0. CONSTANTS & PROMO ─────────────────────────────────────────
    const MEAL_PLANS = [
        { id: 'none', label: 'Không bao gồm ăn', extra: 0, desc: 'Quý khách tự túc ăn uống trong suốt hành trình.' },
        { id: 'full', label: 'Ăn đủ bữa (3 bữa/ngày)', extra: 180000, desc: 'Bữa sáng tại khách sạn, trưa & tối tại nhà hàng địa phương theo lịch trình.' },
        { id: 'luxury', label: 'Ăn sang trọng (5★)', extra: 480000, desc: 'Toàn bộ bữa ăn tại nhà hàng 5 sao, đặc sản cao cấp & buffet quốc tế.' }
    ];
    const CHILD_DISCOUNT_MONTH = 6;   // Tháng 6
    const CHILD_DISCOUNT_RATE = 0.6; // Giảm 60%
    const currentMonth = new Date().getMonth() + 1;
    const isPromoMonth = (currentMonth === CHILD_DISCOUNT_MONTH);

    // ── 1. ĐỌC ID TỪ URL ─────────────────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = parseInt(urlParams.get('id'));

    if (!tourId || typeof toursData === 'undefined') {
        alert('Không tìm thấy dữ liệu tour yêu cầu!');
        window.location.href = 'tours.html';
        return;
    }

    const currentTour = toursData.find(item => item.id === tourId);
    if (!currentTour) {
        alert('Sản phẩm tour này không tồn tại hệ thống!');
        window.location.href = 'tours.html';
        return;
    }

    // Lấy số ngày từ trường duration (vd: "4 ngày 3 đêm" → 4)
    const durationDays = parseDurationDays(currentTour.duration);

    const galleryImages = [
        currentTour.image,
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
    ];
    let activeImgIndex = 0;

    // ── 2. RENDER TẤT CẢ ─────────────────────────────────────────────
    renderTourDetails(currentTour);
    handleTabEvents();
    renderMealPlanOptions();
    initQuantityAndPrice(currentTour.price);
    initFlatpickrDate(durationDays);
    handleLightboxLogic(galleryImages);
    renderSystemRelatedTours(tourId, currentTour.category);
    initReviewForm(currentTour);

    // ── HELPER: parse số ngày ──────────────────────────────────────
    function parseDurationDays(durationStr) {
        const match = durationStr.match(/(\d+)\s*ngày/i);
        return match ? parseInt(match[1]) : 3;
    }

    // ── 4. RENDER CHI TIẾT TOUR ──────────────────────────────────────
    function renderTourDetails(tour) {
        document.getElementById('tour-title').innerText = tour.name;
        document.getElementById('breadcrumb-current').innerText = tour.name;
        document.getElementById('tour-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${tour.location}`;
        document.getElementById('tour-duration').style.display = 'none';
        document.getElementById('tour-departure').style.display = 'none';

        const starsHtml = buildStarsHtml(tour.rating);
        document.getElementById('tour-rating-top').innerHTML = `
            <div class="stars">${starsHtml}</div>
            <strong>${tour.rating}</strong> <span>(${tour.reviewCount} lượt phản hồi)</span>
        `;

        document.getElementById('tour-description').innerText = generateTourIntro(tour);
        renderQuickFacts(tour);
        renderSidebarTrustBadges();

        // Sidebar giá
        const basePrice = tour.price;
        document.getElementById('sidebar-price-text').innerText = basePrice.toLocaleString('vi-VN') + 'đ';
        document.getElementById('base-price-lbl').innerText = basePrice.toLocaleString('vi-VN') + 'đ';
        document.getElementById('total-price-lbl').innerText = basePrice.toLocaleString('vi-VN') + 'đ';

        // Gallery ảnh
        const mainImgTag = document.getElementById('main-img');
        mainImgTag.src = galleryImages[0];
        const thumbBox = document.getElementById('thumb-container');
        thumbBox.innerHTML = '';
        galleryImages.forEach((src, idx) => {
            const t = document.createElement('div');
            t.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
            t.innerHTML = `<img src="${src}" alt="img-${idx}">`;
            t.addEventListener('click', () => {
                document.querySelector('.thumb-item.active').classList.remove('active');
                t.classList.add('active');
                mainImgTag.src = src;
                activeImgIndex = idx;
            });
            thumbBox.appendChild(t);
        });

        // Tab Tổng quan
        document.getElementById('overview-content').innerHTML = `
    <div class="overview-section">
        <div class="overview-chip-list">
            ${tour.highlights.map(item => `
                <span><i class="fas fa-check-circle"></i> ${item}</span>
            `).join('')}
        </div>
    </div>

    <div class="overview-section">
        <h4>Dịch vụ bao gồm</h4>
        <div class="overview-card-grid">
            ${tour.includes.slice(0, 6).map(item => `
                <div class="overview-mini-card">
                    <i class="fas fa-circle-check"></i>
                    <span>${item}</span>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="overview-section">
        <h4>Lưu ý trước chuyến đi</h4>
        <div class="travel-note-grid">
            <div>
                <i class="fas fa-id-card"></i>
                <strong>Giấy tờ cá nhân</strong>
                <p>Mang theo CCCD/hộ chiếu và thông tin đặt tour khi khởi hành.</p>
            </div>
            <div>
                <i class="fas fa-suitcase-rolling"></i>
                <strong>Hành lý gọn nhẹ</strong>
                <p>Chuẩn bị trang phục phù hợp, kem chống nắng và vật dụng cá nhân.</p>
            </div>
            <div>
                <i class="fas fa-clock"></i>
                <strong>Đúng giờ tập trung</strong>
                <p>Có mặt trước giờ khởi hành 15–30 phút để làm thủ tục.</p>
            </div>
        </div>
    </div>
`;

        // Tab Lịch trình chi tiết theo gói (rendered by renderItinerary())
        renderItinerary(tour, 'none');

        // Tab Đánh giá
        document.getElementById('summary-score-num').innerText = tour.rating.toFixed(1);
        document.getElementById('summary-stars').innerHTML = starsHtml;
        document.getElementById('summary-count').innerText = `Dựa trên ${tour.reviewCount} lượt phản hồi`;
        renderDefaultReviews(tour);

        // Tab Chính sách
        document.getElementById('policies-content').innerHTML = `
            <div class="policy-section">
                <h5><i class="fas fa-check-circle" style="color:var(--primary)"></i> Giá tour bao gồm:</h5>
                <ul>${tour.includes.map(i => `<li>${i}</li>`).join('')}
                    <li>Bảo hiểm du lịch nội địa trọn gói.</li>
                    <li>Nước uống đóng chai phục vụ hằng ngày.</li>
                </ul>
            </div>
            <div class="policy-section" style="margin-top:1.5rem">
                <h5><i class="fas fa-times-circle" style="color:#ef4444"></i> Giá tour không bao gồm:</h5>
                <ul>
                    <li>Chi phí ăn uống cá nhân ngoài chương trình (nếu chọn gói không bao ăn).</li>
                    <li>Chi phí tham quan thêm ngoài lịch trình.</li>
                    <li>Phí visa (nếu đi nước ngoài).</li>
                    <li>Chi tiêu cá nhân, mua sắm.</li>
                </ul>
            </div>
            <div class="policy-section" style="margin-top:1.5rem">
                <h5><i class="fas fa-info-circle" style="color:#3b82f6"></i> Chính sách hủy tour:</h5>
                <ul>
                    <li>Hủy trước 15 ngày: hoàn 90% giá trị tour.</li>
                    <li>Hủy trước 7–14 ngày: hoàn 70% giá trị tour.</li>
                    <li>Hủy trước 3–6 ngày: hoàn 50% giá trị tour.</li>
                    <li>Hủy dưới 3 ngày hoặc không đến: không hoàn tiền.</li>
                </ul>
            </div>
        `;
    }

    function renderQuickFacts(tour) {
        const meta = document.querySelector('.detail-meta');
        if (!meta || document.querySelector('.quick-facts')) return;

        const facts = document.createElement('div');
        facts.className = 'quick-facts';
        facts.innerHTML = `
            <div class="quick-fact">
                <i class="fas fa-calendar-check"></i>
                <small>Thời lượng</small>
                <strong>${tour.duration}</strong>
            </div>
            <div class="quick-fact">
                <i class="fas fa-plane-departure"></i>
                <small>Khởi hành</small>
                <strong>${tour.departure}</strong>
            </div>
            <div class="quick-fact">
                <i class="fas fa-layer-group"></i>
                <small>Danh mục</small>
                <strong>${getCategoryLabel(tour.category)}</strong>
            </div>
        `;

        meta.insertAdjacentElement('afterend', facts);
    }

    function renderSidebarTrustBadges() {
        const form = document.getElementById('booking-sidebar-form');
        if (!form || document.querySelector('.sidebar-trust-list')) return;

        const trust = document.createElement('div');
        trust.className = 'sidebar-trust-list';
        trust.innerHTML = `
            <span><i class="fas fa-check-circle"></i> Xác nhận trong 24h</span>
            <span><i class="fas fa-shield-alt"></i> Không phát sinh chi phí ẩn</span>
            <span><i class="fas fa-headset"></i> Hỗ trợ khách hàng 24/7</span>
            <span><i class="fas fa-rotate-left"></i> Hoàn tiền theo chính sách</span>
        `;

        form.appendChild(trust);
    }

    function getCategoryLabel(category) {
        const labels = {
            'bien-dao': 'Biển & Đảo',
            'nui-trekking': 'Núi & Trekking',
            'van-hoa': 'Văn hóa & Di sản',
            'sinh-thai': 'Sinh thái',
            'le-hoi': 'Lễ hội',
            'gia-dinh': 'Gia đình',
            'phuot': 'Phượt & Mạo hiểm'
        };

        return labels[category] || 'Tour du lịch';
    }

    // ── 5. LỊCH TRÌNH CHI TIẾT THEO GÓI ĂN ─────────────────────────
    function renderItinerary(tour, mealPlanId) {
        const plan = MEAL_PLANS.find(p => p.id === mealPlanId) || MEAL_PLANS[0];
        const box = document.getElementById('itinerary-list');
        const days = durationDays;

        // Tạo lịch trình mẫu chi tiết cho từng ngày
        const itineraryData = generateDetailedItinerary(tour, days, plan.id);

        box.innerHTML = itineraryData.map((day, idx) => `
            <div class="timeline-node">
                <div class="node-day">Ngày ${idx + 1}</div>
                <div class="node-body">
                    <h4>${day.title}</h4>
                    ${day.content}
                </div>
            </div>
        `).join('');
    }

    function generateDetailedItinerary(tour, days, mealId) {
        const loc = tour.location;
        const hl = tour.highlights || [];
        const result = [];

        // Gói ăn: mô tả bữa ăn theo từng loại
        const mealDesc = {
            none: {
                morning: '',
                lunch: '<li><i class="fas fa-utensils"></i> <strong>Bữa trưa:</strong> Quý khách tự túc tại các nhà hàng địa phương hoặc quán ăn ven đường.</li>',
                dinner: '<li><i class="fas fa-utensils"></i> <strong>Bữa tối:</strong> Tự do khám phá ẩm thực về đêm tại địa phương.</li>',
                note: '⚠️ Gói này không bao gồm bữa ăn. Chi phí ăn uống tự túc.'
            },
            full: {
                morning: '<li><i class="fas fa-coffee"></i> <strong>Bữa sáng:</strong> Tại khách sạn — buffet sáng với bánh mì, phở, trứng chiên, hoa quả tươi.</li>',
                lunch: '<li><i class="fas fa-utensils"></i> <strong>Bữa trưa:</strong> Nhà hàng địa phương — thực đơn đặc sản vùng miền, cơm phần đầy đủ dinh dưỡng.</li>',
                dinner: '<li><i class="fas fa-moon"></i> <strong>Bữa tối:</strong> Nhà hàng theo lịch trình — thực đơn hải sản / lẩu / nướng theo vùng.</li>',
                note: '✅ Tất cả bữa ăn được sắp xếp và thanh toán trong gói tour.'
            },
            luxury: {
                morning: '<li><i class="fas fa-coffee"></i> <strong>Bữa sáng sang trọng:</strong> Buffet quốc tế 5★ tại khách sạn — phục vụ tại bàn, thực đơn Á Âu phong phú.</li>',
                lunch: '<li><i class="fas fa-utensils"></i> <strong>Bữa trưa cao cấp:</strong> Nhà hàng 5★ với thực đơn đặc sản cao cấp được chọn lọc — tôm hùm, hải sản tươi sống.</li>',
                dinner: '<li><i class="fas fa-star"></i> <strong>Bữa tối sang trọng:</strong> Nhà hàng fine-dining view đẹp, thực đơn Chefs Selection, rượu vang nhập khẩu.</li>',
                note: '🌟 Gói ăn sang trọng: toàn bộ bữa ăn tại nhà hàng cao cấp.'
            }
        };
        const md = mealDesc[mealId] || mealDesc['none'];

        // Ngày 1: Khởi hành
        result.push({
            title: `Khởi hành → ${loc} | Nhận phòng & Nghỉ ngơi`,
            content: `<ul class="itinerary-detail-list">
                <li><i class="fas fa-clock"></i> <strong>05:30 – 06:00:</strong> Hướng dẫn viên đón đoàn tại điểm hẹn. Kiểm tra danh sách, phát tài liệu tour và hướng dẫn các quy định an toàn hành trình.</li>
                <li><i class="fas fa-bus"></i> <strong>06:00 – 09:00:</strong> Xe khởi hành, hướng dẫn viên giới thiệu tổng quan về ${loc} — văn hóa, ẩm thực, những điểm cần lưu ý.</li>
                <li><i class="fas fa-map-marker-alt"></i> <strong>09:00 – 11:00:</strong> Đến nơi, làm thủ tục check-in khách sạn. Quý khách nghỉ ngơi, tắm rửa, thay đồ.</li>
                ${md.morning}
                <li><i class="fas fa-walking"></i> <strong>14:00 – 17:00:</strong> Khám phá sơ bộ khu vực trung tâm — dạo phố, check-in địa điểm nổi tiếng gần khách sạn.</li>
                ${md.dinner}
                <li><i class="fas fa-bed"></i> <strong>21:00:</strong> Nghỉ đêm tại khách sạn. Tự do khám phá không khí về đêm.</li>
            </ul>
            <div class="itinerary-note"><i class="fas fa-info-circle"></i> ${md.note}</div>`
        });

        // Ngày giữa: tham quan chính
        for (let d = 2; d < days; d++) {
            const highlight = hl[(d - 2) % hl.length] || loc;
            const highlight2 = hl[(d - 1) % hl.length] || loc;
            result.push({
                title: `Ngày ${d} — Khám phá ${highlight}`,
                content: `<ul class="itinerary-detail-list">
                    ${md.morning}
                    <li><i class="fas fa-camera"></i> <strong>08:00 – 11:30:</strong> Tham quan <strong>${highlight}</strong> — tìm hiểu lịch sử, chụp ảnh lưu niệm. Hướng dẫn viên kể chuyện văn hoá và truyền thuyết địa phương.</li>
                    ${md.lunch}
                    <li><i class="fas fa-binoculars"></i> <strong>13:30 – 17:00:</strong> Tiếp tục khám phá <strong>${highlight2}</strong>. ${mealId === 'luxury' ? 'Trải nghiệm tour VIP với xe điện hoặc thuyền riêng.' : 'Tự do chụp ảnh và mua sắm nhỏ.'}</li>
                    <li><i class="fas fa-shopping-bag"></i> <strong>17:00 – 18:30:</strong> Ghé chợ địa phương, mua quà lưu niệm và đặc sản vùng miền.</li>
                    ${md.dinner}
                    <li><i class="fas fa-bed"></i> <strong>21:00:</strong> Trả phòng hoặc tiếp tục nghỉ tại khách sạn.</li>
                </ul>
                <div class="itinerary-note"><i class="fas fa-lightbulb"></i> ${mealId === 'luxury' ? 'Gói sang trọng: hướng dẫn viên riêng phục vụ cả ngày, xe đưa đón cao cấp.' : mealId === 'full' ? 'Mọi bữa ăn trong ngày đã được sắp xếp sẵn theo lịch.' : 'Quý khách chủ động kế hoạch ăn uống. Hướng dẫn viên sẽ gợi ý nhà hàng ngon.'}</div>`
            });
        }

        // Ngày cuối: mua sắm & trở về
        result.push({
            title: `Ngày ${days} — Mua sắm đặc sản & Trở về`,
            content: `<ul class="itinerary-detail-list">
                ${md.morning}
                <li><i class="fas fa-store"></i> <strong>09:00 – 11:00:</strong> Tự do mua sắm tại chợ đêm hoặc khu phố cổ — đặc sản khô, quà lưu niệm, thổ cẩm địa phương.</li>
                ${md.lunch}
                <li><i class="fas fa-sign-out-alt"></i> <strong>13:00:</strong> Làm thủ tục trả phòng, tập kết hành lý.</li>
                <li><i class="fas fa-bus-alt"></i> <strong>14:00:</strong> Xe khởi hành về điểm xuất phát ${tour.departure}. Hướng dẫn viên tổng kết hành trình.</li>
                <li><i class="fas fa-home"></i> <strong>17:00 – 19:00:</strong> Về đến điểm hẹn ban đầu. Kết thúc chương trình tour. Hẹn gặp lại quý khách trong những hành trình tiếp theo!</li>
            </ul>
            <div class="itinerary-note"><i class="fas fa-heart"></i> Cảm ơn quý khách đã tin tưởng và đồng hành cùng avivu!</div>`
        });

        return result;
    }

    // ── 6. TUỲ CHỌN GÓI ĂN UỐNG ─────────────────────────────────────
    function renderMealPlanOptions() {
        const firstFormItem = document.querySelector('.form-item');
        if (!firstFormItem) return;

        const mealSection = document.createElement('div');
        mealSection.className = 'meal-plan-section form-item';
        mealSection.innerHTML = `
            <label><i class="fas fa-utensils" style="color:var(--primary)"></i> Tuỳ chọn gói ăn uống</label>
            <select id="meal-plan-select" class="meal-plan-select" aria-label="Chọn gói ăn uống">
                ${MEAL_PLANS.map(p => `
                    <option value="${p.id}">${p.label} ${p.extra === 0 ? '(Miễn phí)' : '(+' + p.extra.toLocaleString('vi-VN') + 'đ/khách)'}</option>
                `).join('')}
            </select>
            <p class="meal-plan-help" id="meal-plan-desc-text">${MEAL_PLANS[0].desc}</p>
        `;
        firstFormItem.insertAdjacentElement('beforebegin', mealSection);

        const mealSelect = document.getElementById('meal-plan-select');
        mealSelect.addEventListener('change', () => {
            updateMealPlanDescription(mealSelect.value);
            recalcTotal();
            renderItinerary(currentTour, mealSelect.value);
        });
    }

    function updateMealPlanDescription(planId) {
        const plan = MEAL_PLANS.find(p => p.id === planId) || MEAL_PLANS[0];
        const descEl = document.getElementById('meal-plan-desc-text');
        if (descEl) descEl.innerText = plan.desc;
    }

    // ── 7. SỐ LƯỢNG KHÁCH & TÍNH TIỀN ───────────────────────────────
    function initQuantityAndPrice(basePrice) {
        // Thêm input trẻ em vào sidebar
        const qtyFormItem = document.querySelector('#qty-count')?.closest('.form-item');
        if (qtyFormItem) {
            qtyFormItem.querySelector('label').innerHTML = '<i class="fas fa-user" style="color:var(--primary)"></i> Khách người lớn';

            const childItem = document.createElement('div');
            childItem.className = 'form-item';
            childItem.innerHTML = `
                <label>
                    <i class="fas fa-child" style="color:var(--primary)"></i> Khách trẻ em (dưới 12 tuổi)
                    ${isPromoMonth ? '<span class="child-promo-tag">🎉 -60% T6</span>' : ''}
                </label>
                <div class="quantity-control">
                    <button type="button" class="ctrl-btn" id="minus-child">-</button>
                    <input type="number" id="qty-child" value="0" min="0" max="20" readonly>
                    <button type="button" class="ctrl-btn" id="plus-child">+</button>
                </div>
            `;
            qtyFormItem.insertAdjacentElement('afterend', childItem);

            // Thêm dòng trẻ em vào invoice
            const invoiceSummary = document.querySelector('.invoice-summary');
            if (invoiceSummary) {
                const childRow = document.createElement('div');
                childRow.className = 'invoice-row';
                childRow.id = 'child-price-row';
                childRow.style.display = 'none';
                childRow.innerHTML = `
                    <span id="child-price-lbl-left">Trẻ em (0 khách${isPromoMonth ? ' ×−60%' : ''})</span>
                    <span id="child-price-lbl">0đ</span>
                `;
                const totalRow = invoiceSummary.querySelector('.total-row');
                if (totalRow) totalRow.insertAdjacentElement('beforebegin', childRow);

                // Thêm dòng gói ăn
                const mealRow = document.createElement('div');
                mealRow.className = 'invoice-row';
                mealRow.id = 'meal-price-row';
                mealRow.style.display = 'none';
                mealRow.innerHTML = `<span id="meal-price-lbl-left">Gói ăn</span><span id="meal-price-lbl">0đ</span>`;
                if (totalRow) totalRow.insertAdjacentElement('beforebegin', mealRow);
            }
        }

        // Event listeners
        document.getElementById('minus-user').addEventListener('click', () => adjustQty('qty-count', -1));
        document.getElementById('plus-user').addEventListener('click', () => adjustQty('qty-count', +1));
        document.getElementById('minus-child').addEventListener('click', () => adjustQty('qty-child', -1));
        document.getElementById('plus-child').addEventListener('click', () => adjustQty('qty-child', +1));
    }

    function adjustQty(inputId, delta) {
        const input = document.getElementById(inputId);
        if (!input) return;
        let val = parseInt(input.value) + delta;
        val = Math.max(0, Math.min(20, val));
        if (inputId === 'qty-count') val = Math.max(1, val); // tối thiểu 1 người lớn
        input.value = val;
        recalcTotal();
    }

    function recalcTotal() {
        const base = currentTour.price;
        const adults = parseInt(document.getElementById('qty-count')?.value || 1);
        const children = parseInt(document.getElementById('qty-child')?.value || 0);
        const mealSelect = document.getElementById('meal-plan-select');
        const mealPlanId = mealSelect ? mealSelect.value : 'none';
        const mealExtra = MEAL_PLANS.find(p => p.id === mealPlanId)?.extra || 0;

        const childRate = isPromoMonth ? (1 - CHILD_DISCOUNT_RATE) : 0.7; // 40% nếu T6, 70% thường
        const childPrice = Math.round(base * childRate);

        const adultTotal = adults * (base + mealExtra);
        const childTotal = children * (childPrice + mealExtra);
        const grandTotal = adultTotal + childTotal;

        // Cập nhật labels
        document.getElementById('base-price-lbl').innerText = (base + mealExtra).toLocaleString('vi-VN') + 'đ';
        document.getElementById('total-price-lbl').innerText = grandTotal.toLocaleString('vi-VN') + 'đ';

        // Dòng trẻ em
        const childRow = document.getElementById('child-price-row');
        if (childRow) {
            if (children > 0) {
                childRow.style.display = 'flex';
                const childLabel = isPromoMonth ? ` ×−60%` : ' ×−30%';
                document.getElementById('child-price-lbl-left').innerText = `Trẻ em (${children} khách${childLabel})`;
                document.getElementById('child-price-lbl').innerText = childTotal.toLocaleString('vi-VN') + 'đ';
            } else {
                childRow.style.display = 'none';
            }
        }

        // Dòng gói ăn
        const mealRow = document.getElementById('meal-price-row');
        if (mealRow) {
            if (mealExtra > 0) {
                mealRow.style.display = 'flex';
                const planName = MEAL_PLANS.find(p => p.id === mealPlanId)?.label || 'Gói ăn';
                document.getElementById('meal-price-lbl-left').innerText = planName;
                document.getElementById('meal-price-lbl').innerText = (mealExtra * (adults + children)).toLocaleString('vi-VN') + 'đ';
            } else {
                mealRow.style.display = 'none';
            }
        }
    }

    // ── 8. DATEPICKER FLATPICKR CÓ RÀNG BUỘC SỐ NGÀY ────────────────
    function initFlatpickrDate(numDays) {
        const endInput = document.getElementById('booking-end-date');
        endInput.readOnly = true;
        endInput.style.background = '#f1f5f9';
        endInput.style.cursor = 'not-allowed';
        endInput.placeholder = `Tự động (${numDays} ngày)`;
        endInput.title = `Ngày kết thúc được tính tự động dựa trên thời gian tour: ${numDays} ngày`;

        flatpickr('#booking-date', {
            minDate: 'today',
            dateFormat: 'd/m/Y',
            onChange(selectedDates) {
                if (selectedDates.length > 0) {
                    const start = selectedDates[0];
                    const end = new Date(start);
                    end.setDate(end.getDate() + (numDays - 1));
                    const dd = String(end.getDate()).padStart(2, '0');
                    const mm = String(end.getMonth() + 1).padStart(2, '0');
                    const yyyy = end.getFullYear();
                    endInput.value = `${dd}/${mm}/${yyyy}`;
                    endInput.style.color = '#0d1b2a';
                    endInput.style.fontWeight = '600';
                }
            }
        });
    }

    // ── 9. ĐÁNH GIÁ MẶC ĐỊNH & FORM VIẾT ĐÁNH GIÁ ──────────────────
    function renderDefaultReviews(tour) {
        const samples = [
            { name: 'Nguyễn Văn Nam', rating: 5, date: '2 tuần trước', text: 'Tour tổ chức rất tốt, dịch vụ ăn uống và phòng ốc sạch sẽ chuẩn chỉ. Anh hướng dẫn viên cực kỳ nhiệt tình và am hiểu văn hóa địa phương sâu sắc.' },
            { name: 'Trần Thị Mai', rating: 4, date: '1 tháng trước', text: 'Chuyến đi rất đáng tiền! Cảnh đẹp, ăn ngon. Chỉ tiếc là lịch trình hơi dày, mong lần sau có thêm thời gian tự do hơn.' },
            { name: 'Lê Hoàng Phúc', rating: 5, date: '3 tuần trước', text: 'Đây là lần thứ 3 tôi đặt tour của avivu, lần nào cũng hài lòng. Xe đẹp, khách sạn tốt, ăn uống ngon. Sẽ tiếp tục ủng hộ!' },
        ];
        const listEl = document.getElementById('comments-list');
        listEl.innerHTML = samples.map(r => `
            <div class="review-comment-card">
                <div class="user-avatar">${r.name[0]}</div>
                <div class="user-info-body">
                    <div class="comment-heading">
                        <h5>${r.name}</h5>
                        <small>${r.date}</small>
                    </div>
                    <div class="stars">${buildStarsHtml(r.rating)}</div>
                    <p class="comment-p">${r.text}</p>
                </div>
            </div>
        `).join('');
    }

    function initReviewForm(tour) {
        const reviewsPane = document.getElementById('tab-reviews');
        const formHtml = `
            <div class="write-review-section">
                <h4 class="write-review-title"><i class="fas fa-pen"></i> Viết đánh giá của bạn</h4>
                <div class="star-picker" id="star-picker">
                    ${[1, 2, 3, 4, 5].map(i => `<i class="far fa-star" data-star="${i}"></i>`).join('')}
                    <span class="star-picker-label" id="star-label">Chọn số sao</span>
                </div>
                <div id="form-error" class="review-form-error" style="display:none"></div>
                <textarea id="review-text" class="review-textarea" placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi này..."></textarea>
                <div class="review-form-row">
                    <input type="text" id="reviewer-name" class="review-name-input" placeholder="Tên của bạn (bắt buộc)">
                    <button type="button" class="btn btn-primary review-submit-btn" id="review-submit-btn">
                        <i class="fas fa-paper-plane"></i> Gửi đánh giá
                    </button>
                </div>
            </div>
        `;
        reviewsPane.insertAdjacentHTML('beforeend', formHtml);

        // Star picker
        let selectedStars = 0;
        const starIcons = document.querySelectorAll('#star-picker i');
        const starLabel = document.getElementById('star-label');
        const starLabels = ['', 'Tệ', 'Không hài lòng', 'Bình thường', 'Tốt', 'Tuyệt vời!'];

        starIcons.forEach(icon => {
            icon.addEventListener('mouseenter', () => highlightStars(parseInt(icon.dataset.star)));
            icon.addEventListener('mouseleave', () => highlightStars(selectedStars));
            icon.addEventListener('click', () => {
                selectedStars = parseInt(icon.dataset.star);
                highlightStars(selectedStars);
                starLabel.textContent = starLabels[selectedStars];
                starLabel.style.color = selectedStars >= 4 ? 'var(--primary)' : '#94a3b8';
            });
        });

        function highlightStars(count) {
            starIcons.forEach((s, i) => {
                s.className = i < count ? 'fas fa-star' : 'far fa-star';
            });
        }

        // Submit
        document.getElementById('review-submit-btn').addEventListener('click', () => {
            const name = document.getElementById('reviewer-name').value.trim();
            const text = document.getElementById('review-text').value.trim();
            const errorEl = document.getElementById('form-error');

            if (!name) { showError(errorEl, 'Vui lòng nhập tên của bạn.'); return; }
            if (selectedStars === 0) { showError(errorEl, 'Vui lòng chọn số sao đánh giá.'); return; }
            if (text.length < 10) { showError(errorEl, 'Đánh giá phải có ít nhất 10 ký tự.'); return; }

            errorEl.style.display = 'none';

            const newCard = document.createElement('div');
            newCard.className = 'review-comment-card review-new';
            newCard.innerHTML = `
                <div class="user-avatar">${name[0].toUpperCase()}</div>
                <div class="user-info-body">
                    <div class="comment-heading">
                        <h5>${escapeHtml(name)}</h5>
                        <small>Vừa xong</small>
                    </div>
                    <div class="stars">${buildStarsHtml(selectedStars)}</div>
                    <p class="comment-p">${escapeHtml(text)}</p>
                    <span class="review-new-badge"><i class="fas fa-check-circle"></i> Đánh giá mới</span>
                </div>
            `;

            const commentsList = document.getElementById('comments-list');
            commentsList.insertBefore(newCard, commentsList.firstChild);

            // Reset form
            document.getElementById('reviewer-name').value = '';
            document.getElementById('review-text').value = '';
            selectedStars = 0;
            highlightStars(0);
            starLabel.textContent = 'Chọn số sao';

            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    function showError(el, msg) {
        el.style.display = 'block';
        el.textContent = msg;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── 10. TABS ──────────────────────────────────────────────────────
    function handleTabEvents() {
        const btns = document.querySelectorAll('.tab-btn');
        const panes = document.querySelectorAll('.tab-pane');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
            });
        });
    }

    // ── 11. LIGHTBOX ─────────────────────────────────────────────────
    function handleLightboxLogic(imagesArr) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img-source');
        const trigger = document.getElementById('trigger-lightbox');
        const closeBtn = document.getElementById('lightbox-close');

        trigger.addEventListener('click', () => {
            lightbox.classList.add('active');
            lightboxImg.src = imagesArr[activeImgIndex];
        });
        closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
        document.getElementById('lightbox-next').addEventListener('click', () => {
            activeImgIndex = (activeImgIndex + 1) % imagesArr.length;
            lightboxImg.src = imagesArr[activeImgIndex];
        });
        document.getElementById('lightbox-prev').addEventListener('click', () => {
            activeImgIndex = (activeImgIndex - 1 + imagesArr.length) % imagesArr.length;
            lightboxImg.src = imagesArr[activeImgIndex];
        });
        lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('active'); });
    }

    // ── 12. TOUR LIÊN QUAN ───────────────────────────────────────────
    function renderSystemRelatedTours(currentId, category) {
        let list = toursData.filter(t => t.category === category && t.id !== currentId);
        if (list.length === 0) list = toursData.filter(t => t.id !== currentId);
        const matched = list.sort(() => 0.5 - Math.random()).slice(0, 3);
        const container = document.getElementById('related-tours-container');
        container.innerHTML = '';
        matched.forEach(t => {
            const badgeHtml = t.badge ? `<span class="tour-badge badge-${t.badgeType}">${t.badge}</span>` : '';
            const shortDesc = t.description || `${t.location} — ${t.duration}. Trải nghiệm ${t.highlights.slice(0, 2).join(', ')}.`;
            const card = document.createElement('div');
            card.className = 'tour-item';
            card.innerHTML = `
                <div class="card-img">
                    <img src="${t.image}" alt="${t.name}">
                    ${badgeHtml}
                    <button class="card-wishlist"><i class="far fa-heart"></i></button>
                </div>
                <div class="card-body">
                    <div class="card-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${t.location}</span>
                        <div class="rating"><i class="fas fa-star"></i> <strong>${t.rating}</strong></div>
                    </div>
                    <h3 class="card-title"><a href="tour-detail.html?id=${t.id}">${t.name}</a></h3>
                    <p class="card-desc">${shortDesc}</p>
                    <div class="card-info">
                        <span><i class="fas fa-clock"></i> ${t.duration}</span>
                        <span><i class="fas fa-plane"></i> ${t.departure}</span>
                    </div>
                    <div class="card-footer">
                        <div class="card-price"><small>Giá từ</small><strong>${t.price.toLocaleString('vi-VN')}đ</strong></div>
                        <a href="tour-detail.html?id=${t.id}" class="card-btn">Xem chi tiết <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ── 13. FORM SUBMIT ──────────────────────────────────────────────
    document.getElementById('booking-sidebar-form').addEventListener('submit', e => {
        e.preventDefault();
        const startDate = document.getElementById('booking-date').value;
        const endDate = document.getElementById('booking-end-date').value;
        const adults = document.getElementById('qty-count').value;
        const children = document.getElementById('qty-child')?.value || 0;
        const mealPlan = document.getElementById('meal-plan-select')?.value || 'none';

        if (!startDate) { alert('Vui lòng chọn ngày khởi hành.'); return; }
        window.location.href = `booking.html?id=${tourId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&adults=${adults}&children=${children}&meal=${mealPlan}`;
    });

    // ── UTILS ────────────────────────────────────────────────────────
    function buildStarsHtml(rating) {
        const floor = Math.floor(rating);
        let html = '';
        for (let i = 1; i <= 5; i++) html += `<i class="${i <= floor ? 'fas' : 'far'} fa-star"></i>`;
        return html;
    }

    function generateTourIntro(tour) {
        const h = tour.highlights.slice(0, 3).join(', ');
        return `${tour.name} là hành trình khám phá ${tour.location} trong ${tour.duration}. Tour bao gồm ${h} và đưa bạn trải nghiệm ẩm thực, văn hóa địa phương cùng dịch vụ chất lượng.`;
    }
});
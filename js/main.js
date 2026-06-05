/**
 * AVIVU — main.js
 * Tác giả: Thành viên A (Trưởng nhóm)
 * Chức năng: Navbar, back-to-top, counter, render featured tours, search
 */

// ── KHỞI TẠO AOS ───────────────────────────────────────────────
AOS.init({ duration: 700, once: true, offset: 60 });

// Đóng menu khi click link
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ── BACK TO TOP ─────────────────────────────────────────────────
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── COUNTER ANIMATION ───────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString('vi-VN');
  }, 16);
}

// Trigger khi scroll vào stats section
const statsSection = document.getElementById('stats');
let counted = false;
const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    document.querySelectorAll('.stat-number').forEach(animateCounter);
  }
}, { threshold: 0.3 });
if (statsSection) statsObserver.observe(statsSection);

// ── HERO SEARCH FORM ────────────────────────────────────────────
const heroSearchForm = document.getElementById('heroSearchForm');
if (heroSearchForm) {
  heroSearchForm.addEventListener('submit', e => {
    e.preventDefault();
    const dest   = document.getElementById('searchDest').value;
    const date   = document.getElementById('searchDate').value;
    const guests = document.getElementById('searchGuests').value;
    const params = new URLSearchParams({ dest, date, guests });
    window.location.href = `pages/tours.html?${params.toString()}`;
  });
  // Set min date = today
  const dateInput = document.getElementById('searchDate');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
}

// ── NEWSLETTER FORM ─────────────────────────────────────────────
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    alert(`✅ Cảm ơn! Email "${email}" đã được đăng ký nhận ưu đãi.`);
    newsletterForm.reset();
  });
}

// ── HELPER ĐƯỜNG DẪN ẢNH TOUR ────────────────────────────────────────
function resolveTourImagePath(imagePath) {
  if (!imagePath) return '';
  if (/^(https?:\/\/|\/)/.test(imagePath)) return imagePath;

  // Trang chủ index.html tải tours-data.js từ thư mục gốc,
  // còn các trang trong pages/ dùng ../assets/... đúng.
  if (!window.location.pathname.includes('/pages/')) {
    return imagePath.replace(/^\.\.\//, '');
  }

  return imagePath;
}

// ── RENDER FEATURED TOURS ────────────────────────────────────────
// Lấy 6 tour đầu từ tours-data.js để hiển thị trên trang chủ
function renderFeaturedTours() {
  const grid = document.getElementById('featuredToursGrid');
  if (!grid || typeof toursData === 'undefined') return;

  const featured = toursData.slice(0, 6);
  grid.innerHTML = featured.map(tour => {
    const imageSrc = resolveTourImagePath(tour.image);
    return `
    <div class="tour-card" data-aos="fade-up">
      <div class="card-img-wrap">
        <img src="${imageSrc}" alt="${tour.name}" loading="lazy" />
        ${tour.badge ? `<span class="card-badge badge badge-${tour.badgeType}">${tour.badge}</span>` : ''}
        <button class="card-wishlist" aria-label="Yêu thích"><i class="far fa-heart"></i></button>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="location"><i class="fas fa-map-marker-alt"></i>${tour.location}</span>
          <div class="rating">
            <span class="stars">★</span>
            <strong>${tour.rating}</strong>
            <span>(${tour.reviewCount})</span>
          </div>
        </div>
        <h3 class="card-title">${tour.name}</h3>
        <div class="card-info">
          <span><i class="fas fa-clock"></i>${tour.duration}</span>
          <span><i class="fas fa-user-friends"></i>${tour.departure}</span>
        </div>
        <div class="card-footer">
          <div class="card-price">
            <small>Giá từ</small>
            <strong>${tour.price.toLocaleString('vi-VN')}đ</strong>
          </div>
          <a href="pages/tour-detail.html?id=${tour.id}" class="card-btn">
            Xem chi tiết <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `;
  }).join('');

  // Re-trigger AOS cho card mới
  AOS.refresh();
}

// Wishlist toggle
document.addEventListener('click', e => {
  if (e.target.closest('.card-wishlist')) {
    const btn = e.target.closest('.card-wishlist');
    const icon = btn.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    btn.style.color = icon.classList.contains('fas') ? '#E53E3E' : '';
  }
});

// Chuyển trang tours với filter danh mục
function goToTours(category) {
  window.location.href = `pages/tours.html?cat=${category}`;
}

// Chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  renderUserNav();
  initNavbar();
  initHamburger();
  initAccountDropdown();
  initActiveNavLink();

  renderFeaturedTours();
});
// ── NAVBAR / AUTH UI ───────────────────────────────────────────
function getBasePath() {
  return window.location.pathname.includes('/pages/') ? '' : 'pages/';
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
}

function renderUserNav() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  const basePath = getBasePath();
  const user = getCurrentUser();

  if (!user) {
    navActions.innerHTML = `
      <a href="${basePath}login.html?tab=register" class="btn-register">
        <i class="fas fa-user-plus"></i>
        <span>Đăng ký</span>
      </a>

      <a href="${basePath}login.html" class="btn-login" id="loginBtn">
        <i class="fas fa-user"></i>
        <span id="loginBtnText">Đăng nhập</span>
      </a>

      <button class="hamburger" id="hamburger" aria-label="Mở menu">
        <span></span><span></span><span></span>
      </button>
    `;
    return;
  }

  const displayName = user.name
    ? user.name.trim().split(' ').slice(-1)[0]
    : 'Tài khoản';

  navActions.innerHTML = `
    <a href="#" class="nav-icon-btn" id="favoriteBtn">
      <i class="fas fa-heart"></i>
      <span>Yêu thích</span>
    </a>

    <div class="account-menu">
      <button class="account-btn" type="button" id="accountBtn">
        <i class="fas fa-user-circle"></i>
        <span>${displayName}</span>
        <i class="fas fa-chevron-down"></i>
      </button>

      <div class="account-dropdown" id="accountDropdown">
        <a href="#">
          <i class="fas fa-user"></i>
          Thông tin tài khoản
        </a>

        <a href="#">
          <i class="fas fa-ticket-alt"></i>
          Đơn đặt tour
        </a>

        <a href="#" id="favoriteMenuBtn">
          <i class="fas fa-heart"></i>
          Mục yêu thích
        </a>

        <button type="button" id="logoutBtn">
          <i class="fas fa-sign-out-alt"></i>
          Đăng xuất
        </button>
      </div>
    </div>

    <button class="hamburger" id="hamburger" aria-label="Mở menu">
      <span></span><span></span><span></span>
    </button>
  `;
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }

    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }
  });
}

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

function initAccountDropdown() {
  const accountBtn = document.getElementById('accountBtn');
  const accountDropdown = document.getElementById('accountDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  const favoriteBtn = document.getElementById('favoriteBtn');
  const favoriteMenuBtn = document.getElementById('favoriteMenuBtn');

  accountBtn?.addEventListener('click', e => {
    e.stopPropagation();
    accountDropdown?.classList.toggle('show');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.account-menu')) {
      accountDropdown?.classList.remove('show');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('currentUser');

    const basePath = getBasePath();
    window.location.href = `${basePath}login.html`;
  });

  function showFavoriteNotice(e) {
    e.preventDefault();

    alert('Tính năng Mục yêu thích đang được hoàn thiện. Bạn có thể dùng nút tim trên tour để đánh dấu trước.');
  }

  favoriteBtn?.addEventListener('click', showFavoriteNotice);
  favoriteMenuBtn?.addEventListener('click', showFavoriteNotice);
}

function initActiveNavLink() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';

    if (
      href.includes(currentPage) ||
      (currentPage === '' && href.includes('index.html'))
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

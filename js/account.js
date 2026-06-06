/**
 * avivu — account.js
 * Quản lý tài khoản / đơn đặt tour / mục yêu thích
 */

document.addEventListener('DOMContentLoaded', () => {
  requireLogin();
  renderAccountProfile();
  renderAccountStats();
  renderBookings();
  renderFavorites();
  bindTabs();
  openTabFromHash();
  bindProfileForm();
  bindLogout();
});

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('avivu_users') || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem('avivu_users', JSON.stringify(users));
}

function requireLogin() {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = 'login.html?redirect=account.html';
  }
}

function renderAccountProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const avatar = document.getElementById('profileAvatar');
  const name = document.getElementById('profileName');
  const email = document.getElementById('profileEmail');

  const inputName = document.getElementById('accountName');
  const inputPhone = document.getElementById('accountPhone');
  const inputEmail = document.getElementById('accountEmail');

  if (avatar) avatar.textContent = getAvatarLetter(user.name);
  if (name) name.textContent = user.name || 'Người dùng avivu';
  if (email) email.textContent = user.email || '';

  if (inputName) inputName.value = user.name || '';
  if (inputPhone) inputPhone.value = user.phone || '';
  if (inputEmail) inputEmail.value = user.email || '';
}

function renderAccountStats() {
  const user = getCurrentUser();
  if (!user) return;

  const bookings = getBookingsForCurrentUser();
  const favorites = getFavoritesForCurrentUser();
  const points = user.points || 0;

  setText('bookingCount', bookings.length);
  setText('favoriteCount', favorites.length);
  setText('pointCount', points);
}

function bindTabs() {
  document.querySelectorAll('.account-tab[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;

      document.querySelectorAll('.account-tab[data-tab]').forEach(btn => {
        btn.classList.remove('active');
      });

      document.querySelectorAll('.account-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      button.classList.add('active');

      const panel = document.getElementById(`panel-${tab}`);
      if (panel) panel.classList.add('active');
    });
  });
}

function bindProfileForm() {
  const form = document.getElementById('profileForm');

  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();

    const user = getCurrentUser();
    if (!user) return;

    const name = document.getElementById('accountName').value.trim();
    const phone = document.getElementById('accountPhone').value.trim();

    if (!name) {
      alert('Vui lòng nhập họ và tên.');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      alert('Số điện thoại phải gồm đúng 10 chữ số.');
      return;
    }

    const updatedUser = {
      ...user,
      name,
      phone
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    const users = getUsers();
    const idx = users.findIndex(item => item.email === user.email);

    if (idx !== -1) {
      users[idx].name = name;
      users[idx].phone = phone;
      saveUsers(users);
    }

    renderAccountProfile();

    alert('Đã cập nhật thông tin tài khoản.');
  });
}

function bindLogout() {
  const logoutBtn = document.getElementById('accountLogoutBtn');

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });
}

/* =========================
   BOOKINGS
========================= */

function getBookingsForCurrentUser() {
  const user = getCurrentUser();
  if (!user) return [];

  let bookings = [];

  try {
    bookings = JSON.parse(localStorage.getItem('avivu_bookings') || '[]');
  } catch {
    bookings = [];
  }

  return bookings.filter(item => {
    return item.customerEmail === user.email || item.email === user.email;
  });
}

function renderBookings() {
  const list = document.getElementById('bookingList');
  if (!list) return;

  const bookings = getBookingsForCurrentUser();

  if (!bookings.length) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-ticket-alt"></i>
        <h3>Chưa có đơn đặt tour</h3>
        <p>Bạn chưa đặt tour nào. Hãy khám phá những hành trình nổi bật của avivu.</p>
        <a href="tours.html">
          <i class="fas fa-compass"></i>
          Khám phá tour
        </a>
      </div>
    `;
    return;
  }

  list.innerHTML = bookings
    .slice()
    .reverse()
    .map(booking => {
      const tourName = booking.tourName || booking.name || 'Tour du lịch';
      const date = booking.travelDate || booking.startDate || 'Đang cập nhật';
      const total = booking.totalPayable || booking.total || 0;
      const code = booking.bookingCode || booking.code || 'AVI-DEMO';

      return `
        <article class="booking-item">
          <div class="booking-main-info">
            <h3>${escapeHtml(tourName)}</h3>
            <div class="booking-meta">
              <span><i class="fas fa-calendar"></i> ${escapeHtml(formatDate(date))}</span>
              <span><i class="fas fa-user"></i> ${booking.adults || 1} người lớn</span>
              <span><i class="fas fa-child"></i> ${booking.children || 0} trẻ em</span>
            </div>
          </div>

          <div class="booking-price">
            <strong>${formatPrice(total)}</strong>
            <span class="booking-code">${escapeHtml(code)}</span>
          </div>
        </article>
      `;
    })
    .join('');
}

/* =========================
   FAVORITES
========================= */

function getFavoritesForCurrentUser() {
  const user = getCurrentUser();
  if (!user) return [];

  const users = getUsers();
  const fullUser = users.find(item => item.email === user.email);

  if (fullUser && Array.isArray(fullUser.favorites)) {
    return fullUser.favorites;
  }

  try {
    const globalFavorites = JSON.parse(localStorage.getItem('avivu_favorites') || '[]');
    return globalFavorites;
  } catch {
    return [];
  }
}

function renderFavorites() {
  const list = document.getElementById('favoriteList');
  if (!list) return;

  const favorites = getFavoritesForCurrentUser();

  if (!favorites.length) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-heart"></i>
        <h3>Chưa có tour yêu thích</h3>
        <p>Hãy nhấn biểu tượng trái tim ở các tour bạn quan tâm để lưu lại.</p>
        <a href="tours.html">
          <i class="fas fa-search"></i>
          Tìm tour yêu thích
        </a>
      </div>
    `;
    return;
  }

  const favoriteTours = resolveFavoriteTours(favorites);

  list.innerHTML = favoriteTours.map(tour => `
  <article class="favorite-card favorite-modern-card">
    <div class="favorite-image-wrap">
      <img src="${tour.image || '../assets/images/banners/tours-banner.jpg'}" alt="${escapeHtml(tour.name)}">

      ${tour.badge ? `
        <span class="favorite-badge">
          <i class="fas fa-bolt"></i>
          ${escapeHtml(tour.badge)}
        </span>
      ` : ''}

      <button 
        class="favorite-remove-floating" 
        type="button" 
        onclick="removeFavorite('${tour.id}')"
        aria-label="Xóa khỏi mục yêu thích">
        <i class="fas fa-heart-crack"></i>
      </button>
    </div>

    <div class="favorite-body">
      <div class="favorite-topline">
        <span>
          <i class="fas fa-map-marker-alt"></i>
          ${escapeHtml(tour.location || 'Việt Nam')}
        </span>

        <span class="favorite-rating">
          <i class="fas fa-star"></i>
          ${tour.rating || '4.8'}
        </span>
      </div>

      <h3>${escapeHtml(tour.name)}</h3>

      <div class="favorite-mini-info">
        <span>
          <i class="fas fa-clock"></i>
          ${escapeHtml(tour.duration || 'Đang cập nhật')}
        </span>

        <span>
          <i class="fas fa-plane-departure"></i>
          ${escapeHtml(tour.departure || 'Linh hoạt')}
        </span>
      </div>

      <div class="favorite-price-row">
        <div>
          <small>Giá từ</small>
          <strong>${formatPrice(tour.price || 0)}</strong>
        </div>

        <span class="favorite-save-chip">
          <i class="fas fa-bookmark"></i>
          Đã lưu
        </span>
      </div>

      <div class="favorite-actions">
        <a href="tour-detail.html?id=${tour.id}">
          <i class="fas fa-eye"></i>
          Xem chi tiết
        </a>

        <a href="booking.html?tourId=${tour.id}" class="favorite-book-btn">
          <i class="fas fa-calendar-check"></i>
          Đặt ngay
        </a>
      </div>
    </div>
  </article>
`).join('');
}

function resolveFavoriteTours(favorites) {
  if (typeof toursData === 'undefined' || !Array.isArray(toursData)) {
    return [];
  }

  return favorites
    .map(item => {
      const id = typeof item === 'object' ? item.id : item;
      return toursData.find(tour => String(tour.id) === String(id));
    })
    .filter(Boolean);
}

function removeFavorite(tourId) {
  const user = getCurrentUser();
  if (!user) return;

  const ok = confirm('Bạn muốn xóa tour này khỏi mục yêu thích?');
  if (!ok) return;

  const card = document
    .querySelector(`button[onclick="removeFavorite('${tourId}')"]`)
    ?.closest('.favorite-card');

  if (card) {
    card.classList.add('favorite-removing');
  }

  setTimeout(() => {
    const users = getUsers();
    const idx = users.findIndex(item => item.email === user.email);

    if (idx !== -1) {
      users[idx].favorites = (users[idx].favorites || [])
        .filter(id => String(id) !== String(tourId));
      saveUsers(users);
    }

    try {
      const globalFavorites = JSON.parse(localStorage.getItem('avivu_favorites') || '[]');
      const next = globalFavorites.filter(item => {
        const id = typeof item === 'object' ? item.id : item;
        return String(id) !== String(tourId);
      });

      localStorage.setItem('avivu_favorites', JSON.stringify(next));

      const currentUser = getCurrentUser();
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify({
          ...currentUser,
          favorites: next
        }));
      }
    } catch {
      // ignore
    }

    renderFavorites();
    renderAccountStats();

    if (typeof refreshWishlistButtons === 'function') {
      refreshWishlistButtons();
    }
  }, 220);
}
function openTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  const tabButton = document.querySelector(`.account-tab[data-tab="${hash}"]`);
  const panel = document.getElementById(`panel-${hash}`);

  if (!tabButton || !panel) return;

  document.querySelectorAll('.account-tab[data-tab]').forEach(btn => {
    btn.classList.remove('active');
  });

  document.querySelectorAll('.account-panel').forEach(item => {
    item.classList.remove('active');
  });

  tabButton.classList.add('active');
  panel.classList.add('active');
}

/* =========================
   HELPERS
========================= */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getAvatarLetter(name) {
  return String(name || 'A').trim().charAt(0).toUpperCase();
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function formatDate(value) {
  if (!value) return 'Đang cập nhật';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
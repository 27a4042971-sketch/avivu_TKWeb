/**
 * AVIVU — tours.js
 * Trang danh sách tour
 */

const tourPageState = {
  search: '',
  categories: [],
  maxPrice: 10000000,
  duration: '',
  departure: '',
  sort: 'newest',
  view: 'grid',
  currentPage: 1,
  itemsPerPage: 6
};
const tourCategoryNames = {
  'bien-dao': 'Biển đảo',
  'nui-trekking': 'Trekking',
  'van-hoa': 'Văn hóa',
  'sinh-thai': 'Sinh thái',
  'le-hoi': 'Lễ hội',
  'gia-dinh': 'Gia đình',
  'phuot': 'Phượt & Mạo hiểm'
};

const tourSortNames = {
  'newest': 'Mới nhất',
  'price-asc': 'Giá tăng dần',
  'price-desc': 'Giá giảm dần',
  'rating-desc': 'Rating cao'
};

function formatTourPrice(price) {
  return price.toLocaleString('vi-VN') + 'đ';
}

function getDurationDays(durationText) {
  const match = durationText.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

function matchDuration(tour) {
  if (!tourPageState.duration) return true;

  const days = getDurationDays(tour.duration);

  if (tourPageState.duration === '1') return days === 1;
  if (tourPageState.duration === '2-3') return days >= 2 && days <= 3;
  if (tourPageState.duration === '4-5') return days >= 4 && days <= 5;
  if (tourPageState.duration === '6') return days >= 6;

  return true;
}

function getFilteredTours() {
  if (typeof toursData === 'undefined') {
    console.error('Không tìm thấy toursData. Kiểm tra lại file js/data/tours-data.js đã được nhúng trước tours.js chưa.');
    return [];
  }

  let result = [...toursData];

  if (tourPageState.search.trim() !== '') {
    const keyword = tourPageState.search.toLowerCase().trim();

    result = result.filter(tour =>
      tour.name.toLowerCase().includes(keyword) ||
      tour.location.toLowerCase().includes(keyword) ||
      tour.departure.toLowerCase().includes(keyword)
    );
  }

  if (tourPageState.categories.length > 0) {
    result = result.filter(tour =>
      tourPageState.categories.includes(tour.category)
    );
  }

  result = result.filter(tour => tour.price <= tourPageState.maxPrice);

  if (tourPageState.duration) {
    result = result.filter(tour => matchDuration(tour));
  }

  if (tourPageState.departure) {
    result = result.filter(tour => tour.departure === tourPageState.departure);
  }

  result.sort((a, b) => {
    if (tourPageState.sort === 'price-asc') return a.price - b.price;
    if (tourPageState.sort === 'price-desc') return b.price - a.price;
    if (tourPageState.sort === 'rating-desc') return b.rating - a.rating;

    return b.id - a.id;
  });

  return result;
}

function renderTourCard(tour) {
  return `
    <article class="tour-compact-card" data-aos="fade-up">
      <div class="compact-image">
        <img src="${tour.image}" alt="${tour.name}" loading="lazy" />

        ${tour.badge ? `
          <span class="compact-badge badge-${tour.badgeType}">
            ${tour.badge}
          </span>
        ` : ''}

        <button class="compact-heart" type="button" aria-label="Yêu thích">
          <i class="far fa-heart"></i>
        </button>
      </div>

      <div class="compact-body">
        <div class="compact-meta">
          <span>
            <i class="fas fa-map-marker-alt"></i>
            ${tour.location}
          </span>

          <span class="compact-rating">
            <i class="fas fa-star"></i>
            ${tour.rating}
          </span>
        </div>

        <h3 class="compact-title">${tour.name}</h3>

        <div class="compact-info">
          <span>
            <i class="fas fa-clock"></i>
            ${tour.duration}
          </span>

          <span>
            <i class="fas fa-plane-departure"></i>
            ${tour.departure}
          </span>
        </div>

        <div class="compact-footer">
          <div class="compact-price">
            <small>Giá từ</small>
            <strong>${formatTourPrice(tour.price)}</strong>
          </div>

          <a href="tour-detail.html?id=${tour.id}" class="compact-btn">
            Xem chi tiết
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderPagination(totalPages) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="${i === tourPageState.currentPage ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  pagination.innerHTML = html;
}
function renderResultSummary(filteredTours) {
  const summaryTotal = document.getElementById('summaryTotal');
  const summaryMinPrice = document.getElementById('summaryMinPrice');
  const summaryBestRating = document.getElementById('summaryBestRating');
  const summaryViewMode = document.getElementById('summaryViewMode');

  if (!summaryTotal || !summaryMinPrice || !summaryBestRating || !summaryViewMode) {
    return;
  }

  if (!filteredTours || filteredTours.length === 0) {
    summaryTotal.textContent = '0';
    summaryMinPrice.textContent = 'Không có';
    summaryBestRating.textContent = 'Không có';
    summaryViewMode.textContent = tourPageState.view === 'list' ? 'List' : 'Grid';
    return;
  }

  const minPrice = Math.min(...filteredTours.map(tour => tour.price));
  const bestRating = Math.max(...filteredTours.map(tour => tour.rating));

  summaryTotal.textContent = filteredTours.length;
  summaryMinPrice.textContent = formatTourPrice(minPrice);
  summaryBestRating.textContent = bestRating.toFixed(1);
  summaryViewMode.textContent = tourPageState.view === 'list' ? 'List' : 'Grid';
}

function renderTours() {
  const grid = document.getElementById('toursGrid');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');

  if (!grid) {
    console.error('Không tìm thấy #toursGrid trong tours.html');
    return;
  }

  if (!resultCount) {
    console.error('Không tìm thấy #resultCount trong tours.html');
    return;
  }

  const filteredTours = getFilteredTours();

  resultCount.textContent = `Tìm thấy ${filteredTours.length} tour`;
  renderResultSummary(filteredTours);

  const totalPages = Math.ceil(filteredTours.length / tourPageState.itemsPerPage);

  if (tourPageState.currentPage > totalPages) {
    tourPageState.currentPage = totalPages || 1;
  }

  const startIndex = (tourPageState.currentPage - 1) * tourPageState.itemsPerPage;
  const endIndex = startIndex + tourPageState.itemsPerPage;
  const toursToShow = filteredTours.slice(startIndex, endIndex);

  if (toursToShow.length === 0) {
    grid.innerHTML = '';

    if (emptyState) {
      emptyState.style.display = 'block';
    }
  } else {
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    grid.innerHTML = toursToShow.map(renderTourCard).join('');
  }

  grid.classList.toggle('list-view', tourPageState.view === 'list');

  renderActiveFilters();

  renderPagination(totalPages);

  if (typeof AOS !== 'undefined') {
    AOS.refresh();
  }
}

function bindTourEvents() {
  const searchInput = document.getElementById('searchInput');
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  const durationFilter = document.getElementById('durationFilter');
  const departureFilter = document.getElementById('departureFilter');
  const sortSelect = document.getElementById('sortSelect');
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  const btnResetFilter = document.getElementById('btnResetFilter');
  const pagination = document.getElementById('pagination');
  const quickFilterChips = document.querySelectorAll('.quick-filter-chip');
  const heroSearchInput = document.getElementById('heroSearchInput');
  const heroDepartureFilter = document.getElementById('heroDepartureFilter');
  const heroDurationFilter = document.getElementById('heroDurationFilter');
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const activeFilters = document.getElementById('activeFilters');

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      tourPageState.search = e.target.value;
      tourPageState.currentPage = 1;
      renderTours();
    });
  }

  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      tourPageState.categories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      tourPageState.currentPage = 1;
      renderTours();
    });
  });

  if (priceRange && priceValue) {
    priceRange.addEventListener('input', e => {
      tourPageState.maxPrice = parseInt(e.target.value);
      priceValue.textContent = formatTourPrice(tourPageState.maxPrice);
      tourPageState.currentPage = 1;
      renderTours();
    });
  }

  if (durationFilter) {
    durationFilter.addEventListener('change', e => {
      tourPageState.duration = e.target.value;
      tourPageState.currentPage = 1;
      renderTours();
    });
  }

  if (departureFilter) {
    departureFilter.addEventListener('change', e => {
      tourPageState.departure = e.target.value;
      tourPageState.currentPage = 1;
      renderTours();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      tourPageState.sort = e.target.value;
      tourPageState.currentPage = 1;
      renderTours();
    });
  }

  if (gridViewBtn && listViewBtn) {
    gridViewBtn.addEventListener('click', () => {
      tourPageState.view = 'grid';
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
      renderTours();
    });

    listViewBtn.addEventListener('click', () => {
      tourPageState.view = 'list';
      listViewBtn.classList.add('active');
      gridViewBtn.classList.remove('active');
      renderTours();
    });
  }
    quickFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const category = chip.dataset.category;
        const price = chip.dataset.price;
        const sort = chip.dataset.sort;

        quickFilterChips.forEach(item => item.classList.remove('active'));
        chip.classList.add('active');

        if (category) {
        tourPageState.categories = [category];

        categoryCheckboxes.forEach(cb => {
            cb.checked = cb.value === category;
        });
        }

        if (price) {
        tourPageState.maxPrice = parseInt(price);

        if (priceRange) {
            priceRange.value = price;
        }

        if (priceValue) {
            priceValue.textContent = formatTourPrice(parseInt(price));
        }
        }

        if (sort) {
        tourPageState.sort = sort;

        if (sortSelect) {
            sortSelect.value = sort;
        }
        }

        tourPageState.currentPage = 1;
        renderTours();
    });
    });
    if (heroSearchBtn) {
  heroSearchBtn.addEventListener('click', () => {
    if (heroSearchInput) {
      tourPageState.search = heroSearchInput.value.trim();

      if (searchInput) {
        searchInput.value = tourPageState.search;
      }
    }

    if (heroDepartureFilter) {
      tourPageState.departure = heroDepartureFilter.value;

      if (departureFilter) {
        departureFilter.value = tourPageState.departure;
      }
    }

    if (heroDurationFilter) {
      tourPageState.duration = heroDurationFilter.value;

      if (durationFilter) {
        durationFilter.value = tourPageState.duration;
      }
    }

    tourPageState.currentPage = 1;
    renderTours();

    const toursSection = document.querySelector('.tours-section');
    if (toursSection) {
      window.scrollTo({
        top: toursSection.offsetTop - 90,
        behavior: 'smooth'
      });
    }
  });
}
if (heroSearchInput) {
  heroSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && heroSearchBtn) {
      heroSearchBtn.click();
    }
  });
}

  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      tourPageState.search = '';
      tourPageState.categories = [];
      tourPageState.maxPrice = 10000000;
      tourPageState.duration = '';
      tourPageState.departure = '';
      tourPageState.sort = 'newest';
      tourPageState.view = 'grid';
      tourPageState.currentPage = 1;

      if (searchInput) searchInput.value = '';
      categoryCheckboxes.forEach(cb => cb.checked = false);
      if (priceRange) priceRange.value = 10000000;
      if (priceValue) priceValue.textContent = formatTourPrice(10000000);
      if (durationFilter) durationFilter.value = '';
      if (departureFilter) departureFilter.value = '';
      if (sortSelect) sortSelect.value = 'newest';
      quickFilterChips.forEach(chip => chip.classList.remove('active'));

      if (heroSearchInput) heroSearchInput.value = '';
      if (heroDepartureFilter) heroDepartureFilter.value = '';
      if (heroDurationFilter) heroDurationFilter.value = '';

      if (gridViewBtn && listViewBtn) {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
      }

      renderTours();
    });
  }
  if (activeFilters) {
  activeFilters.addEventListener('click', e => {
    const removeBtn = e.target.closest('button[data-filter-type]');
    if (!removeBtn) return;

    const type = removeBtn.dataset.filterType;
    const value = removeBtn.dataset.filterValue;

    if (type === 'search') {
      tourPageState.search = '';

      const searchInput = document.getElementById('searchInput');
      const heroSearchInput = document.getElementById('heroSearchInput');

      if (searchInput) searchInput.value = '';
      if (heroSearchInput) heroSearchInput.value = '';
    }

    if (type === 'category') {
      tourPageState.categories = tourPageState.categories.filter(item => item !== value);

      document.querySelectorAll('input[name="category"]').forEach(cb => {
        if (cb.value === value) {
          cb.checked = false;
        }
      });

      document.querySelectorAll('.quick-filter-chip').forEach(chip => {
        if (chip.dataset.category === value) {
          chip.classList.remove('active');
        }
      });
    }

    if (type === 'price') {
      tourPageState.maxPrice = 10000000;

      const priceRange = document.getElementById('priceRange');
      const priceValue = document.getElementById('priceValue');

      if (priceRange) priceRange.value = 10000000;
      if (priceValue) priceValue.textContent = formatTourPrice(10000000);

      document.querySelectorAll('.quick-filter-chip').forEach(chip => {
        if (chip.dataset.price) {
          chip.classList.remove('active');
        }
      });
    }

    if (type === 'duration') {
      tourPageState.duration = '';

      const durationFilter = document.getElementById('durationFilter');
      const heroDurationFilter = document.getElementById('heroDurationFilter');

      if (durationFilter) durationFilter.value = '';
      if (heroDurationFilter) heroDurationFilter.value = '';
    }

    if (type === 'departure') {
      tourPageState.departure = '';

      const departureFilter = document.getElementById('departureFilter');
      const heroDepartureFilter = document.getElementById('heroDepartureFilter');

      if (departureFilter) departureFilter.value = '';
      if (heroDepartureFilter) heroDepartureFilter.value = '';
    }

    if (type === 'sort') {
      tourPageState.sort = 'newest';

      const sortSelect = document.getElementById('sortSelect');
      if (sortSelect) sortSelect.value = 'newest';

      document.querySelectorAll('.quick-filter-chip').forEach(chip => {
        if (chip.dataset.sort) {
          chip.classList.remove('active');
        }
      });
    }

    tourPageState.currentPage = 1;
    renderTours();
  });
}

  if (pagination) {
    pagination.addEventListener('click', e => {
      const pageButton = e.target.closest('button[data-page]');
      if (!pageButton) return;

      tourPageState.currentPage = parseInt(pageButton.dataset.page);
      renderTours();

      const toursSection = document.querySelector('.tours-section');
      if (toursSection) {
        window.scrollTo({
          top: toursSection.offsetTop - 90,
          behavior: 'smooth'
        });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindTourEvents();
  renderTours();
});
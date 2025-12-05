// Đảm bảo các file phụ thuộc đã được load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof authManager === 'undefined') console.warn('auth.js chưa được load');
    if (typeof booksData === 'undefined') console.error('LỖI: data.js chưa được load!');
});

// Cập nhật header khi trang load
if (typeof updateHeaderUserInfo !== 'undefined') {
    updateHeaderUserInfo();
}

// ===== GIỎ HÀNG =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ===== CÁC HÀM CHỨC NĂNG =====

// 1. Hiển thị sách lên trang
function displayBooks(books, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        // Tính giảm giá
        const hasDiscount = book.originalPrice > book.price;
        const discountPercent = hasDiscount 
            ? Math.round((1 - book.price / book.originalPrice) * 100) 
            : 0;
        
        bookCard.innerHTML = `
            ${book.isBestseller ? '<div class="book-badge">Bán chạy</div>' : ''}
            ${hasDiscount ? `<div class="book-badge" style="left: auto; right: 15px; background-color: #e74c3c;">-${discountPercent}%</div>` : ''}
            
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}">
            </div>
            
            <div class="book-content">
                <h3 class="book-title" title="${book.title}">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                
                <div class="book-price">
                    <span class="current-price">${book.price.toLocaleString('vi-VN')} đ</span>
                    ${hasDiscount ? `<span class="original-price">${book.originalPrice.toLocaleString('vi-VN')} đ</span>` : ''}
                </div>
                
                <div class="book-rating">
                    <i class="fas fa-star" style="color: #f39c12;"></i>
                    <span>${book.rating}</span>
                </div>
                
                <div class="book-actions">
                    <button class="btn-add-cart" onclick="addToCart(${book.id})">
                        <i class="fas fa-cart-plus"></i> Thêm giỏ
                    </button>
                    <button class="btn-detail" onclick="viewDetail(${book.id})">
                        <i class="fas fa-info-circle"></i> Chi tiết
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(bookCard);
    });
}

// 2. Thêm sách vào giỏ hàng
function addToCart(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    // Cập nhật lại giỏ hàng từ localStorage để tránh bị ghi đè
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === bookId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...book,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Hiển thị thông báo (dùng hàm từ auth.js nếu có, không thì alert)
    if (typeof showNotification === 'function') {
        showNotification(`Đã thêm "${book.title}" vào giỏ hàng!`);
    } else {
        alert(`Đã thêm "${book.title}" vào giỏ hàng!`);
    }
}

// 3. Cập nhật số lượng trên icon giỏ hàng
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = currentCart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// 4. Xem chi tiết sách
function viewDetail(bookId) {
    sessionStorage.setItem('selectedBookId', bookId);
    window.location.href = 'pages/product.html';
}

// 5. Slider banner
let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    if (slides.length === 0) return;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// ===== TÌM KIẾM SÁCH (LOGIC MỚI) =====
function searchBooks() {
    const searchInput = document.getElementById('search-input');
    const homeContent = document.getElementById('home-content'); // Hộp nội dung cũ
    const searchSection = document.getElementById('search-results-section'); // Hộp kết quả tìm kiếm
    const searchGrid = document.getElementById('search-results-grid');
    const searchKeyword = document.getElementById('search-keyword');
    
    if (!searchInput || !homeContent || !searchSection) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Nếu ô tìm kiếm trống, đóng tìm kiếm
    if (searchTerm === '') {
        closeSearch();
        return;
    }
    
    // 1. Ẩn trang chủ, hiện trang tìm kiếm
    homeContent.style.display = 'none';
    searchSection.style.display = 'block';
    
    // 2. Lọc sách
    const searchResults = booksData.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm)
    );
    
    // 3. Hiển thị thông báo từ khóa
    searchKeyword.innerHTML = `Tìm thấy <strong>${searchResults.length}</strong> kết quả cho từ khóa "<strong>${searchInput.value}</strong>"`;
    
    // 4. Render kết quả
    searchGrid.innerHTML = ''; // Xóa kết quả cũ
    
    if (searchResults.length === 0) {
        searchGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <i class="fas fa-search" style="font-size: 60px; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="color: #666;">Không tìm thấy cuốn sách nào</h3>
                <p>Hãy thử tìm với từ khóa khác xem sao</p>
            </div>
        `;
    } else {
        // Render sách tìm được
        searchResults.forEach(book => {
            // Tính giảm giá
            const hasDiscount = book.originalPrice > book.price;
            const discountPercent = hasDiscount ? Math.round((1 - book.price / book.originalPrice) * 100) : 0;
            
            const html = `
                <div class="book-card" onclick="viewDetail(${book.id})">
                    ${book.isBestseller ? '<div class="book-badge">Bán chạy</div>' : ''}
                    ${hasDiscount ? `<div class="book-badge" style="left: auto; right: 15px; background: linear-gradient(135deg, #ff6b6b, #ee5253);">-${discountPercent}%</div>` : ''}
                    
                    <div class="book-image">
                        <img src="${book.image}" alt="${book.title}">
                    </div>
                    
                    <div class="book-content">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        
                        <div class="book-price">
                            <span class="current-price">${book.price.toLocaleString('vi-VN')} đ</span>
                        </div>
                        
                        <div class="book-actions">
                            <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${book.id})">Thêm giỏ</button>
                            <button class="btn-detail">Chi tiết</button>
                        </div>
                    </div>
                </div>
            `;
            searchGrid.innerHTML += html;
        });
    }
    
    // Cuộn lên đầu trang để người dùng thấy kết quả
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hàm đóng tìm kiếm, quay về trang chủ
function closeSearch() {
    const homeContent = document.getElementById('home-content');
    const searchSection = document.getElementById('search-results-section');
    const searchInput = document.getElementById('search-input');
    
    if (homeContent && searchSection) {
        homeContent.style.display = 'block'; // Hiện lại trang chủ
        searchSection.style.display = 'none'; // Ẩn tìm kiếm
        if(searchInput) searchInput.value = ''; // Xóa chữ trong ô tìm kiếm
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Gán sự kiện vào biến toàn cục để HTML gọi được
window.closeSearch = closeSearch;

// 7. Menu mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');
    
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && !menuToggle.contains(e.target)) {
                navbar.classList.remove('active');
            }
        });
    }
    
    // Dropdown mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                this.classList.toggle('active');
            }
        });
    });
}

// 8. Lọc sách (Filter)
let filteredBooks = [];

function filterBooks(category) {
    if (category === 'all') {
        filteredBooks = [...booksData];
    } else {
        filteredBooks = booksData.filter(book => book.category === category);
    }
    
    displayFilteredBooks(filteredBooks);
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.category === category) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function displayFilteredBooks(books) {
    const container = document.getElementById('filtered-books');
    if (!container) return;
    
    // Tận dụng lại hàm displayBooks nhưng render vào container khác
    container.innerHTML = '';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        const hasDiscount = book.originalPrice > book.price;
        const discountPercent = hasDiscount ? Math.round((1 - book.price / book.originalPrice) * 100) : 0;
        
        bookCard.innerHTML = `
            ${book.isBestseller ? '<div class="book-badge">Bán chạy</div>' : ''}
            ${hasDiscount ? `<div class="book-badge" style="left: auto; right: 15px; background-color: #e74c3c;">-${discountPercent}%</div>` : ''}
            
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}">
            </div>
            
            <div class="book-content">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                
                <div class="book-price">
                    <span class="current-price">${book.price.toLocaleString('vi-VN')} đ</span>
                </div>
                
                <div class="book-rating">
                    <i class="fas fa-star" style="color: #f39c12;"></i>
                    <span>${book.rating}</span>
                </div>
                
                <div class="book-actions">
                    <button class="btn-add-cart" onclick="addToCart(${book.id})">Thêm giỏ</button>
                    <button class="btn-detail" onclick="viewDetail(${book.id})">Chi tiết</button>
                </div>
            </div>
        `;
        container.appendChild(bookCard);
    });

    const resultCount = document.getElementById('result-count');
    if (resultCount) resultCount.textContent = books.length;
}

function sortBooks(sortType) {
    // Nếu chưa lọc thì lấy toàn bộ
    if (filteredBooks.length === 0) filteredBooks = [...booksData];
    
    switch (sortType) {
        case 'price-asc': filteredBooks.sort((a, b) => a.price - b.price); break;
        case 'price-desc': filteredBooks.sort((a, b) => b.price - a.price); break;
        case 'name-asc': filteredBooks.sort((a, b) => a.title.localeCompare(b.title)); break;
        case 'name-desc': filteredBooks.sort((a, b) => b.title.localeCompare(a.title)); break;
    }
    displayFilteredBooks(filteredBooks);
}

// ===== KHỞI TẠO =====
document.addEventListener('DOMContentLoaded', function() {
    if (typeof booksData !== 'undefined') {
        // Init HomePage Data
        displayBooks(booksData.slice(0, 4), 'featured-books');
        displayBooks(booksData.filter(b => b.isBestseller), 'bestseller-books');
        
        // Init Filter Section
        displayFilteredBooks(booksData); // Mặc định hiện tất cả
        
        // Setup Filter Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => filterBooks(btn.dataset.category));
        });
        
        // Setup Category Banners Click
        document.querySelectorAll('.category-banner').forEach(banner => {
            banner.addEventListener('click', (e) => {
                e.preventDefault();
                const category = banner.dataset.category;
                filterBooks(category);
                document.getElementById('filtered-books')?.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // ============================================
        // XỬ LÝ CLICK MENU DANH MỤC (NAVBAR)
        // ============================================
        const navCategories = document.querySelectorAll('.nav-category');
        navCategories.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                
                // Gọi hàm lọc sách
                filterBooks(category);
                
                // Cuộn xuống phần hiển thị sách
                const filterSection = document.getElementById('filtered-books');
                if (filterSection) {
                    // Cuộn mượt (trừ đi chiều cao header)
                    const headerOffset = 80;
                    const elementPosition = filterSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }

                // Đóng menu mobile nếu đang mở
                document.getElementById('navbar')?.classList.remove('active');
            });
        });
        // ============================================

        // Setup Sort
        document.getElementById('sort-by')?.addEventListener('change', (e) => sortBooks(e.target.value));
    }

    updateCartCount();
    setupMobileMenu();
    
    // Init Slider
    if (slides.length > 0) {
        showSlide(0);
        setInterval(nextSlide, 5000);
        document.querySelector('.next-btn')?.addEventListener('click', nextSlide);
        document.querySelector('.prev-btn')?.addEventListener('click', prevSlide);
        dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    }
    
    // Init Search
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn) searchBtn.addEventListener('click', searchBooks);
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') searchBooks(); });
    
    // Smooth Scroll Link
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const target = document.querySelector(targetId);
            if(target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                
                // Đóng menu mobile
                document.getElementById('navbar')?.classList.remove('active');
            }
        });
    });
});
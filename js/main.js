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
        // THÊM SỰ KIỆN CLICK VÀO CẢ THẺ ĐỂ XEM CHI TIẾT
        bookCard.onclick = function(e) {
            // Nếu bấm vào nút thêm giỏ thì không chuyển trang
            if (!e.target.closest('.btn-add-cart')) {
                viewDetail(book.id);
            }
        };
        bookCard.style.cursor = 'pointer'; // Thêm con trỏ tay
        
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
                
                <div class="book-actions">
                    <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${book.id})">
                        <i class="fas fa-cart-plus"></i> Thêm giỏ
                    </button>
                    <button class="btn-detail" onclick="event.stopPropagation(); viewDetail(${book.id})">
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

// ===== TÌM KIẾM SÁCH =====
function searchBooks() {
    const searchInput = document.getElementById('search-input');
    const homeContent = document.getElementById('home-content');
    const searchSection = document.getElementById('search-results-section');
    const searchGrid = document.getElementById('search-results-grid');
    const searchKeyword = document.getElementById('search-keyword');
    
    if (!searchInput || !homeContent || !searchSection) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        closeSearch();
        return;
    }
    
    homeContent.style.display = 'none';
    searchSection.style.display = 'block';
    
    const searchResults = booksData.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm)
    );
    
    searchKeyword.innerHTML = `Tìm thấy <strong>${searchResults.length}</strong> kết quả cho từ khóa "<strong>${searchInput.value}</strong>"`;
    searchGrid.innerHTML = '';
    
    if (searchResults.length === 0) {
        searchGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <i class="fas fa-search" style="font-size: 60px; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="color: #666;">Không tìm thấy cuốn sách nào</h3>
                <p>Hãy thử tìm với từ khóa khác xem sao</p>
            </div>
        `;
    } else {
        searchResults.forEach(book => {
            const hasDiscount = book.originalPrice > book.price;
            const discountPercent = hasDiscount ? Math.round((1 - book.price / book.originalPrice) * 100) : 0;
            
            // Xử lý click cho kết quả tìm kiếm
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book-card';
            bookDiv.onclick = function(e) {
                if (!e.target.closest('.btn-add-cart')) viewDetail(book.id);
            };
            bookDiv.style.cursor = 'pointer';

            bookDiv.innerHTML = `
                ${book.isBestseller ? '<div class="book-badge">Bán chạy</div>' : ''}
                ${hasDiscount ? `<div class="book-badge" style="left: auto; right: 15px; background: #e74c3c;">-${discountPercent}%</div>` : ''}
                
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
                        <button class="btn-detail" onclick="event.stopPropagation(); viewDetail(${book.id})">Chi tiết</button>
                    </div>
                </div>
            `;
            searchGrid.appendChild(bookDiv);
        });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeSearch() {
    const homeContent = document.getElementById('home-content');
    const searchSection = document.getElementById('search-results-section');
    const searchInput = document.getElementById('search-input');
    
    if (homeContent && searchSection) {
        homeContent.style.display = 'block';
        searchSection.style.display = 'none';
        if(searchInput) searchInput.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
window.closeSearch = closeSearch;

// 7. Menu mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');
    
    if (menuToggle && navbar) {
        // Clone node để xóa sự kiện cũ tránh trùng lặp
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

        newMenuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && !newMenuToggle.contains(e.target)) {
                navbar.classList.remove('active');
            }
        });
    }
    
    // Dropdown mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                // e.preventDefault();
                this.classList.toggle('active');
            }
        });
    });
}

// ===== KHỞI TẠO =====
document.addEventListener('DOMContentLoaded', function() {
    if (typeof booksData !== 'undefined') {
        // Init HomePage Data
        displayBooks(booksData.slice(0, 4), 'featured-books');
        displayBooks(booksData.filter(b => b.isBestseller), 'bestseller-books');
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
                document.getElementById('navbar')?.classList.remove('active');
            }
        });
    });
});
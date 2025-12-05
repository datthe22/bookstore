document.addEventListener('DOMContentLoaded', function() {
    // 1. Lấy tham số 'type' từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryType = urlParams.get('type');
    
    // Nếu không có category, quay về trang chủ
    if (!categoryType) {
        window.location.href = '../index.html';
        return;
    }

    // 2. Cập nhật Tiêu đề trang & Banner
    const titleElement = document.getElementById('category-title');
    const descElement = document.getElementById('category-desc');
    let books = [];

    if (categoryType === 'all') {
        document.title = "Tất cả sách - BookStore";
        if(titleElement) titleElement.textContent = "Tất cả sách";
        if(descElement) descElement.textContent = "Khám phá toàn bộ kho tàng tri thức tại BookStore";
        if (typeof booksData !== 'undefined') books = [...booksData];
    } else {
        document.title = `${categoryType} - BookStore`;
        if(titleElement) titleElement.textContent = categoryType;
        
        const descMap = {
            'Văn học': 'Tiểu thuyết, truyện ngắn, thơ ca lay động lòng người',
            'Kinh tế': 'Kiến thức kinh doanh, đầu tư và quản trị',
            'Kỹ năng': 'Phát triển bản thân để thành công hơn',
            'Thiếu nhi': 'Thế giới diệu kỳ cho các bé',
            'Ngoại ngữ': 'Chinh phục ngôn ngữ mới',
            'Giáo khoa': 'Hành trang tri thức nhà trường'
        };
        
        if (descElement) {
            descElement.textContent = descMap[categoryType] ? descMap[categoryType] : "Danh mục sách chọn lọc";
        }

        if (typeof booksData !== 'undefined') {
            books = booksData.filter(book => book.category === categoryType);
        }
    }

    // 3. Hiển thị sách
    window.currentCategoryBooks = books; 
    displayCategoryBooks(books);
    
    // Init Header Auth & Mobile Menu
    if (typeof updateHeaderUserInfo === 'function') updateHeaderUserInfo();
    if (typeof setupMobileMenu === 'function') setupMobileMenu();
});

// Hàm hiển thị sách
function displayCategoryBooks(books) {
    const container = document.getElementById('category-books-grid');
    const countSpan = document.getElementById('book-count');
    
    if (!container) return;
    
    container.innerHTML = '';
    if(countSpan) countSpan.textContent = books.length;
    
    if (books.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666; font-size: 18px;">Chưa có sách nào trong danh mục này.</p>`;
        return;
    }

    books.forEach(book => {
        const hasDiscount = book.originalPrice > book.price;
        const discountPercent = hasDiscount ? Math.round((1 - book.price / book.originalPrice) * 100) : 0;
        
        // Tạo thẻ div bằng JS để gán sự kiện onclick chuẩn xác nhất
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book-card';
        bookDiv.style.cursor = 'pointer';
        
        // SỰ KIỆN CLICK: Bấm vào thẻ là xem chi tiết ngay
        bookDiv.onclick = function(e) {
            // Trừ khi bấm vào nút "Thêm giỏ" thì không chuyển trang
            if (!e.target.closest('.btn-add-cart')) {
                viewDetail(book.id);
            }
        };

        bookDiv.innerHTML = `
            ${book.isBestseller ? '<div class="book-badge">Bán chạy</div>' : ''}
            ${hasDiscount ? `<div class="book-badge" style="left: auto; right: 15px; background: #e74c3c;">-${discountPercent}%</div>` : ''}
            
            <div class="book-image">
                <img src="../${book.image}" alt="${book.title}">
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
        container.appendChild(bookDiv);
    });
}

// Hàm sắp xếp
function sortCategoryBooks(type) {
    let books = [...window.currentCategoryBooks];
    switch (type) {
        case 'price-asc': books.sort((a, b) => a.price - b.price); break;
        case 'price-desc': books.sort((a, b) => b.price - a.price); break;
        case 'name-asc': books.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    displayCategoryBooks(books);
}

// ===== CÁC HÀM HỖ TRỢ (Viết trực tiếp vào đây để không phụ thuộc file khác) =====

function viewDetail(bookId) {
    sessionStorage.setItem('selectedBookId', bookId);
    // Vì đang ở trong folder pages/ nên link chỉ cần là product.html
    window.location.href = 'product.html'; 
}

function addToCart(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === bookId);
    
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...book, quantity: 1 });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (typeof updateHeaderUserInfo === 'function') updateHeaderUserInfo();
    else if (typeof updateCartCount === 'function') updateCartCount();
    
    if (typeof showNotification === 'function') showNotification(`Đã thêm "${book.title}" vào giỏ hàng!`);
    else alert(`Đã thêm "${book.title}" vào giỏ hàng!`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countElement = document.querySelector('.cart-count');
    if(countElement) countElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');
    
    if (menuToggle && navbar) {
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        
        newMenuToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }
    
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                this.classList.toggle('active');
            }
        });
    });
}
// Lấy thông tin sách từ sessionStorage
const selectedBookId = sessionStorage.getItem('selectedBookId');

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem data.js đã load chưa
    if (typeof booksData === 'undefined') {
        console.error('Chưa load data.js');
        return;
    }

    const productContainer = document.getElementById('product-detail');
    
    if (!selectedBookId) {
        productContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h3>Chưa chọn sách</h3>
                <p>Vui lòng quay lại <a href="../index.html" style="color: #3498db;">Trang chủ</a> để chọn sách.</p>
            </div>
        `;
        return;
    }
    
    const book = booksData.find(b => b.id == selectedBookId);
    
    if (!book) {
        productContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-search-minus" style="font-size: 48px; color: #95a5a6; margin-bottom: 20px;"></i>
                <h3>Không tìm thấy sách</h3>
                <p>Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
                <a href="../index.html" class="btn">Về trang chủ</a>
            </div>
        `;
        return;
    }
    
    const hasDiscount = book.originalPrice > book.price;
    const discountPercent = hasDiscount ? Math.round((1 - book.price / book.originalPrice) * 100) : 0;
    
    // Update Document Title
    document.title = `${book.title} - BookStore`;

    // RENDER CHI TIẾT SÁCH (CHÚ Ý DÒNG IMG CÓ THÊM ../)
    productContainer.innerHTML = `
        <div class="product-detail-container" style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; margin-top: 20px;">
            <div class="product-image">
                <img src="../${book.image}" alt="${book.title}" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                ${hasDiscount ? `<div style="background-color: #e74c3c; color: white; padding: 8px 15px; border-radius: 4px; display: inline-block; margin-top: 15px; font-weight: bold;">-${discountPercent}% Giảm</div>` : ''}
            </div>
            
            <div class="product-info">
                <h1 style="font-family: 'Montserrat', sans-serif; font-size: 28px; margin-bottom: 10px; color: #2c3e50;">${book.title}</h1>
                <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 15px;">Tác giả: <strong>${book.author}</strong></p>
                
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div class="rating" style="display: flex; align-items: center; gap: 5px; color: #f39c12;">
                        ${generateStarRating(book.rating)}
                        <span style="color: #7f8c8d; margin-left: 5px;">(${book.rating}/5)</span>
                    </div>
                    <span style="color: #bdc3c7;">|</span>
                    <div style="color: #7f8c8d;">
                        <span style="background-color: #ecf0f1; padding: 3px 10px; border-radius: 15px; font-size: 13px;">${book.category}</span>
                    </div>
                </div>
                
                <div class="price-section" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 10px;">
                        <div style="font-size: 28px; font-weight: bold; color: #e74c3c;">
                            ${book.price.toLocaleString('vi-VN')} đ
                        </div>
                        ${hasDiscount ? `<div style="font-size: 18px; color: #95a5a6; text-decoration: line-through;">${book.originalPrice.toLocaleString('vi-VN')} đ</div>` : ''}
                    </div>
                    <p style="color: #27ae60; font-size: 14px; margin: 0;">
                        <i class="fas fa-check-circle"></i> Còn hàng - Giao hàng toàn quốc
                    </p>
                </div>
                
                <div class="product-description" style="margin-bottom: 30px;">
                    <h3 style="font-family: 'Montserrat', sans-serif; margin-bottom: 10px; font-size: 18px;">Giới thiệu sách</h3>
                    <p style="line-height: 1.6; color: #34495e;">${book.description}</p>
                </div>
                
                <div class="product-actions" style="display: flex; gap: 15px;">
                    <button onclick="addToCart(${book.id})" class="btn" style="flex: 1; padding: 15px; font-size: 16px; background-color: #3498db;">
                        <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                    </button>
                    <button onclick="buyNow(${book.id})" class="btn" style="flex: 1; padding: 15px; font-size: 16px; background-color: #e74c3c;">
                        Mua ngay
                    </button>
                </div>
            </div>
        </div>
        
        <div class="related-products" style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 30px;">
            <h2 style="font-family: 'Montserrat', sans-serif; font-size: 24px; margin-bottom: 25px;">Sách cùng thể loại</h2>
            <div id="related-books" class="books-grid"></div>
        </div>
    `;
    
    // Hiển thị sách liên quan
    const relatedBooks = booksData.filter(b => b.category === book.category && b.id !== book.id).slice(0, 4);
    displayRelatedBooks(relatedBooks);
    
    if(typeof updateCartCount === 'function') updateCartCount();
    if(typeof setupMobileMenu === 'function') setupMobileMenu();
});

function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) stars += '<i class="fas fa-star"></i>';
        else if (i === Math.ceil(rating) && !Number.isInteger(rating)) stars += '<i class="fas fa-star-half-alt"></i>';
        else stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

function displayRelatedBooks(books) {
    const container = document.getElementById('related-books');
    if (!container) return;
    
    if (books.length === 0) { container.innerHTML = '<p>Không có sách liên quan.</p>'; return; }
    
    container.innerHTML = '';
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.style.cursor = 'pointer';
        bookCard.onclick = () => viewDetail(book.id);
        
        // CHÚ Ý DÒNG IMG CÓ THÊM ../
        bookCard.innerHTML = `
            <div class="book-image" style="height: 200px;">
                <img src="../${book.image}" alt="${book.title}">
            </div>
            <div class="book-content">
                <h3 class="book-title" style="font-size: 16px;">${book.title}</h3>
                <div class="book-price">
                    <span class="current-price" style="font-size: 16px;">${book.price.toLocaleString('vi-VN')} đ</span>
                </div>
            </div>
        `;
        container.appendChild(bookCard);
    });
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

function buyNow(bookId) { addToCart(bookId); window.location.href = 'cart.html'; }

function viewDetail(bookId) {
    sessionStorage.setItem('selectedBookId', bookId);
    window.scrollTo(0, 0);
    window.location.reload();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countElement = document.querySelector('.cart-count');
    if(countElement) countElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');
    if (menuToggle && navbar) menuToggle.onclick = () => navbar.classList.toggle('active');
}
document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    
    // Cập nhật thông tin user trên header
    if (typeof updateHeaderUserInfo !== 'undefined') {
        updateHeaderUserInfo();
    }
    
    // Kích hoạt menu mobile (SỬA LỖI MENU KHÔNG CHẠY)
    setupMobileMenu();
});

function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-content');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-shopping-cart" style="font-size: 64px; color: #95a5a6; margin-bottom: 20px;"></i>
                <h3>Giỏ hàng trống</h3>
                <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <a href="../index.html" class="btn" style="margin-top: 20px;">
                    <i class="fas fa-book"></i> Tiếp tục mua sắm
                </a>
            </div>
        `;
        if (typeof updateHeaderUserInfo !== 'undefined') updateHeaderUserInfo();
        else updateCartCount();
        return;
    }
    
    let total = 0;
    let cartHTML = `
        <div class="cart-items">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 15px; text-align: left;">Sản phẩm</th>
                        <th style="padding: 15px; text-align: center;">Đơn giá</th>
                        <th style="padding: 15px; text-align: center;">SL</th>
                        <th style="padding: 15px; text-align: center;">Tiền</th>
                        <th style="padding: 15px; text-align: center;">Xóa</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="../${item.image}" alt="${item.title}" style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px;">
                        <div>
                            <h4 style="margin-bottom: 5px; font-size: 14px;">${item.title}</h4>
                            <p style="color: #7f8c8d; font-size: 12px;">${item.author}</p>
                        </div>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center; font-size: 14px;">
                    ${item.price.toLocaleString('vi-VN')} đ
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; gap: 5px;">
                        <button onclick="updateQuantity(${item.id}, -1)" style="width: 25px; height: 25px; border: 1px solid #ddd; background: white; border-radius: 4px;">-</button>
                        <span style="min-width: 20px; text-align: center; font-size: 14px;">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" style="width: 25px; height: 25px; border: 1px solid #ddd; background: white; border-radius: 4px;">+</button>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center; font-weight: bold; color: #e74c3c; font-size: 14px;">
                    ${itemTotal.toLocaleString('vi-VN')} đ
                </td>
                <td style="padding: 15px; text-align: center;">
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #e74c3c; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    cartHTML += `
                </tbody>
            </table>
            
            <div style="margin-top: 30px; padding: 25px; background-color: #f8f9fa; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3>Tổng cộng:</h3>
                    </div>
                    <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">
                        ${total.toLocaleString('vi-VN')} đ
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 25px; flex-direction: column;">
                    <button onclick="checkout()" class="btn" style="width: 100%; background-color: #27ae60; padding: 15px;">
                        <i class="fas fa-credit-card"></i> Thanh toán ngay
                    </button>
                    <a href="../index.html" class="btn" style="width: 100%; background-color: #95a5a6; padding: 15px; text-align: center;">
                        <i class="fas fa-arrow-left"></i> Tiếp tục mua sắm
                    </a>
                </div>
            </div>
        </div>
    `;
    
    cartContainer.innerHTML = cartHTML;
}

function updateQuantity(bookId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === bookId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        if (typeof updateHeaderUserInfo !== 'undefined') updateHeaderUserInfo();
        else updateCartCount();
    }
}

function removeFromCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== bookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    if (typeof updateHeaderUserInfo !== 'undefined') updateHeaderUserInfo();
    else updateCartCount();
}

function checkout() {
    alert('Chức năng thanh toán đang được phát triển!');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Hàm xử lý Menu Mobile (Đã thêm vào đây)
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar');
    
    if (menuToggle && navbar) {
        // Xóa sự kiện cũ để tránh trùng lặp nếu có
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
                // e.preventDefault(); // Nếu cần thiết
                this.classList.toggle('active');
            }
        });
    });
}
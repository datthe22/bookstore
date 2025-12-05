document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    if (typeof updateHeaderUserInfo !== 'undefined') {
        updateHeaderUserInfo();
    }
});

function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-content');
    
    // --- [SỬA LỖI Ở ĐÂY] ---
    // Nếu giỏ hàng trống, phải cập nhật lại HTML ngay lập tức chứ không được return luôn
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
        // Cập nhật lại số lượng trên Header về 0
        if (typeof updateHeaderUserInfo !== 'undefined') updateHeaderUserInfo();
        else updateCartCount();
        return;
    }
    // -----------------------
    
    let total = 0;
    let cartHTML = `
        <div class="cart-items">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 15px; text-align: left;">Sản phẩm</th>
                        <th style="padding: 15px; text-align: center;">Đơn giá</th>
                        <th style="padding: 15px; text-align: center;">Số lượng</th>
                        <th style="padding: 15px; text-align: center;">Thành tiền</th>
                        <th style="padding: 15px; text-align: center;">Thao tác</th>
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
                        <img src="../${item.image}" alt="${item.title}" style="width: 80px; height: 100px; object-fit: cover; border-radius: 4px;">
                        <div>
                            <h4 style="margin-bottom: 5px;">${item.title}</h4>
                            <p style="color: #7f8c8d;">${item.author}</p>
                        </div>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center;">
                    ${item.price.toLocaleString('vi-VN')} đ
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; gap: 10px;">
                        <button onclick="updateQuantity(${item.id}, -1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">-</button>
                        <span style="min-width: 30px; display: inline-block;">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">+</button>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center; font-weight: bold; color: #e74c3c;">
                    ${itemTotal.toLocaleString('vi-VN')} đ
                </td>
                <td style="padding: 15px; text-align: center;">
                    <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #e74c3c; cursor: pointer;">
                        <i class="fas fa-trash"></i> Xóa
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
                        <p style="color: #7f8c8d; font-size: 14px;">Đã bao gồm VAT (nếu có)</p>
                    </div>
                    <div style="font-size: 32px; font-weight: bold; color: #e74c3c;">
                        ${total.toLocaleString('vi-VN')} đ
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <a href="../index.html" class="btn" style="background-color: #95a5a6;">
                        <i class="fas fa-arrow-left"></i> Tiếp tục mua sắm
                    </a>
                    <button onclick="checkout()" class="btn" style="flex: 1; background-color: #27ae60;">
                        <i class="fas fa-credit-card"></i> Thanh toán
                    </button>
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
        
        // Nếu số lượng <= 0 thì xóa sản phẩm
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems(); // Gọi lại hàm hiển thị
        
        // Cập nhật header
        if (typeof updateHeaderUserInfo !== 'undefined') {
            updateHeaderUserInfo();
        } else {
            updateCartCount();
        }
    }
}

function removeFromCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== bookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    displayCartItems(); // Gọi lại hàm hiển thị -> Nó sẽ check length === 0 và hiện thông báo trống
    
    // Cập nhật header
    if (typeof updateHeaderUserInfo !== 'undefined') {
        updateHeaderUserInfo();
    } else {
        updateCartCount();
    }
}

function checkout() {
    alert('Chức năng thanh toán đang được phát triển. Đây chỉ là demo cho bài tập!');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}
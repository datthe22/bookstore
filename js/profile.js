document.addEventListener('DOMContentLoaded', function() {
    // 1. Kiểm tra đăng nhập
    if (!authManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = authManager.getCurrentUser();
    
    // 2. Điền thông tin vào Sidebar và Form
    document.getElementById('sidebarName').textContent = currentUser.fullName;
    document.getElementById('avatarImg').src = `https://ui-avatars.com/api/?name=${currentUser.fullName}&background=random`;
    
    document.getElementById('profileName').value = currentUser.fullName;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone;

    // 3. Tải lịch sử đơn hàng
    loadUserOrders(currentUser.id);

    // --- XỬ LÝ LƯU THÔNG TIN ---
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newName = document.getElementById('profileName').value;
        const newPhone = document.getElementById('profilePhone').value;

        // Cập nhật trong mảng users gốc
        const users = authManager.getUsers();
        const index = users.findIndex(u => u.id === currentUser.id);
        
        if (index !== -1) {
            users[index].fullName = newName;
            users[index].phone = newPhone;
            
            // Lưu lại localStorage
            authManager.saveUsers(users);
            authManager.setCurrentUser(users[index]);
            
            showNotification('Cập nhật hồ sơ thành công!', 'success');
            setTimeout(() => location.reload(), 1000);
        }
    });

    // --- XỬ LÝ ĐỔI MẬT KHẨU ---
    document.getElementById('changePassForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const currentPass = document.getElementById('currentPass').value;
        const newPass = document.getElementById('newPass').value;
        const confirmPass = document.getElementById('confirmPass').value;

        if (currentPass !== currentUser.password) {
            showNotification('Mật khẩu hiện tại không đúng', 'error');
            return;
        }
        if (newPass.length < 6) {
            showNotification('Mật khẩu mới phải từ 6 ký tự', 'error');
            return;
        }
        if (newPass !== confirmPass) {
            showNotification('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        // Cập nhật pass
        const users = authManager.getUsers();
        const index = users.findIndex(u => u.id === currentUser.id);
        users[index].password = newPass;
        
        authManager.saveUsers(users);
        authManager.setCurrentUser(users[index]); // Cập nhật session hiện tại
        
        showNotification('Đổi mật khẩu thành công!', 'success');
        document.getElementById('changePassForm').reset();
    });
});

// Chuyển Tab (Info / Orders / Password)
function switchTab(tabName) {
    // Ẩn tất cả tab
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(el => el.classList.remove('active'));
    
    // Hiện tab được chọn
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`nav-${tabName}`).classList.add('active');
}

// Tải đơn hàng của user
// Thay thế hàm loadUserOrders cũ bằng hàm mới này
function loadUserOrders(userId) {
    const allOrders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    const myOrders = allOrders.filter(o => o.userId === userId).reverse(); // Đảo ngược để đơn mới nhất lên đầu
    
    // Lưu ý: Bây giờ chúng ta render vào thẻ div chứa danh sách, không phải table body nữa
    // Bạn cần sửa HTML của tab-orders trong file profile.html trước:
    // Thay thế toàn bộ <table>...</table> bằng <div id="myOrdersList"></div>
    
    const container = document.getElementById('myOrdersList');
    container.innerHTML = '';

    if (myOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <img src="../images/empty-cart.png" style="width:100px; opacity:0.5; margin-bottom:15px;">
                <p style="color:#777;">Bạn chưa có đơn hàng nào.</p>
                <a href="../index.html" class="btn-save" style="display:inline-block; margin-top:10px; text-decoration:none;">Mua sắm ngay</a>
            </div>`;
        return;
    }

    myOrders.forEach(order => {
        let statusColor = '#f39c12'; 
        let statusText = 'Chờ xử lý';
        let statusBg = '#fff8e1';
        
        if (order.status === 'shipping') { statusColor = '#fd7e14'; statusText = 'Đang giao'; statusBg = '#fff3e0'; } // Màu cam
        if (order.status === 'approved') { statusColor = '#27ae60'; statusText = 'Hoàn thành'; statusBg = '#e8f5e9'; }
        if (order.status === 'cancelled') { statusColor = '#e74c3c'; statusText = 'Đã hủy'; statusBg = '#ffebee'; }

        const date = new Date(order.date).toLocaleDateString('vi-VN');
        const firstItem = order.items[0];
        const otherItemsCount = order.items.length - 1;

        const orderHTML = `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <strong>#${order.id.slice(-6)}</strong>
                        <span style="margin: 0 10px; color:#ddd;">|</span>
                        <span>${date}</span>
                    </div>
                    <span style="background:${statusBg}; color:${statusColor}; padding:4px 12px; border-radius:20px; font-weight:500; font-size:12px; border:1px solid ${statusColor}30;">
                        ${statusText}
                    </span>
                </div>
                <div class="order-body">
                    <div class="order-item-preview">
                        <img src="../${firstItem.image}" alt="${firstItem.title}">
                        <div class="order-item-info">
                            <h4>${firstItem.title}</h4>
                            <p style="font-size:13px; color:#888;">x${firstItem.quantity}</p>
                        </div>
                    </div>
                    ${otherItemsCount > 0 ? `<div style="font-size:13px; color:#888; margin-top:5px; padding-left:75px;">và ${otherItemsCount} sản phẩm khác...</div>` : ''}
                </div>
                <div class="order-footer">
                <div class="total-price">
                    <span style="font-size: 14px; color: #888; font-weight: 400;">Tổng tiền:</span> 
                    ${order.total.toLocaleString('vi-VN')} đ
                </div>

                <div style="width: 100%; text-align: right; border-top: 1px dashed #eee; padding-top: 10px;">
                    <button class="btn-detail" onclick="viewOrderDetail('${order.id}')">Xem chi tiết</button>
                    </div>
            </div>
            </div>
        `;
        container.innerHTML += orderHTML;
    });
}

// Hàm xem chi tiết đơn hàng (MỚI)
function viewOrderDetail(orderId) {
    const allOrders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    const order = allOrders.find(o => o.id === orderId);
    
    if (!order) return;

    // Điền thông tin vào Modal
    document.getElementById('modalOrderId').innerText = '#' + order.id.slice(-6);
    document.getElementById('modalReceiver').innerText = order.userName;
    document.getElementById('modalPhone').innerText = order.userPhone;
    document.getElementById('modalDate').innerText = new Date(order.date).toLocaleString('vi-VN');
    
    // Xử lý trạng thái hiển thị
    let statusText = 'Chờ xử lý';
    if (order.status === 'shipping') statusText = 'Đang giao hàng';
    if (order.status === 'approved') statusText = 'Giao hàng thành công';
    if (order.status === 'cancelled') statusText = 'Đã hủy';
    document.getElementById('modalStatus').innerText = statusText;

    // Render danh sách sản phẩm
    const productList = document.getElementById('modalProductsList');
    productList.innerHTML = '';
    
    order.items.forEach(item => {
        productList.innerHTML += `
            <div class="product-item">
                <img src="../${item.image}" style="width:60px; height:80px; object-fit:cover; border-radius:4px; border:1px solid #eee;">
                <div style="flex:1;">
                    <h4 style="margin:0 0 5px 0; font-size:14px; color:#333;">${item.title}</h4>
                    <div style="display:flex; justify-content:space-between; font-size:13px;">
                        <span style="color:#666;">x${item.quantity}</span>
                        <span style="font-weight:500;">${(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                    </div>
                </div>
            </div>
        `;
    });

    // Tổng tiền
    document.getElementById('modalSubTotal').innerText = order.total.toLocaleString('vi-VN') + ' đ';
    document.getElementById('modalTotal').innerText = order.total.toLocaleString('vi-VN') + ' đ';

    // Hiển thị modal
    document.getElementById('userOrderModal').style.display = 'block';
}

function closeUserModal() {
    document.getElementById('userOrderModal').style.display = 'none';
}

// Đóng modal khi click ra ngoài
window.onclick = function(event) {
    const modal = document.getElementById('userOrderModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
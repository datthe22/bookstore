document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboardStats();
    loadRecentOrders();
});

// 1. KIỂM TRA QUYỀN ADMIN
function checkAdminAuth() {
    const userJson = localStorage.getItem('bookstore_current_user');
    if (!userJson) {
        alert('Bạn chưa đăng nhập!');
        window.location.href = '../pages/login.html';
        return;
    }
    
    const user = JSON.parse(userJson);
    if (user.role !== 'admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '../index.html';
    }
}

// 2. TẢI THỐNG KÊ (STATS)
function loadDashboardStats() {
    // Lấy dữ liệu từ LocalStorage
    const users = JSON.parse(localStorage.getItem('bookstore_users')) || [];
    const products = JSON.parse(localStorage.getItem('bookstore_products')) || [];
    const orders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    
    // Tính toán
    const totalUsers = users.length; // Trừ 1 admin nếu muốn chính xác hơn
    const totalProducts = products.length;
    const totalOrders = orders.length;
    
    // Tính tổng doanh thu
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Hiển thị lên giao diện
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString('vi-VN') + ' đ';
}

// 3. TẢI ĐƠN HÀNG GẦN ĐÂY
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    const tableBody = document.getElementById('recent-orders-body');
    
    tableBody.innerHTML = '';

    // Lấy 5 đơn mới nhất
    const recentOrders = orders.slice(0, 5);

    if (recentOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa có đơn hàng nào.</td></tr>';
        return;
    }

    recentOrders.forEach(order => {
        const statusClass = order.status === 'pending' ? 'pending' : 'approved';
        const statusText = order.status === 'pending' ? 'Chờ xử lý' : 'Đã duyệt';
        const statusColor = order.status === 'pending' ? 'text-pending' : 'text-approved';
        
        // Format ngày giờ đẹp
        const dateObj = new Date(order.date);
        const dateStr = dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${order.id.slice(-6)}</td>
            <td>${order.userName}</td>
            <td>${dateStr}</td>
            <td>${order.total.toLocaleString('vi-VN')} đ</td>
            <td>
                <span class="status ${statusClass}"></span>
                <span class="${statusColor}">${statusText}</span>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// 4. ĐĂNG XUẤT
function handleLogout() {
    if(confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('bookstore_current_user');
        window.location.href = '../pages/login.html';
    }
}
let orders = [];
let currentOrderId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAdmin();
    loadOrders();
});

// 1. Kiểm tra Admin (Copy lại)
function checkAdmin() {
    const userJson = localStorage.getItem('bookstore_current_user');
    if (!userJson || JSON.parse(userJson).role !== 'admin') {
        alert('Truy cập bị từ chối!');
        window.location.href = '../index.html';
    }
}

// 2. Tải danh sách đơn hàng
function loadOrders() {
    orders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    const tableBody = document.getElementById('order-table-body');
    tableBody.innerHTML = '';

    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Chưa có đơn hàng nào</td></tr>';
        return;
    }

    orders.forEach(order => {
        // Xử lý màu sắc trạng thái
        let statusBadge = '';
        switch(order.status) {
            case 'pending': statusBadge = '<span class="status pending"></span>Chờ xử lý'; break;
           // Thay #3498db bằng #fd7e14
            case 'shipping': statusBadge = '<span class="status" style="background:#fd7e14; box-shadow:0 0 5px #fd7e14"></span>Đang giao'; break;
            case 'approved': statusBadge = '<span class="status approved"></span>Hoàn tất'; break;
            case 'cancelled': statusBadge = '<span class="status" style="background:#e74c3c; box-shadow:0 0 5px #e74c3c"></span>Đã hủy'; break;
        }

        const dateObj = new Date(order.date);
        const dateStr = dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${order.id.slice(-6)}</td>
            <td>
                <strong>${order.userName}</strong><br>
                <small>${order.userPhone}</small>
            </td>
            <td>${dateStr}</td>
            <td style="font-weight:bold;">${order.total.toLocaleString('vi-VN')} đ</td>
            <td>${statusBadge}</td>
            <td>
                <button class="action-btn" style="background:#3498db" onclick="viewOrder('${order.id}')"><i class="fas fa-eye"></i></button>
                <button class="action-btn btn-delete" onclick="deleteOrder('${order.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// 3. Xem chi tiết đơn hàng
window.viewOrder = function(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    currentOrderId = id; // Lưu ID đang xem để cập nhật trạng thái
    const modal = document.getElementById('orderModal');
    
    // Điền thông tin chung
    document.getElementById('detailOrderId').textContent = '#' + order.id.slice(-6);
    document.getElementById('detailName').textContent = order.userName;
    document.getElementById('detailPhone').textContent = order.userPhone;
    document.getElementById('detailDate').textContent = new Date(order.date).toLocaleString('vi-VN');
    document.getElementById('detailStatus').value = order.status;
    document.getElementById('detailTotal').textContent = order.total.toLocaleString('vi-VN') + ' đ';

    // Điền danh sách sách
    const itemsBody = document.getElementById('detailItems');
    itemsBody.innerHTML = '';
    
    order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 10px; display:flex; align-items:center; gap:10px;">
                <img src="../${item.image}" width="40" height="50" style="object-fit:cover; border-radius:4px;">
                ${item.title}
            </td>
            <td style="padding: 10px;">${item.price.toLocaleString('vi-VN')}</td>
            <td style="padding: 10px;">x${item.quantity}</td>
            <td style="padding: 10px;">${(item.price * item.quantity).toLocaleString('vi-VN')}</td>
        `;
        itemsBody.appendChild(row);
    });

    modal.style.display = 'block';
}

// 4. Cập nhật trạng thái đơn hàng
window.updateOrderStatus = function() {
    const newStatus = document.getElementById('detailStatus').value;
    const index = orders.findIndex(o => o.id === currentOrderId);
    
    if (index !== -1) {
        orders[index].status = newStatus;
        localStorage.setItem('bookstore_orders', JSON.stringify(orders));
        loadOrders(); // Vẽ lại bảng bên ngoài
        // alert('Đã cập nhật trạng thái!');
    }
}

// 5. Xóa đơn hàng
window.deleteOrder = function(id) {
    if(confirm('Bạn có chắc muốn xóa lịch sử đơn hàng này?')) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('bookstore_orders', JSON.stringify(orders));
        loadOrders();
    }
}

window.closeOrderModal = function() {
    document.getElementById('orderModal').style.display = 'none';
}

// Đóng khi click ngoài
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
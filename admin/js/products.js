// Biến toàn cục chứa danh sách sách
let products = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAdmin();
    loadProducts();
    
    // --- 1. ẢNH BÌA CHÍNH (Giữ nguyên logic cũ) ---
    const uploadInput = document.getElementById('uploadInput');
    const bookImageInput = document.getElementById('bookImage');
    const imagePreview = document.getElementById('imagePreview');

    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const fakePath = `images/books/${file.name}`;
                bookImageInput.value = fakePath;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    imagePreview.src = evt.target.result;
                    imagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 2. ẢNH XEM TRƯỚC (LOGIC MỚI: CHỌN FOLDER) ---
    const uploadFolderInput = document.getElementById('uploadFolderInput'); // Đã đổi ID
    const previewContainer = document.getElementById('previewContainer');
    const bookPreviewTextarea = document.getElementById('bookPreviewImages');

    if (uploadFolderInput) {
        uploadFolderInput.addEventListener('change', function(e) {
            previewContainer.innerHTML = '';
            let paths = '';
            
            // Lấy danh sách file trong thư mục vừa chọn
            // webkitdirectory sẽ trả về các file kèm theo đường dẫn tương đối
            const files = Array.from(e.target.files);
            
            // Lọc chỉ lấy ảnh (jpg, png, jpeg...) và giới hạn 4 ảnh
            const imageFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 4);

            imageFiles.forEach(file => {
                // file.webkitRelativePath sẽ có dạng: "de men phieu luu ky/anh1.jpg"
                // Ta chỉ cần ghép thêm "images/primages/" vào trước là xong!
                // KHÔNG CẦN NHẬP TAY NỮA
                const fullPath = `images/primages/${file.webkitRelativePath}`;
                
                paths += fullPath + '\n';

                // Hiển thị ảnh
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = document.createElement('img');
                    img.src = evt.target.result;
                    stylePreviewImage(img);
                    previewContainer.appendChild(img);
                }
                reader.readAsDataURL(file);
            });

            bookPreviewTextarea.value = paths.trim();
        });
    }
    
    document.getElementById('productForm').addEventListener('submit', handleSaveProduct);
});

// Các hàm bổ trợ (Giữ nguyên)
function checkAdmin() {
    const userJson = localStorage.getItem('bookstore_current_user');
    if (!userJson || JSON.parse(userJson).role !== 'admin') {
        alert('Truy cập bị từ chối!');
        window.location.href = '../index.html';
    }
}

function loadProducts() {
    products = JSON.parse(localStorage.getItem('bookstore_products')) || [];
    const tableBody = document.getElementById('product-table-body');
    tableBody.innerHTML = '';

    [...products].reverse().forEach(book => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${book.id}</td>
            <td><img src="../${book.image}" width="50" style="border-radius: 4px;"></td>
            <td><strong>${book.title}</strong><br><small style="color:gray">${book.author}</small></td>
            <td>${book.price.toLocaleString('vi-VN')} đ</td>
            <td><span class="status approved" style="background:#3498db"></span> ${book.category}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editProduct(${book.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn btn-delete" onclick="deleteProduct(${book.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openModal(mode = 'add') {
    document.getElementById('productModal').style.display = 'block';
    if(mode === 'add') {
        document.getElementById('modalTitle').textContent = 'Thêm sách mới';
        document.getElementById('productForm').reset();
        document.getElementById('bookId').value = ''; 
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('imagePreview').src = '';
        document.getElementById('previewContainer').innerHTML = '';
        document.getElementById('bookPreviewImages').value = '';
    }
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('productModal')) {
        closeModal();
    }
}

// LƯU SẢN PHẨM (Tự động Fix lỗi đường dẫn)
function handleSaveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('bookId').value;
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const price = Number(document.getElementById('bookPrice').value);
    
    let originalPriceVal = document.getElementById('bookOriginalPrice').value;
    const originalPrice = originalPriceVal ? Number(originalPriceVal) : (price + (price * 0.2));

    // Luôn replace \ thành /
    let image = document.getElementById('bookImage').value.replace(/\\/g, '/');
    
    const category = document.getElementById('bookCategory').value;
    const description = document.getElementById('bookDesc').value;
    const isBestseller = document.getElementById('bookBestseller').checked;

    // Luôn replace \ thành /
    const previewInput = document.getElementById('bookPreviewImages').value;
    let previewImages = previewInput.split('\n')
        .map(url => url.trim().replace(/\\/g, '/'))
        .filter(url => url !== '');
    
    if (previewImages.length === 0 && image) previewImages.push(image);

    if (id) {
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = { ...products[index], title, author, price, originalPrice, image, category, description, isBestseller, previewImages };
            alert('Cập nhật thành công!');
        }
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newBook = { id: newId, title, author, price, originalPrice, image, category, description, isBestseller, rating: 5.0, previewImages };
        products.push(newBook);
        alert('Thêm sách mới thành công!');
    }

    localStorage.setItem('bookstore_products', JSON.stringify(products));
    loadProducts();
    closeModal();
}

// SỬA SẢN PHẨM
window.editProduct = function(id) {
    const book = products.find(p => p.id == id);
    if (book) {
        openModal('edit');
        document.getElementById('modalTitle').textContent = 'Cập nhật sách';
        document.getElementById('bookId').value = book.id;
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author;
        document.getElementById('bookPrice').value = book.price;
        document.getElementById('bookOriginalPrice').value = book.originalPrice;
        document.getElementById('bookImage').value = book.image.replace(/\\/g, '/');
        document.getElementById('bookCategory').value = book.category;
        document.getElementById('bookDesc').value = book.description;
        document.getElementById('bookBestseller').checked = book.isBestseller;

        const mainPreview = document.getElementById('imagePreview');
        if (book.image) {
            mainPreview.src = '../' + book.image.replace(/\\/g, '/');
            mainPreview.style.display = 'block';
        } else { mainPreview.style.display = 'none'; }

        const previewContainer = document.getElementById('previewContainer');
        previewContainer.innerHTML = '';
        
        if (book.previewImages && Array.isArray(book.previewImages) && book.previewImages.length > 0) {
            const cleanPaths = book.previewImages.map(p => p.replace(/\\/g, '/'));
            document.getElementById('bookPreviewImages').value = cleanPaths.join('\n');
            
            cleanPaths.forEach(path => {
                const img = document.createElement('img');
                img.src = '../' + path; 
                stylePreviewImage(img);
                img.onerror = function() { this.style.display = 'none'; }; 
                previewContainer.appendChild(img);
            });
        } else {
            document.getElementById('bookPreviewImages').value = '';
        }
    }
}

function stylePreviewImage(img) {
    img.style.width = '60px'; img.style.height = '80px'; img.style.objectFit = 'cover'; img.style.border = '1px solid #ddd'; img.style.borderRadius = '4px'; img.style.marginRight = '5px';
}

window.deleteProduct = function(id) {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
        products = products.filter(p => p.id != id);
        localStorage.setItem('bookstore_products', JSON.stringify(products));
        loadProducts();
    }
}
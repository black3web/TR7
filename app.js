// app.js - الوظائف الرئيسية

// ===== الوضع الليلي =====
function initDarkMode() {
    const toggle = document.getElementById('mode-toggle');
    if (!toggle) return;
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // حفظ الحالة
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
    });
    
    // استعادة الحالة المحفوظة
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// ===== تحديث عداد السلة =====
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// ===== عرض المنتجات في الصفحة الرئيسية =====
function displayProductsOnIndex() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description.substring(0, 60)}...</p>
            <div class="product-price">${product.price} $</div>
            <div class="product-actions">
                <button class="add-to-cart" data-id="${product.id}">➕ أضف للسلة</button>
                <button class="view-details" onclick="window.location.href='product.html?id=${product.id}'">🔍 التفاصيل</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    // إضافة أحداث أزرار "أضف للسلة"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            addToCart(id);
        });
    });
}

// ===== إضافة منتج إلى السلة =====
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // التحقق من وجود المنتج بالفعل في السلة
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        alert('المنتج موجود بالفعل في السلة');
        return;
    }
    
    cart.push({ id: product.id, name: product.name, price: product.price });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('تمت الإضافة إلى السلة');
}

// ===== إزالة منتج من السلة =====
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart(); // إعادة عرض السلة
    updateCartCount();
}

// ===== عرض السلة =====
function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    if (!cartItemsDiv || !cartTotalSpan) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
        cartTotalSpan.textContent = '0';
        return;
    }
    
    let total = 0;
    cartItemsDiv.innerHTML = '';
    cart.forEach(item => {
        total += item.price;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>${item.price} $</p>
            </div>
            <button class="delete-product" data-id="${item.id}">إزالة</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    cartTotalSpan.textContent = total.toFixed(2);
    
    // أحداث الإزالة
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            removeFromCart(id);
        });
    });
    
    // زر إتمام الدفع
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (cart.length === 0) {
                alert('السلة فارغة');
                return;
            }
            // محاكاة عملية دفع ناجحة
            localStorage.setItem('cart', JSON.stringify([]));
            updateCartCount();
            renderCart();
            alert('تمت عملية الشراء بنجاح! شكراً لك.');
        };
    }
}

// ===== عرض تفاصيل المنتج =====
function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);
    const container = document.getElementById('product-detail');
    
    if (!container) return;
    
    if (!product) {
        container.innerHTML = '<p>المنتج غير موجود</p>';
        return;
    }
    
    container.innerHTML = `
        <h1>${product.name}</h1>
        <div class="rating">
            ${generateStars(product.rating)}
            <span>(${product.reviews} تقييم)</span>
        </div>
        <p class="product-price">${product.price} $</p>
        <p>${product.description}</p>
        <p>النوع: ${getTypeName(product.type)}</p>
        <p>تاريخ الإضافة: ${product.date}</p>
        <button class="btn-primary add-to-cart" data-id="${product.id}">أضف للسلة</button>
        <button class="btn-secondary" onclick="window.location.href='index.html'">العودة</button>
    `;
    
    document.querySelector('.add-to-cart')?.addEventListener('click', (e) => {
        addToCart(product.id);
    });
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    if (halfStar) stars += '½';
    const empty = 5 - Math.ceil(rating);
    for (let i = 0; i < empty; i++) stars += '☆';
    return stars;
}

function getTypeName(type) {
    const types = {
        ebook: 'كتاب إلكتروني',
        code: 'كود برمجي',
        design: 'قالب تصميم',
        audio: 'موسيقى'
    };
    return types[type] || type;
}

// ===== لوحة التحكم =====
function loadDashboard() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const sellerStats = JSON.parse(localStorage.getItem('sellerStats')) || { totalEarnings: 0, totalSales: 0 };
    
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-earnings').textContent = sellerStats.totalEarnings.toFixed(2) + ' $';
    
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    productList.innerHTML = '';
    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'product-list-item';
        item.innerHTML = `
            <div>
                <strong>${product.name}</strong> - ${product.price} $
            </div>
            <button class="delete-product" data-id="${product.id}">حذف</button>
        `;
        productList.appendChild(item);
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteProduct(id);
        });
    });
}

function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    loadDashboard(); // تحديث الواجهة
    // تحديث الإحصائيات بشكل وهمي
    let stats = JSON.parse(localStorage.getItem('sellerStats')) || { totalEarnings: 0, totalSales: 0 };
    stats.totalEarnings -= 10; // طرح وهمي
    localStorage.setItem('sellerStats', JSON.stringify(stats));
}

// ===== إضافة منتج جديد =====
function addProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const description = document.getElementById('description').value.trim();
    const type = document.getElementById('type').value;
    
    if (!name || isNaN(price) || !description) {
        alert('يرجى ملء جميع الحقول');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    const newProduct = {
        id: newId,
        name,
        price,
        description,
        type,
        rating: 5.0,
        reviews: 0,
        date: new Date().toISOString().split('T')[0]
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    // تحديث إحصائيات البائع بشكل وهمي (زيادة عدد المنتجات)
    let stats = JSON.parse(localStorage.getItem('sellerStats')) || { totalEarnings: 0, totalSales: 0 };
    stats.totalEarnings += price * 0.7; // إضافة وهمية للأرباح
    localStorage.setItem('sellerStats', JSON.stringify(stats));
    
    alert('تمت إضافة المنتج بنجاح');
    window.location.href = 'dashboard.html';
}

// ===== تهيئة الصفحات =====
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    updateCartCount();
    
    // تنفيذ الدوال حسب الصفحة
    if (window.location.pathname.includes('product.html')) {
        loadProductDetail();
    }
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboard();
    }
    if (window.location.pathname.includes('add-item.html')) {
        // النموذج مرتبط بالفعل
    }
});
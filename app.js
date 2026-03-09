// app.js - العقل المدبر للمشروع (نسخة OOP)

// ==============================================
// 1. كلاس الإشعارات (Toast Notifications)
// ==============================================
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 300px;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? 'var(--accent)' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 60px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        toast.innerHTML = `
            <span>${type === 'success' ? '✅' : '❌'}</span>
            <span>${message}</span>
        `;
        this.container.appendChild(toast);

        // إضافة حركة الاختفاء
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// ==============================================
// 2. كلاس إدارة السلة
// ==============================================
class CartManager {
    constructor(notificationManager) {
        this.notifier = notificationManager;
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.couponManager = new CouponManager();
    }

    // حفظ السلة في localStorage
    save() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    // تحديث عداد السلة في جميع الصفحات
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(el => {
            if (el) el.textContent = this.cart.length;
        });
    }

    // إضافة منتج إلى السلة
    add(productId) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);
        if (!product) return false;

        // التحقق من التكرار
        if (this.cart.some(item => item.id === productId)) {
            this.notifier.show('المنتج موجود بالفعل في السلة', 'error');
            return false;
        }

        this.cart.push({
            id: product.id,
            name: product.name,
            price: product.price
        });
        this.save();
        this.notifier.show('تمت الإضافة إلى السلة', 'success');
        return true;
    }

    // إزالة منتج
    remove(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.save();
        this.notifier.show('تمت الإزالة من السلة', 'success');
    }

    // الحصول على إجمالي السعر
    getTotal() {
        return this.cart.reduce((sum, item) => sum + item.price, 0);
    }

    // تطبيق كود خصم
    applyCoupon(code) {
        const discount = this.couponManager.validateCoupon(code);
        if (discount > 0) {
            return { success: true, discount };
        }
        return { success: false, message: 'كود خصم غير صالح' };
    }

    // إفراغ السلة
    clear() {
        this.cart = [];
        this.save();
    }
}

// ==============================================
// 3. كلاس إدارة الكوبونات
// ==============================================
class CouponManager {
    constructor() {
        // كوبونات وهمية (يمكن تخزينها في localStorage)
        this.coupons = {
            'SAVE10': 10,   // خصم 10%
            'SAVE20': 20,
            'WELCOME': 15
        };
    }

    validateCoupon(code) {
        const upperCode = code.toUpperCase().trim();
        return this.coupons[upperCode] || 0;
    }
}

// ==============================================
// 4. كلاس إدارة المنتجات والزيارات
// ==============================================
class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.viewStats = JSON.parse(localStorage.getItem('viewStats')) || {};
    }

    // حفظ الإحصائيات
    saveViews() {
        localStorage.setItem('viewStats', JSON.stringify(this.viewStats));
    }

    // زيادة عدد مشاهدات المنتج
    incrementView(productId) {
        if (!this.viewStats[productId]) {
            this.viewStats[productId] = 0;
        }
        this.viewStats[productId] += 1;
        this.saveViews();
        return this.viewStats[productId];
    }

    // الحصول على المنتج مع عدد المشاهدات
    getProductWithViews(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return null;
        return {
            ...product,
            views: this.viewStats[productId] || 0
        };
    }

    // الحصول على المنتجات الأكثر مشاهدة (لـ trending)
    getTrendingProducts(limit = 3) {
        const productsWithViews = this.products.map(p => ({
            ...p,
            views: this.viewStats[p.id] || 0
        }));
        return productsWithViews.sort((a, b) => b.views - a.views).slice(0, limit);
    }

    // إضافة منتج جديد
    addProduct(productData) {
        const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            ...productData,
            rating: 5.0,
            reviews: 0,
            date: new Date().toISOString().split('T')[0]
        };
        this.products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(this.products));
        return newProduct;
    }

    // حذف منتج
    deleteProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(this.products));
        // حذف إحصائيات المشاهدات لهذا المنتج
        delete this.viewStats[productId];
        this.saveViews();
    }
}

// ==============================================
// 5. كلاس محرك البحث
// ==============================================
class SearchEngine {
    constructor(productManager) {
        this.productManager = productManager;
    }

    // البحث في الاسم والوصف والنوع
    search(query, filters = {}) {
        let results = this.productManager.products;

        // البحث النصي
        if (query && query.trim() !== '') {
            const q = query.toLowerCase().trim();
            results = results.filter(p => 
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                (p.type && p.type.toLowerCase().includes(q))
            );
        }

        // تطبيق الفلاتر (التصنيف، السعر)
        if (filters.type && filters.type !== 'all') {
            results = results.filter(p => p.type === filters.type);
        }
        if (filters.priceRange) {
            switch (filters.priceRange) {
                case '0-25':
                    results = results.filter(p => p.price < 25);
                    break;
                case '25-50':
                    results = results.filter(p => p.price >= 25 && p.price <= 50);
                    break;
                case '50-100':
                    results = results.filter(p => p.price > 50 && p.price <= 100);
                    break;
                case '100+':
                    results = results.filter(p => p.price > 100);
                    break;
            }
        }

        return results;
    }
}

// ==============================================
// 6. كلاس إدارة الإحصائيات (للبيع)
// ==============================================
class StatsManager {
    constructor() {
        this.stats = JSON.parse(localStorage.getItem('sellerStats')) || {
            totalEarnings: 1250.75,
            totalSales: 87
        };
    }

    save() {
        localStorage.setItem('sellerStats', JSON.stringify(this.stats));
    }

    addSale(amount) {
        this.stats.totalSales += 1;
        this.stats.totalEarnings += amount * 0.7; // 70% للبائع
        this.save();
    }

    getStats() {
        return this.stats;
    }
}

// ==============================================
// 7. تهيئة الكائنات العامة
// ==============================================
const notifier = new NotificationManager();
const cartManager = new CartManager(notifier);
const productManager = new ProductManager();
const searchEngine = new SearchEngine(productManager);
const statsManager = new StatsManager();

// ==============================================
// 8. دوال مساعدة للواجهات (UI Helpers)
// ==============================================

// عرض المنتجات في شبكة (لصفحة index)
function displayProducts(products, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = '';
    if (products.length === 0) {
        grid.innerHTML = '<p class="no-results">لا توجد منتجات مطابقة</p>';
        return;
    }
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

    // ربط أزرار الإضافة
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            cartManager.add(id);
        });
    });
}

// ==============================================
// 9. منطق الصفحات المختلفة
// ==============================================

// الصفحة الرئيسية (index.html)
function initIndexPage() {
    // عرض جميع المنتجات
    displayProducts(productManager.products, 'product-grid');

    // عرض المنتجات الأكثر رواجاً
    const trending = productManager.getTrendingProducts(3);
    displayProducts(trending, 'trending-grid');

    // إعداد الفلترة والبحث
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const priceFilter = document.getElementById('priceFilter');

    if (searchInput && typeFilter && priceFilter) {
        const filterHandler = () => {
            const query = searchInput.value;
            const filters = {
                type: typeFilter.value,
                priceRange: priceFilter.value
            };
            const results = searchEngine.search(query, filters);
            displayProducts(results, 'product-grid');
        };

        searchInput.addEventListener('input', filterHandler);
        typeFilter.addEventListener('change', filterHandler);
        priceFilter.addEventListener('change', filterHandler);
    }

    // تصنيفات عائمة
    document.querySelectorAll('.category-floating-item').forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            if (typeFilter) {
                typeFilter.value = category;
                filterHandler();
            }
        });
    });
}

// صفحة تفاصيل المنتج (product.html)
function initProductPage() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    if (!id) return;

    // تسجيل الزيارة
    productManager.incrementView(id);

    const product = productManager.getProductWithViews(id);
    const container = document.getElementById('product-detail');
    if (!container) return;

    if (!product) {
        container.innerHTML = '<p>المنتج غير موجود</p>';
        return;
    }

    // بيانات وهمية للتقييمات
    const ratingsDistribution = {5:45,4:30,3:15,2:7,1:3};
    const totalRatings = Object.values(ratingsDistribution).reduce((a,b)=>a+b,0);
    const liveViewers = Math.floor(Math.random() * 15) + 8;
    const thumbnails = ['📄','🔍','⚙️','📁'];

    // بناء HTML
    let html = `
        <div class="live-viewers">
            <span class="viewers-dot"></span>
            <span>👀 ${liveViewers} شخص يشاهدون هذا المنتج الآن</span>
        </div>
        <h1>${product.name}</h1>
        <div class="product-gallery">
            <div class="main-image" id="mainImage">${getTypeIcon(product.type)}</div>
            <div class="thumbnail-list">
                ${thumbnails.map((icon, index) => `
                    <div class="thumbnail ${index===0?'active':''}" data-icon="${icon}">${icon}</div>
                `).join('')}
            </div>
        </div>
        <div class="trust-bar">
            <div class="trust-item"><span class="trust-icon">🔒</span><span>تحميل آمن</span></div>
            <div class="trust-item"><span class="trust-icon">💬</span><span>دعم فني 24/7</span></div>
            <div class="trust-item"><span class="trust-icon">🔄</span><span>تحديثات مدى الحياة</span></div>
        </div>
        <p class="product-price">${product.price} $</p>
        <p>${product.description}</p>
        <p>النوع: ${getTypeName(product.type)}</p>
        <p>تاريخ الإضافة: ${product.date}</p>
        <p>عدد المشاهدات: ${product.views}</p>
        <button class="btn-primary add-to-cart" data-id="${product.id}">أضف للسلة</button>
        <button class="btn-secondary" onclick="window.location.href='index.html'">العودة</button>
        <div class="rating-detailed">
            <h3>تقييمات العملاء</h3>
            ${[5,4,3,2,1].map(star => {
                const count = ratingsDistribution[star];
                const percent = totalRatings>0 ? (count/totalRatings*100).toFixed(0) : 0;
                return `
                    <div class="rating-row">
                        <span class="rating-stars">${'★'.repeat(star)}${'☆'.repeat(5-star)}</span>
                        <div class="progress-bar-container"><div class="progress-bar" style="width:${percent}%"></div></div>
                        <span class="rating-percent">${percent}%</span>
                    </div>
                `;
            }).join('')}
            <p>متوسط التقييم: ${product.rating} / 5 (${product.reviews} تقييم)</p>
        </div>
    `;
    container.innerHTML = html;

    // معرض الصور
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('mainImage').textContent = this.dataset.icon;
        });
    });

    // زر الإضافة
    document.querySelector('.add-to-cart')?.addEventListener('click', () => {
        cartManager.add(product.id);
    });

    // عرض منتجات ذات صلة
    displayRelatedProducts(product.id, product.type);
}

function displayRelatedProducts(currentId, currentType) {
    let products = productManager.products.filter(p => p.type === currentType && p.id !== currentId);
    if (products.length < 3) {
        const others = productManager.products.filter(p => p.type !== currentType && p.id !== currentId);
        products = [...products, ...others].slice(0, 3);
    }
    products = products.sort(() => 0.5 - Math.random()).slice(0, 3);

    const relatedSection = document.createElement('div');
    relatedSection.className = 'related-products';
    relatedSection.innerHTML = '<h3>منتجات ذات صلة</h3><div class="related-grid" id="relatedGrid"></div>';
    document.getElementById('product-detail').appendChild(relatedSection);

    const grid = document.getElementById('relatedGrid');
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'related-card';
        card.onclick = () => window.location.href = `product.html?id=${p.id}`;
        card.innerHTML = `
            <div style="font-size:2rem; text-align:center; margin-bottom:10px;">${getTypeIcon(p.type)}</div>
            <h4>${p.name}</h4>
            <p style="color:var(--accent); font-weight:bold;">${p.price} $</p>
        `;
        grid.appendChild(card);
    });
}

// صفحة السلة (cart.html)
function initCartPage() {
    const container = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const couponInput = document.getElementById('coupon-code');
    const applyCouponBtn = document.getElementById('apply-coupon');

    function renderCart() {
        const cart = cartManager.cart;
        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-cart">السلة فارغة</p>';
            totalSpan.textContent = '0';
            return;
        }
        let total = 0;
        container.innerHTML = '';
        cart.forEach(item => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.price} $</p>
                </div>
                <button class="delete-product" data-id="${item.id}">إزالة</button>
            `;
            container.appendChild(div);
        });
        totalSpan.textContent = total.toFixed(2);

        // أحداث الإزالة
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                cartManager.remove(id);
                renderCart();
            });
        });
    }

    renderCart();

    // تطبيق الكوبون
    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener('click', () => {
            const code = couponInput.value;
            const result = cartManager.applyCoupon(code);
            if (result.success) {
                const discount = result.discount;
                const currentTotal = cartManager.getTotal();
                const newTotal = currentTotal * (1 - discount / 100);
                totalSpan.textContent = newTotal.toFixed(2);
                notifier.show(`تم تطبيق خصم ${discount}%`, 'success');
            } else {
                notifier.show(result.message, 'error');
            }
        });
    }

    // إتمام الدفع
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartManager.cart.length === 0) {
                notifier.show('السلة فارغة', 'error');
                return;
            }
            // تسجيل عملية البيع في الإحصائيات
            cartManager.cart.forEach(item => statsManager.addSale(item.price));
            cartManager.clear();
            renderCart();
            notifier.show('تمت عملية الشراء بنجاح!', 'success');
        });
    }
}

// لوحة التحكم (dashboard.html)
function initDashboardPage() {
    const products = productManager.products;
    const stats = statsManager.getStats();

    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-earnings').textContent = stats.totalEarnings.toFixed(2) + ' $';

    // رسم المخططات (كما في السابق)
    renderDailySalesChart();
    renderMonthlyEarningsChart();

    // قائمة المنتجات
    const productList = document.getElementById('product-list');
    if (productList) {
        productList.innerHTML = '';
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <div><strong>${product.name}</strong> - ${product.price} $</div>
                <button class="delete-product" data-id="${product.id}">حذف</button>
            `;
            productList.appendChild(item);
        });
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                productManager.deleteProduct(id);
                initDashboardPage(); // تحديث
                notifier.show('تم حذف المنتج', 'success');
            });
        });
    }

    // آخر العمليات (بيانات وهمية)
    const activities = [
        { product: 'قالب متجر إلكتروني', buyer: 'أحمد محمد', price: 49.99, date: '2025-03-09' },
        { product: 'كتيب تعلم JavaScript', buyer: 'سارة خالد', price: 29.99, date: '2025-03-08' },
        { product: 'مكتبة تايمر', buyer: 'عمر حسن', price: 19.99, date: '2025-03-07' }
    ];
    const tbody = document.getElementById('activity-list');
    if (tbody) {
        tbody.innerHTML = '';
        activities.forEach(act => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${act.product}</td><td>${act.buyer}</td><td>${act.price} $</td><td>${act.date}</td>`;
            tbody.appendChild(row);
        });
    }
}

function renderDailySalesChart() {
    const chart = document.getElementById('dailySalesChart');
    if (!chart) return;
    const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const salesData = [12,19,8,15,22,27,18];
    const max = Math.max(...salesData);
    chart.innerHTML = '';
    days.forEach((day,i) => {
        const barHeight = (salesData[i] / max) * 150;
        const div = document.createElement('div');
        div.className = 'bar-container';
        div.innerHTML = `
            <div class="bar" style="height:${barHeight}px;"></div>
            <span class="bar-label">${day.slice(0,2)}</span>
            <span class="bar-label" style="font-size:0.7rem;">${salesData[i]}</span>
        `;
        chart.appendChild(div);
    });
}

function renderMonthlyEarningsChart() {
    const chart = document.getElementById('monthlyEarningsChart');
    if (!chart) return;
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو'];
    const earningsData = [450,620,380,710,890,540];
    const max = Math.max(...earningsData);
    chart.innerHTML = '';
    months.forEach((month,i) => {
        const barHeight = (earningsData[i] / max) * 150;
        const div = document.createElement('div');
        div.className = 'bar-container';
        div.innerHTML = `
            <div class="bar" style="height:${barHeight}px;"></div>
            <span class="bar-label">${month.slice(0,3)}</span>
            <span class="bar-label" style="font-size:0.7rem;">${earningsData[i]}$</span>
        `;
        chart.appendChild(div);
    });
}

// صفحة إضافة منتج (add-item.html)
function initAddItemPage() {
    const form = document.getElementById('add-product-form');
    if (!form) return;

    // معالجة متعددة الخطوات (موجودة في HTML، نضيف التحقق والتقديم)
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.form-step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    let currentStep = 0;

    function updateStepUI() {
        stepContents.forEach((content, idx) => {
            content.classList.toggle('active-step', idx === currentStep);
        });
        steps.forEach((step, idx) => {
            step.classList.toggle('active', idx === currentStep);
            step.classList.toggle('completed', idx < currentStep);
        });
        prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
        if (currentStep === steps.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    }

    function validateStep() {
        const inputs = stepContents[currentStep].querySelectorAll('input, select, textarea');
        let valid = true;
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                valid = false;
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = '';
            }
        });
        return valid;
    }

    nextBtn?.addEventListener('click', () => {
        if (validateStep() && currentStep < steps.length - 1) {
            currentStep++;
            updateStepUI();
        }
    });

    prevBtn?.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateStepUI();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        const name = document.getElementById('name').value.trim();
        const type = document.getElementById('type').value;
        const price = parseFloat(document.getElementById('price').value);
        const description = document.getElementById('description').value.trim();

        if (isNaN(price) || price <= 0) {
            notifier.show('السعر غير صالح', 'error');
            return;
        }

        const newProduct = productManager.addProduct({ name, type, price, description });
        // تحديث إحصائيات البائع بشكل وهمي
        statsManager.stats.totalEarnings += price * 0.7;
        statsManager.save();

        notifier.show('تمت إضافة المنتج بنجاح', 'success');
        window.location.href = 'dashboard.html';
    });

    // معاينة الصور (محاكاة)
    const uploadBtn = document.getElementById('uploadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const previewArea = document.getElementById('imagePreview');
    if (uploadBtn && imageUpload) {
        uploadBtn.addEventListener('click', () => imageUpload.click());
        imageUpload.addEventListener('change', () => {
            const files = Array.from(imageUpload.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = () => {
                    const preview = document.createElement('div');
                    preview.className = 'preview-image';
                    preview.innerHTML = `
                        <span>🖼️</span>
                        <span class="remove-image" onclick="this.parentElement.remove()">×</span>
                    `;
                    previewArea.appendChild(preview);
                };
                reader.readAsDataURL(file);
            });
            imageUpload.value = '';
        });
    }

    updateStepUI();
}

// دوال مساعدة
function getTypeIcon(type) {
    const icons = { ebook: '📚', code: '{ }', design: '🎨', audio: '🎵' };
    return icons[type] || '📁';
}

function getTypeName(type) {
    const names = { ebook: 'كتاب إلكتروني', code: 'كود برمجي', design: 'قالب تصميم', audio: 'موسيقى' };
    return names[type] || type;
}

// الوضع الليلي
function initDarkMode() {
    const toggle = document.getElementById('mode-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// ==============================================
// 10. التهيئة العامة
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    cartManager.updateCartCount();

    // تحديد الصفحة الحالية
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        initIndexPage();
    } else if (path.includes('product.html')) {
        initProductPage();
    } else if (path.includes('cart.html')) {
        initCartPage();
    } else if (path.includes('dashboard.html')) {
        initDashboardPage();
    } else if (path.includes('add-item.html')) {
        initAddItemPage();
    }
});

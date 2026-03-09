// data.js - تهيئة البيانات الافتراضية في localStorage (نسخة متطورة)

(function initializeData() {
    // ==============================================
    // 1. المنتجات الافتراضية (8 منتجات متنوعة)
    // ==============================================
    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            {
                id: 1,
                name: 'قالب متجر إلكتروني متكامل',
                price: 49.99,
                description: 'قالب HTML/CSS احترافي لمتجر إلكتروني، متجاوب وسهل التعديل. يتضمن 5 صفحات رئيسية ولوحة تحكم بسيطة.',
                type: 'design',
                rating: 4.5,
                reviews: 128,
                views: 1543, // عدد المشاهدات الوهمي
                date: '2025-02-15'
            },
            {
                id: 2,
                name: 'كتيب تعلم JavaScript من الصفر',
                price: 29.99,
                description: 'كتاب إلكتروني شامل يشرح JavaScript من الأساسيات إلى الاحتراف. يحتوي على 300 صفحة وأمثلة عملية.',
                type: 'ebook',
                rating: 4.8,
                reviews: 342,
                views: 2789,
                date: '2025-02-10'
            },
            {
                id: 3,
                name: 'مكتبة تايمر متقدمة',
                price: 19.99,
                description: 'كود برمجي لمكتبة تايمر بلغة JavaScript مع أمثلة. تساعدك في إدارة الوقت والمؤقتات بسهولة.',
                type: 'code',
                rating: 4.2,
                reviews: 89,
                views: 876,
                date: '2025-02-05'
            },
            {
                id: 4,
                name: 'موسيقى تصويرية هادئة',
                price: 9.99,
                description: 'مجموعة من المقاطع الموسيقية الخالية من الحقوق لمشاريعك. 10 مقاطع عالية الجودة.',
                type: 'audio',
                rating: 4.6,
                reviews: 215,
                views: 1322,
                date: '2025-02-01'
            },
            {
                id: 5,
                name: 'حزمة أيقونات احترافية',
                price: 14.99,
                description: '500 أيقونة بصيغة SVG و PNG بتصميم حديث، مثالية لتطبيقات الويب والموبايل.',
                type: 'design',
                rating: 4.7,
                reviews: 67,
                views: 945,
                date: '2025-01-28'
            },
            {
                id: 6,
                name: 'دليل تعلم React',
                price: 39.99,
                description: 'كتاب إلكتروني لتعلم React من الصفر حتى بناء تطبيقات كاملة. يشمل مشاريع عملية.',
                type: 'ebook',
                rating: 4.9,
                reviews: 178,
                views: 2103,
                date: '2025-01-20'
            },
            {
                id: 7,
                name: 'أداة تحليل النصوص',
                price: 24.99,
                description: 'سكريبت JavaScript لتحليل النصوص وإحصائيات الكلمات. سهل الدمج مع أي مشروع.',
                type: 'code',
                rating: 4.3,
                reviews: 42,
                views: 634,
                date: '2025-01-15'
            },
            {
                id: 8,
                name: 'مؤثرات صوتية للألعاب',
                price: 12.99,
                description: 'حزمة مؤثرات صوتية عالية الجودة للألعاب (انفجارات، قفز، خلفيات). 50 ملف MP3.',
                type: 'audio',
                rating: 4.4,
                reviews: 93,
                views: 782,
                date: '2025-01-10'
            }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }

    // ==============================================
    // 2. إحصائيات الزيارات (viewStats)
    // ==============================================
    if (!localStorage.getItem('viewStats')) {
        // نستخدم نفس المشاهدات الموجودة في المنتجات
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const viewStats = {};
        products.forEach(p => {
            viewStats[p.id] = p.views || Math.floor(Math.random() * 2000) + 500; // إذا لم تكن موجودة
        });
        localStorage.setItem('viewStats', JSON.stringify(viewStats));
    }

    // ==============================================
    // 3. الكوبونات (coupons)
    // ==============================================
    if (!localStorage.getItem('coupons')) {
        const coupons = {
            'SAVE10': 10,
            'SAVE20': 20,
            'WELCOME': 15,
            'SPECIAL': 25,
            'FREESHIP': 5 // خصم بسيط
        };
        localStorage.setItem('coupons', JSON.stringify(coupons));
    }

    // ==============================================
    // 4. بيانات البائع (sellerStats) - محدثة
    // ==============================================
    if (!localStorage.getItem('sellerStats')) {
        const sellerStats = {
            totalEarnings: 1250.75,
            totalSales: 87,
            totalProducts: 8,
            monthlyGrowth: 12.5 // نسبة نمو وهمية
        };
        localStorage.setItem('sellerStats', JSON.stringify(sellerStats));
    }

    // ==============================================
    // 5. آخر العمليات (recentActivities) - لوحة التحكم
    // ==============================================
    if (!localStorage.getItem('recentActivities')) {
        const recentActivities = [
            { product: 'قالب متجر إلكتروني', buyer: 'أحمد محمد', price: 49.99, date: '2025-03-09' },
            { product: 'كتيب تعلم JavaScript', buyer: 'سارة خالد', price: 29.99, date: '2025-03-08' },
            { product: 'مكتبة تايمر متقدمة', buyer: 'عمر حسن', price: 19.99, date: '2025-03-07' },
            { product: 'موسيقى تصويرية هادئة', buyer: 'نورة عبدالله', price: 9.99, date: '2025-03-06' },
            { product: 'حزمة أيقونات احترافية', buyer: 'فيصل القحطاني', price: 14.99, date: '2025-03-05' }
        ];
        localStorage.setItem('recentActivities', JSON.stringify(recentActivities));
    }

    // ==============================================
    // 6. سلة المشتريات (cart) - فارغة افتراضياً
    // ==============================================
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // ==============================================
    // 7. تفضيلات المستخدم (مثل الوضع الليلي) - لا نضبطها هنا، ستُدار من app.js
    // ==============================================

    console.log('✅ Data initialized successfully');
})();

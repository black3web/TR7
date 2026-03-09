// data.js - تهيئة البيانات الافتراضية في localStorage

(function initializeData() {
    // التحقق من وجود المنتجات
    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            {
                id: 1,
                name: 'قالب متجر إلكتروني متكامل',
                price: 49.99,
                description: 'قالب HTML/CSS احترافي لمتجر إلكتروني، متجاوب وسهل التعديل.',
                type: 'design',
                rating: 4.5,
                reviews: 128,
                date: '2025-02-15'
            },
            {
                id: 2,
                name: 'كتيب تعلم JavaScript من الصفر',
                price: 29.99,
                description: 'كتاب إلكتروني شامل يشرح JavaScript من الأساسيات إلى الاحتراف.',
                type: 'ebook',
                rating: 4.8,
                reviews: 342,
                date: '2025-02-10'
            },
            {
                id: 3,
                name: 'مكتبة تايمر متقدمة',
                price: 19.99,
                description: 'كود برمجي لمكتبة تايمر بلغة JavaScript مع أمثلة.',
                type: 'code',
                rating: 4.2,
                reviews: 89,
                date: '2025-02-05'
            },
            {
                id: 4,
                name: 'موسيقى تصويرية هادئة',
                price: 9.99,
                description: 'مجموعة من المقاطع الموسيقية الخالية من الحقوق لمشاريعك.',
                type: 'audio',
                rating: 4.6,
                reviews: 215,
                date: '2025-02-01'
            }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }

    // التحقق من وجود سلة مشتريات
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // بيانات وهمية للبائع (إحصائيات)
    if (!localStorage.getItem('sellerStats')) {
        const sellerStats = {
            totalEarnings: 1250.75, // أرباح وهمية
            totalSales: 87
        };
        localStorage.setItem('sellerStats', JSON.stringify(sellerStats));
    }
})();
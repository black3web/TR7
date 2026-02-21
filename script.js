// ===================================================
// ملف script.js - منطق التطبيق الكامل (نسخة محسنة ومستقرة)
// جميع التعليقات بالعربية لشرح كل وظيفة
// ===================================================

/******************************************
 * 1. إعدادات Canvas مع تحسين الأداء      *
 *    وإيقاف الرسم عند خفوت التطبيق       *
 ******************************************/
(function initOptimizedBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return; // في حال عدم وجود canvas
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let stars = [];
    let waves = [];
    let animationFrame;
    let isVisible = true; // حالة ظهور الصفحة

    // مراقبة تغيير رؤية الصفحة (Page Visibility API)
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible) {
            // إذا عادت الرؤية، نستأنف الرسم
            if (!animationFrame) {
                animationFrame = requestAnimationFrame(animate);
            }
        } else {
            // إذا اختفت، نوقف الرسم لتوفير البطارية
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
        }
    });

    // ضبط حجم الكانفس مع النافذة
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();  // إعادة إنشاء الجسيمات بما يتناسب مع الحجم الجديد
    }

    // إنشاء جسيمات للخلفية: نجوم وأشكال هندسية (عدد أقل للأداء)
    function initParticles() {
        particles = [];
        stars = [];
        waves = [];

        // نجوم متصاعدة (عدد أقل: 25 بدلاً من 40)
        for (let i = 0; i < 25; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.3 + 0.1, // أبطأ
                opacity: Math.random() * 0.6 + 0.2
            });
        }

        // أشكال هندسية معقدة (عدد أقل: 5 بدلاً من 8)
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 60 + 30, // أصغر
                speedX: (Math.random() - 0.5) * 0.1,
                speedY: (Math.random() - 0.5) * 0.1,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.005
            });
        }

        // تموجات ضوئية (عدد أقل: 2 بدلاً من 3)
        for (let i = 0; i < 2; i++) {
            waves.push({
                y: Math.random() * height,
                amplitude: Math.random() * 30 + 20,
                frequency: Math.random() * 0.01 + 0.005,
                speed: Math.random() * 0.3 + 0.1,
                offset: Math.random() * 100
            });
        }
    }

    // دالة الرسم المتحرك (تُستدعى باستمرار)
    function animate() {
        if (!isVisible) {
            // إذا كانت الصفحة غير مرئية، نوقف الطلب
            animationFrame = null;
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // 1. رسم النجوم المتصاعدة
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
            star.y -= star.speed;
            if (star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }
        }

        // 2. رسم الأشكال الهندسية
        ctx.lineWidth = 1;
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 8;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.beginPath();
            // رسم شكل معقد (مربع متقاطع) بعدد خطوط أقل
            for (let j = 0; j < 4; j++) {
                ctx.moveTo(-p.size/2, -p.size/2 + j * p.size/3);
                ctx.lineTo(p.size/2, -p.size/2 + j * p.size/3);
                ctx.moveTo(-p.size/2 + j * p.size/3, -p.size/2);
                ctx.lineTo(-p.size/2 + j * p.size/3, p.size/2);
            }
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.1)'; // شفافية أقل
            ctx.stroke();
            ctx.restore();

            p.x += p.speedX;
            p.y += p.speedY;
            p.angle += p.spin;

            if (p.x < 0 || p.x > width) p.speedX *= -1;
            if (p.y < 0 || p.y > height) p.speedY *= -1;
        }

        // 3. رسم التموجات الضوئية (بخطوط أقل)
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffd700';
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.07)';
        ctx.lineWidth = 2;
        for (let i = 0; i < waves.length; i++) {
            const wave = waves[i];
            ctx.beginPath();
            for (let x = 0; x < width; x += 20) { // زيادة الخطوة لتحسين الأداء
                let y = wave.y + Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            wave.offset += wave.speed * 0.02;
        }

        ctx.shadowBlur = 0;
        animationFrame = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate(); // بدء الرسم
})();

/******************************************
 * 2. إدارة LocalStorage والمستخدمين      *
 *    (محسنة ضد الأخطاء)                  *
 ******************************************/
const Database = (function() {
    let users = [];
    let currentUser = null;

    const STORAGE_USERS = 'tasbeeh_users';
    const STORAGE_CURRENT = 'tasbeeh_current';
    const STORAGE_HISTORY = 'tasbeeh_history';

    // تهيئة البيانات
    function loadData() {
        try {
            const storedUsers = localStorage.getItem(STORAGE_USERS);
            if (storedUsers) {
                users = JSON.parse(storedUsers) || [];
            } else {
                generateMockUsers();
            }
        } catch (e) {
            console.warn('خطأ في تحميل المستخدمين، سيتم إنشاء بيانات وهمية');
            generateMockUsers();
        }

        try {
            const storedCurrent = localStorage.getItem(STORAGE_CURRENT);
            currentUser = storedCurrent ? storedCurrent : null;
        } catch (e) {
            currentUser = null;
        }
    }

    // حفظ المستخدمين
    function saveUsers() {
        try {
            localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        } catch (e) {
            console.error('فشل في حفظ المستخدمين');
        }
    }

    // حفظ المستخدم الحالي
    function saveCurrentUser(userId) {
        try {
            if (userId) {
                localStorage.setItem(STORAGE_CURRENT, userId);
                currentUser = userId;
            } else {
                localStorage.removeItem(STORAGE_CURRENT);
                currentUser = null;
            }
        } catch (e) {
            console.error('فشل في حفظ المستخدم الحالي');
        }
    }

    // توليد 100 مستخدم وهمي
    function generateMockUsers() {
        users = [];
        const firstNames = ['أحمد', 'محمد', 'علي', 'حسن', 'حسين', 'فاطمة', 'زينب', 'عمر', 'خالد', 'يوسف'];
        const lastNames = ['المصري', 'السعودي', 'الشامي', 'العراقي', 'المغربي', 'التونسي', 'الجزائري', 'السوداني'];

        for (let i = 1; i <= 100; i++) {
            const randFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
            const randLast = lastNames[Math.floor(Math.random() * lastNames.length)];
            const username = `user${i}_${Math.random().toString(36).substring(2, 6)}`;
            const totalClicks = Math.floor(Math.random() * 50000) + 1000;
            const maxSession = Math.floor(Math.random() * 3000) + 100;
            const completions = Math.floor(Math.random() * 500) + 10;

            users.push({
                userId: `u${i}_${Date.now()}_${i}`,
                username: username,
                password: '123456',
                fullName: `${randFirst} ${randLast}`,
                totalClicks: totalClicks,
                maxSession: maxSession,
                maxSessionDate: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('ar-EG'),
                fatimahCompletions: completions
            });
        }
        saveUsers();
    }

    // البحث عن مستخدم باسم المستخدم
    function findUserByUsername(username) {
        return users.find(u => u.username === username);
    }

    // البحث عن مستخدم بالمعرف
    function findUserById(userId) {
        return users.find(u => u.userId === userId);
    }

    // إضافة مستخدم جديد
    function registerUser(fullName, username, password) {
        if (findUserByUsername(username)) {
            return { success: false, message: 'اسم المستخدم موجود مسبقاً' };
        }
        const newUser = {
            userId: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            username: username,
            password: password,
            fullName: fullName,
            totalClicks: 0,
            maxSession: 0,
            maxSessionDate: '',
            fatimahCompletions: 0
        };
        users.push(newUser);
        saveUsers();
        return { success: true, user: newUser };
    }

    // الحصول على سجل المستخدم
    function getHistoryForUser(userId) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(STORAGE_HISTORY)) || [];
            return allHistory.filter(entry => entry.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (e) {
            return [];
        }
    }

    // إضافة سجل
    function addHistoryEntry(userId, value) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(STORAGE_HISTORY)) || [];
            allHistory.push({
                userId: userId,
                value: value,
                date: new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
            localStorage.setItem(STORAGE_HISTORY, JSON.stringify(allHistory));
        } catch (e) {
            console.error('فشل في حفظ السجل');
        }
    }

    // تحديث بيانات المستخدم (للإحصائيات)
    function updateUserStats(userId, totalClicksDelta, maxSessionValue, maxSessionDate) {
        const user = findUserById(userId);
        if (!user) return;
        if (totalClicksDelta) {
            user.totalClicks = (user.totalClicks || 0) + totalClicksDelta;
        }
        if (maxSessionValue > (user.maxSession || 0)) {
            user.maxSession = maxSessionValue;
            user.maxSessionDate = maxSessionDate || new Date().toLocaleDateString('ar-EG');
        }
        saveUsers();
    }

    // تحديث ختمات فاطمة
    function updateFatimahCompletions(userId, completions) {
        const user = findUserById(userId);
        if (user) {
            user.fatimahCompletions = completions;
            saveUsers();
        }
    }

    return {
        loadData,
        getCurrentUser: () => currentUser,
        saveCurrentUser,
        findUserById,
        findUserByUsername,
        registerUser,
        getHistoryForUser,
        addHistoryEntry,
        updateUserStats,
        updateFatimahCompletions,
        getAllUsers: () => users.slice() // نسخة للقراءة فقط
    };
})();

/******************************************
 * 3. إدارة التنقل بين الصفحات (Router)   *
 *    باستخدام goTo(pageId) مع تأثيرات    *
 ******************************************/
const Router = (function() {
    // تحديد جميع الصفحات
    const pages = {
        splash: document.getElementById('splashPage'),
        auth: document.getElementById('authPage'),
        main: document.getElementById('mainAppPage'),
        top100: document.getElementById('top100Page')
    };

    // دالة للانتقال إلى صفحة معينة
    function goTo(pageId) {
        // إخفاء جميع الصفحات
        Object.values(pages).forEach(page => {
            if (page) {
                page.classList.remove('active');
            }
        });
        // إظهار الصفحة المطلوبة
        const target = pages[pageId];
        if (target) {
            target.classList.add('active');
        } else {
            console.warn('الصفحة غير موجودة:', pageId);
        }
    }

    return {
        goTo
    };
})();

/******************************************
 * 4. عداد الزوار الكلي (Global Counter)  *
 *    باستخدام API مجاني (CountAPI)       *
 ******************************************/
(function initVisitorCounter() {
    const counterElement = document.getElementById('globalVisitorsCount');
    if (!counterElement) return;

    // استخدام CountAPI (لا يتطلب مفتاح)
    fetch('https://api.countapi.xyz/hit/tasbeeh-smart/visitors')
        .then(response => response.json())
        .then(data => {
            if (data && data.value !== undefined) {
                counterElement.textContent = data.value;
            } else {
                counterElement.textContent = '---';
            }
        })
        .catch(() => {
            // في حالة الفشل، نعرض رقم افتراضي
            counterElement.textContent = '1234';
        });
})();

/******************************************
 * 5. منطق التسبيح الذكي وتسبيح فاطمة     *
 *    مع التكامل مع قاعدة البيانات        *
 ******************************************/
const TasbeehApp = (function() {
    // عناصر DOM
    // عدادات الذكي
    const smartCounterSpan = document.getElementById('smartCounter');
    const smartIncrementBtn = document.getElementById('smartIncrementBtn');
    const smartStatsBtn = document.getElementById('smartStatsBtn');
    const smartResetBtn = document.getElementById('smartResetBtn');
    const smartHistoryBtn = document.getElementById('smartHistoryBtn');
    const smartTopBtn = document.getElementById('smartTopBtn');

    // عدادات فاطمة
    const fatimahPhaseLabel = document.getElementById('fatimahPhaseLabel');
    const fatimahPhaseCount = document.getElementById('fatimahPhaseCount');
    const fatimahCyclesSpan = document.getElementById('fatimahCycles');
    const fatimahIncrementBtn = document.getElementById('fatimahIncrementBtn');
    const fatimahResetBtn = document.getElementById('fatimahResetBtn');
    const fatimahTopBtn = document.getElementById('fatimahTopBtn');

    // Modal
    const statsModal = document.getElementById('statsModal');
    const statsMaxSession = document.getElementById('statsMaxSession');
    const statsMaxSessionDate = document.getElementById('statsMaxSessionDate');
    const statsTotalClicks = document.getElementById('statsTotalClicks');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const historyModal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');

    // Top100
    const backFromTop = document.getElementById('backFromTop');
    const topTotalTab = document.getElementById('topTotalTab');
    const topSessionTab = document.getElementById('topSessionTab');
    const topFatimahTab = document.getElementById('topFatimahTab');
    const topTotalList = document.getElementById('topTotalList');
    const topSessionList = document.getElementById('topSessionList');
    const topFatimahList = document.getElementById('topFatimahList');

    // Tabs
    const tabTasbeeh = document.getElementById('tabTasbeeh');
    const tabFatimah = document.getElementById('tabFatimah');
    const tasbeehPane = document.getElementById('tasbeehContent');
    const fatimahPane = document.getElementById('fatimahContent');

    // Auth
    const authTitle = document.getElementById('authTitle');
    const nameField = document.getElementById('nameField');
    const confirmField = document.getElementById('confirmField');
    const authForm = document.getElementById('authForm');
    const authSubmit = document.getElementById('authSubmit');
    const authToggle = document.getElementById('authToggle');
    const authMessage = document.getElementById('authMessage');
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');

    // متغيرات الحالة
    let smartCurrentCounter = 0;
    let smartMaxSession = 0; // أعلى رقم في الجلسة الحالية (للتحديث)

    const PHASES = [
        { text: 'الله أكبر', required: 34 },
        { text: 'الحمد لله', required: 33 },
        { text: 'سبحان الله', required: 33 }
    ];
    let fatimahCurrentPhase = 0;
    let fatimahPhaseCounter = 0;
    let fatimahCycles = 0;

    // تهيئة المستخدم
    function initUser() {
        const currentUser = Database.getCurrentUser();
        if (!currentUser) return;
        const user = Database.findUserById(currentUser);
        if (!user) return;

        smartCurrentCounter = 0;
        smartCounterSpan.innerText = smartCurrentCounter;
        smartMaxSession = user.maxSession || 0;

        fatimahCycles = user.fatimahCompletions || 0;
        fatimahCyclesSpan.innerText = fatimahCycles;
        resetFatimahCounters();
    }

    function resetFatimahCounters() {
        fatimahCurrentPhase = 0;
        fatimahPhaseCounter = 0;
        updateFatimahUI();
    }

    function updateFatimahUI() {
        const phase = PHASES[fatimahCurrentPhase];
        fatimahPhaseLabel.innerText = phase.text;
        fatimahPhaseCount.innerText = `${fatimahPhaseCounter}/${phase.required}`;
    }

    // Auth mode
    let authMode = 'register'; // 'register' or 'login'
    function setAuthMode(mode) {
        authMode = mode;
        if (mode === 'register') {
            authTitle.innerText = 'إنشاء حساب';
            authSubmit.innerText = 'تسجيل';
            authToggle.innerText = 'لدي حساب بالفعل';
            nameField.classList.remove('hidden');
            confirmField.classList.remove('hidden');
        } else {
            authTitle.innerText = 'تسجيل الدخول';
            authSubmit.innerText = 'دخول';
            authToggle.innerText = 'إنشاء حساب جديد';
            nameField.classList.add('hidden');
            confirmField.classList.add('hidden');
        }
        authMessage.innerText = '';
    }

    // عرض إحصائيات المستخدم
    function showStats() {
        const currentUser = Database.getCurrentUser();
        if (!currentUser) return;
        const user = Database.findUserById(currentUser);
        if (user) {
            statsMaxSession.innerText = user.maxSession || 0;
            statsMaxSessionDate.innerText = user.maxSessionDate || '---';
            statsTotalClicks.innerText = user.totalClicks || 0;
            statsModal.classList.add('active');
        }
    }

    // عرض السجل
    function showHistory() {
        const currentUser = Database.getCurrentUser();
        if (!currentUser) return;
        const history = Database.getHistoryForUser(currentUser);
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<li>لا يوجد سجل بعد</li>';
        } else {
            history.forEach(entry => {
                const li = document.createElement('li');
                li.innerText = `الرقم: ${entry.value} - التاريخ: ${entry.date}`;
                historyList.appendChild(li);
            });
        }
        historyModal.classList.add('active');
    }

    // عرض Top100
    function openTop100() {
        Router.goTo('top100');
        renderTopLists();
    }

    function renderTopLists() {
        const users = Database.getAllUsers();
        const sortedByTotal = [...users].sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0));
        const sortedBySession = [...users].sort((a, b) => (b.maxSession || 0) - (a.maxSession || 0));
        const sortedByFatimah = [...users].sort((a, b) => (b.fatimahCompletions || 0) - (a.fatimahCompletions || 0));

        renderList(topTotalList, sortedByTotal.slice(0, 100), 'totalClicks');
        renderList(topSessionList, sortedBySession.slice(0, 100), 'maxSession');
        renderList(topFatimahList, sortedByFatimah.slice(0, 100), 'fatimahCompletions');
    }

    function renderList(container, list, field) {
        container.innerHTML = '';
        const currentUser = Database.getCurrentUser();
        list.forEach((user, index) => {
            const rank = index + 1;
            const div = document.createElement('div');
            div.className = 'top-item glass-card';
            if (user.userId === currentUser) {
                div.style.border = '2px solid var(--glowing-gold)';
            }
            div.innerHTML = `
                <span class="top-rank">${rank}</span>
                <span class="top-name">${user.fullName || user.username}</span>
                <span class="top-value">${user[field]}</span>
            `;
            container.appendChild(div);
        });
    }

    // ربط الأحداث
    function bindEvents() {
        // Auth
        authToggle.addEventListener('click', () => {
            setAuthMode(authMode === 'register' ? 'login' : 'register');
        });

        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            authMessage.innerText = '';

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                authMessage.innerText = 'يرجى ملء جميع الحقول المطلوبة';
                return;
            }

            if (authMode === 'register') {
                const fullName = fullNameInput.value.trim();
                const confirm = confirmInput.value;
                if (!fullName || !confirm) {
                    authMessage.innerText = 'يرجى ملء جميع الحقول';
                    return;
                }
                if (password !== confirm) {
                    authMessage.innerText = 'كلمة المرور غير متطابقة';
                    return;
                }
                const result = Database.registerUser(fullName, username, password);
                if (result.success) {
                    Database.saveCurrentUser(result.user.userId);
                    initUser();
                    Router.goTo('main');
                } else {
                    authMessage.innerText = result.message;
                }
            } else {
                const user = Database.findUserByUsername(username);
                if (!user || user.password !== password) {
                    authMessage.innerText = 'اسم المستخدم أو كلمة المرور غير صحيحة';
                    return;
                }
                Database.saveCurrentUser(user.userId);
                initUser();
                Router.goTo('main');
            }
        });

        // Tabs
        tabTasbeeh.addEventListener('click', () => {
            tabTasbeeh.classList.add('active');
            tabFatimah.classList.remove('active');
            tasbeehPane.classList.add('active');
            fatimahPane.classList.remove('active');
        });

        tabFatimah.addEventListener('click', () => {
            tabFatimah.classList.add('active');
            tabTasbeeh.classList.remove('active');
            fatimahPane.classList.add('active');
            tasbeehPane.classList.remove('active');
        });

        // التسبيح الذكي
        smartIncrementBtn.addEventListener('click', () => {
            if (!Database.getCurrentUser()) return;
            smartCurrentCounter++;
            smartCounterSpan.innerText = smartCurrentCounter;
            if (smartCurrentCounter > smartMaxSession) {
                smartMaxSession = smartCurrentCounter;
            }
        });

        smartResetBtn.addEventListener('click', () => {
            const currentUser = Database.getCurrentUser();
            if (!currentUser) return;
            // حفظ في السجل
            Database.addHistoryEntry(currentUser, smartCurrentCounter);
            // تحديث إحصائيات المستخدم
            Database.updateUserStats(currentUser, smartCurrentCounter, smartMaxSession, new Date().toLocaleDateString('ar-EG'));
            // إعادة تعيين العداد
            smartCurrentCounter = 0;
            smartCounterSpan.innerText = smartCurrentCounter;
            // تحديث smartMaxSession من قاعدة البيانات (لأنه قد تغير)
            const user = Database.findUserById(currentUser);
            smartMaxSession = user?.maxSession || 0;
        });

        smartStatsBtn.addEventListener('click', showStats);
        smartHistoryBtn.addEventListener('click', showHistory);
        smartTopBtn.addEventListener('click', openTop100);

        // تسبيح فاطمة
        fatimahIncrementBtn.addEventListener('click', () => {
            const currentUser = Database.getCurrentUser();
            if (!currentUser) return;
            fatimahPhaseCounter++;
            const currentPhaseObj = PHASES[fatimahCurrentPhase];

            if (fatimahPhaseCounter >= currentPhaseObj.required) {
                if (fatimahCurrentPhase === 2) {
                    fatimahCycles++;
                    fatimahCyclesSpan.innerText = fatimahCycles;
                    Database.updateFatimahCompletions(currentUser, fatimahCycles);
                    fatimahCurrentPhase = 0;
                    fatimahPhaseCounter = 0;
                } else {
                    fatimahCurrentPhase++;
                    fatimahPhaseCounter = 0;
                }
            }
            updateFatimahUI();
        });

        fatimahResetBtn.addEventListener('click', () => {
            resetFatimahCounters();
        });

        fatimahTopBtn.addEventListener('click', openTop100);

        // Top100
        backFromTop.addEventListener('click', () => {
            Router.goTo('main');
        });

        topTotalTab.addEventListener('click', () => {
            topTotalTab.classList.add('active');
            topSessionTab.classList.remove('active');
            topFatimahTab.classList.remove('active');
            topTotalList.classList.add('active');
            topSessionList.classList.remove('active');
            topFatimahList.classList.remove('active');
        });

        topSessionTab.addEventListener('click', () => {
            topSessionTab.classList.add('active');
            topTotalTab.classList.remove('active');
            topFatimahTab.classList.remove('active');
            topSessionList.classList.add('active');
            topTotalList.classList.remove('active');
            topFatimahList.classList.remove('active');
        });

        topFatimahTab.addEventListener('click', () => {
            topFatimahTab.classList.add('active');
            topTotalTab.classList.remove('active');
            topSessionTab.classList.remove('active');
            topFatimahList.classList.add('active');
            topTotalList.classList.remove('active');
            topSessionList.classList.remove('active');
        });

        // إغلاق النوافذ المنبثقة
        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                statsModal.classList.remove('active');
                historyModal.classList.remove('active');
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }

    // بدء التشغيل
    function start() {
        Database.loadData();
        bindEvents();

        // التحقق من وجود مستخدم حالي
        const currentUser = Database.getCurrentUser();
        if (currentUser) {
            // عرض splash مع progress bar
            Router.goTo('splash');
            
            // عناصر شريط التحميل
            const progressContainer = document.getElementById('splashProgressContainer');
            const progressBar = document.getElementById('splashProgressBar');
            
            // التأكد من وجود العناصر قبل استخدامها
            if (progressContainer && progressBar) {
                progressContainer.classList.remove('hidden');
                let width = 0;
                const interval = setInterval(() => {
                    width += 2;
                    progressBar.style.width = width + '%';
                    if (width >= 100) {
                        clearInterval(interval);
                        progressContainer.classList.add('hidden');
                        initUser();
                        Router.goTo('main');
                    }
                }, 20); // 100 * 20 = 2000ms (ثانيتان)
            } else {
                // إذا لم توجد عناصر التحميل (لأي سبب)، ننتقل مباشرة
                initUser();
                Router.goTo('main');
            }
        } else {
            Router.goTo('auth');
            setAuthMode('register');
        }
    }

    return { start };
})();

/******************************************
 * 6. تشغيل التطبيق                        *
 ******************************************/
// التأكد من تحميل DOM بالكامل قبل البدء
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TasbeehApp.start());
} else {
    TasbeehApp.start();
}

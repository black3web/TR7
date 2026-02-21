// ===================================================
// ملف script.js - منطق التطبيق الكامل (نسخة مستقرة ومحسنة)
// جميع التعليقات بالعربية
// ===================================================

/******************************************
 * 1. إعدادات Canvas مع تحسين الأداء      *
 ******************************************/
(function initOptimizedBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let stars = [];
    let waves = [];
    let animationFrame;
    let isVisible = true;

    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible && !animationFrame) {
            animationFrame = requestAnimationFrame(animate);
        } else if (!isVisible && animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    });

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    function initParticles() {
        particles = [];
        stars = [];
        waves = [];

        for (let i = 0; i < 25; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.6 + 0.2
            });
        }

        for (let i = 0; i < 5; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 60 + 30,
                speedX: (Math.random() - 0.5) * 0.1,
                speedY: (Math.random() - 0.5) * 0.1,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.005
            });
        }

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

    function animate() {
        if (!isVisible) {
            animationFrame = null;
            return;
        }

        ctx.clearRect(0, 0, width, height);

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

        ctx.lineWidth = 1;
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 8;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.beginPath();
            for (let j = 0; j < 4; j++) {
                ctx.moveTo(-p.size/2, -p.size/2 + j * p.size/3);
                ctx.lineTo(p.size/2, -p.size/2 + j * p.size/3);
                ctx.moveTo(-p.size/2 + j * p.size/3, -p.size/2);
                ctx.lineTo(-p.size/2 + j * p.size/3, p.size/2);
            }
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.1)';
            ctx.stroke();
            ctx.restore();

            p.x += p.speedX;
            p.y += p.speedY;
            p.angle += p.spin;
            if (p.x < 0 || p.x > width) p.speedX *= -1;
            if (p.y < 0 || p.y > height) p.speedY *= -1;
        }

        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffd700';
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.07)';
        ctx.lineWidth = 2;
        for (let i = 0; i < waves.length; i++) {
            const wave = waves[i];
            ctx.beginPath();
            for (let x = 0; x < width; x += 20) {
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
    animate();
})();

/******************************************
 * 2. إدارة LocalStorage والمستخدمين      *
 ******************************************/
const Database = (function() {
    let users = [];
    let currentUser = null;

    const STORAGE_USERS = 'tasbeeh_users';
    const STORAGE_CURRENT = 'tasbeeh_current';
    const STORAGE_HISTORY = 'tasbeeh_history';

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

    function saveUsers() {
        try {
            localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        } catch (e) {
            console.error('فشل في حفظ المستخدمين');
        }
    }

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

    function findUserByUsername(username) {
        return users.find(u => u.username === username);
    }

    function findUserById(userId) {
        return users.find(u => u.userId === userId);
    }

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

    function getHistoryForUser(userId) {
        try {
            const allHistory = JSON.parse(localStorage.getItem(STORAGE_HISTORY)) || [];
            return allHistory.filter(entry => entry.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (e) {
            return [];
        }
    }

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
        getAllUsers: () => users.slice()
    };
})();

/******************************************
 * 3. إدارة التنقل بين الصفحات (Router)   *
 ******************************************/
const Router = (function() {
    const pages = {
        splash: document.getElementById('splashPage'),
        auth: document.getElementById('authPage'),
        main: document.getElementById('mainAppPage'),
        top100: document.getElementById('top100Page')
    };

    function goTo(pageId) {
        Object.values(pages).forEach(page => {
            if (page) {
                page.classList.remove('active');
            }
        });
        const target = pages[pageId];
        if (target) {
            target.classList.add('active');
        } else {
            console.warn('الصفحة غير موجودة:', pageId);
        }
    }

    return { goTo };
})();

/******************************************
 * 4. عداد الزوار الكلي (مع fallback)     *
 ******************************************/
(function initVisitorCounter() {
    const counterElement = document.getElementById('globalVisitorsCount');
    if (!counterElement) return;

    // محاولة استخدام CountAPI، وفي حالة الفشل نستخدم localStorage كبديل
    fetch('https://api.countapi.xyz/hit/tasbeeh-smart/visitors')
        .then(response => response.json())
        .then(data => {
            if (data && data.value !== undefined) {
                counterElement.textContent = data.value;
            } else {
                throw new Error('Invalid response');
            }
        })
        .catch(() => {
            // استخدام عداد محلي (زيارة واحدة لكل جلسة)
            let localCount = localStorage.getItem('local_visitor_count');
            if (!localCount) {
                localCount = '1';
                localStorage.setItem('local_visitor_count', '1');
            } else {
                localCount = (parseInt(localCount) + 1).toString();
                localStorage.setItem('local_visitor_count', localCount);
            }
            counterElement.textContent = localCount;
        });
})();

/******************************************
 * 5. منطق التسبيح الذكي وتسبيح فاطمة     *
 ******************************************/
const TasbeehApp = (function() {
    // عناصر DOM
    const smartCounterSpan = document.getElementById('smartCounter');
    const smartIncrementBtn = document.getElementById('smartIncrementBtn');
    const smartStatsBtn = document.getElementById('smartStatsBtn');
    const smartResetBtn = document.getElementById('smartResetBtn');
    const smartHistoryBtn = document.getElementById('smartHistoryBtn');
    const smartTopBtn = document.getElementById('smartTopBtn');

    const fatimahPhaseLabel = document.getElementById('fatimahPhaseLabel');
    const fatimahPhaseCount = document.getElementById('fatimahPhaseCount');
    const fatimahCyclesSpan = document.getElementById('fatimahCycles');
    const fatimahIncrementBtn = document.getElementById('fatimahIncrementBtn');
    const fatimahResetBtn = document.getElementById('fatimahResetBtn');
    const fatimahTopBtn = document.getElementById('fatimahTopBtn');

    const statsModal = document.getElementById('statsModal');
    const statsMaxSession = document.getElementById('statsMaxSession');
    const statsMaxSessionDate = document.getElementById('statsMaxSessionDate');
    const statsTotalClicks = document.getElementById('statsTotalClicks');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const historyModal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');

    const backFromTop = document.getElementById('backFromTop');
    const topTotalTab = document.getElementById('topTotalTab');
    const topSessionTab = document.getElementById('topSessionTab');
    const topFatimahTab = document.getElementById('topFatimahTab');
    const topTotalList = document.getElementById('topTotalList');
    const topSessionList = document.getElementById('topSessionList');
    const topFatimahList = document.getElementById('topFatimahList');

    const tabTasbeeh = document.getElementById('tabTasbeeh');
    const tabFatimah = document.getElementById('tabFatimah');
    const tasbeehPane = document.getElementById('tasbeehContent');
    const fatimahPane = document.getElementById('fatimahContent');

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
    let smartMaxSession = 0;

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
        try {
            const currentUser = Database.getCurrentUser();
            if (!currentUser) return;
            const user = Database.findUserById(currentUser);
            if (!user) return;

            smartCurrentCounter = 0;
            if (smartCounterSpan) smartCounterSpan.innerText = smartCurrentCounter;
            smartMaxSession = user.maxSession || 0;

            fatimahCycles = user.fatimahCompletions || 0;
            if (fatimahCyclesSpan) fatimahCyclesSpan.innerText = fatimahCycles;
            resetFatimahCounters();
        } catch (e) {
            console.error('خطأ في تهيئة المستخدم:', e);
        }
    }

    function resetFatimahCounters() {
        fatimahCurrentPhase = 0;
        fatimahPhaseCounter = 0;
        updateFatimahUI();
    }

    function updateFatimahUI() {
        if (!fatimahPhaseLabel || !fatimahPhaseCount) return;
        const phase = PHASES[fatimahCurrentPhase];
        fatimahPhaseLabel.innerText = phase.text;
        fatimahPhaseCount.innerText = `${fatimahPhaseCounter}/${phase.required}`;
    }

    let authMode = 'register';
    function setAuthMode(mode) {
        authMode = mode;
        if (!authTitle || !authSubmit || !authToggle || !nameField || !confirmField) return;
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

    function showStats() {
        const currentUser = Database.getCurrentUser();
        if (!currentUser) return;
        const user = Database.findUserById(currentUser);
        if (user && statsModal && statsMaxSession && statsMaxSessionDate && statsTotalClicks) {
            statsMaxSession.innerText = user.maxSession || 0;
            statsMaxSessionDate.innerText = user.maxSessionDate || '---';
            statsTotalClicks.innerText = user.totalClicks || 0;
            statsModal.classList.add('active');
        }
    }

    function showHistory() {
        const currentUser = Database.getCurrentUser();
        if (!currentUser) return;
        const history = Database.getHistoryForUser(currentUser);
        if (!historyList) return;
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
        if (historyModal) historyModal.classList.add('active');
    }

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
        if (!container) return;
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

    function bindEvents() {
        if (authToggle) {
            authToggle.addEventListener('click', () => {
                setAuthMode(authMode === 'register' ? 'login' : 'register');
            });
        }

        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!authMessage) return;
                authMessage.innerText = '';

                const username = usernameInput ? usernameInput.value.trim() : '';
                const password = passwordInput ? passwordInput.value : '';

                if (!username || !password) {
                    authMessage.innerText = 'يرجى ملء جميع الحقول المطلوبة';
                    return;
                }

                if (authMode === 'register') {
                    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
                    const confirm = confirmInput ? confirmInput.value : '';
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
        }

        if (tabTasbeeh && tabFatimah && tasbeehPane && fatimahPane) {
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
        }

        if (smartIncrementBtn) {
            smartIncrementBtn.addEventListener('click', () => {
                if (!Database.getCurrentUser()) return;
                smartCurrentCounter++;
                if (smartCounterSpan) smartCounterSpan.innerText = smartCurrentCounter;
                if (smartCurrentCounter > smartMaxSession) {
                    smartMaxSession = smartCurrentCounter;
                }
            });
        }

        if (smartResetBtn) {
            smartResetBtn.addEventListener('click', () => {
                const currentUser = Database.getCurrentUser();
                if (!currentUser) return;
                Database.addHistoryEntry(currentUser, smartCurrentCounter);
                Database.updateUserStats(currentUser, smartCurrentCounter, smartMaxSession, new Date().toLocaleDateString('ar-EG'));
                smartCurrentCounter = 0;
                if (smartCounterSpan) smartCounterSpan.innerText = smartCurrentCounter;
                const user = Database.findUserById(currentUser);
                smartMaxSession = user?.maxSession || 0;
            });
        }

        if (smartStatsBtn) smartStatsBtn.addEventListener('click', showStats);
        if (smartHistoryBtn) smartHistoryBtn.addEventListener('click', showHistory);
        if (smartTopBtn) smartTopBtn.addEventListener('click', openTop100);

        if (fatimahIncrementBtn) {
            fatimahIncrementBtn.addEventListener('click', () => {
                const currentUser = Database.getCurrentUser();
                if (!currentUser) return;
                fatimahPhaseCounter++;
                const currentPhaseObj = PHASES[fatimahCurrentPhase];

                if (fatimahPhaseCounter >= currentPhaseObj.required) {
                    if (fatimahCurrentPhase === 2) {
                        fatimahCycles++;
                        if (fatimahCyclesSpan) fatimahCyclesSpan.innerText = fatimahCycles;
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
        }

        if (fatimahResetBtn) {
            fatimahResetBtn.addEventListener('click', resetFatimahCounters);
        }
        if (fatimahTopBtn) fatimahTopBtn.addEventListener('click', openTop100);

        if (backFromTop) {
            backFromTop.addEventListener('click', () => {
                Router.goTo('main');
            });
        }

        if (topTotalTab && topSessionTab && topFatimahTab && topTotalList && topSessionList && topFatimahList) {
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
        }

        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (statsModal) statsModal.classList.remove('active');
                if (historyModal) historyModal.classList.remove('active');
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    }

    function start() {
        try {
            Database.loadData();
            bindEvents();

            const currentUser = Database.getCurrentUser();
            if (currentUser) {
                Router.goTo('splash');

                const progressContainer = document.getElementById('splashProgressContainer');
                const progressBar = document.getElementById('splashProgressBar');

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
                    }, 20);
                } else {
                    initUser();
                    Router.goTo('main');
                }
            } else {
                Router.goTo('auth');
                setAuthMode('register');
            }
        } catch (e) {
            console.error('خطأ في بدء التشغيل:', e);
            // في حالة خطأ، نذهب إلى صفحة المصادقة
            Router.goTo('auth');
            setAuthMode('register');
        }
    }

    return { start };
})();

/******************************************
 * 6. تشغيل التطبيق                        *
 ******************************************/
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TasbeehApp.start());
} else {
    TasbeehApp.start();
}

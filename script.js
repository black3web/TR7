// ===================================================
// ملف script.js - منطق التطبيق الكامل
// جميع التعليقات بالعربية لشرح كل وظيفة
// ===================================================

/******************************************
 * 1. إعداد الخلفية المتحركة (Canvas)     *
 ******************************************/
(function initBackground() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let stars = [];
    let waves = [];

    // ضبط حجم الكانفس مع النافذة
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();  // إعادة إنشاء الجسيمات بما يتناسب مع الحجم الجديد
    }

    // إنشاء جسيمات للخلفية: نجوم وأشكال هندسية
    function initParticles() {
        particles = [];
        stars = [];
        waves = [];

        // نجوم متصاعدة (عدد أقل للأداء)
        for (let i = 0; i < 40; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.7 + 0.3
            });
        }

        // أشكال هندسية معقدة (خطوط متقاطعة)
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 80 + 40,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.01
            });
        }

        // تموجات ضوئية
        for (let i = 0; i < 3; i++) {
            waves.push({
                y: Math.random() * height,
                amplitude: Math.random() * 50 + 30,
                frequency: Math.random() * 0.02 + 0.01,
                speed: Math.random() * 0.5 + 0.2,
                offset: Math.random() * 100
            });
        }
    }

    // دالة الرسم المتحرك (تُستدعى باستمرار)
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // 1. رسم النجوم المتصاعدة (تتحرك للأعلى)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
            // تحريك النجم للأعلى
            star.y -= star.speed;
            if (star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }
        });

        // 2. رسم الأشكال الهندسية (مربعات/خطوط متقاطعة)
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 10;
        particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.beginPath();
            // رسم شكل معقد (مربع متقاطع)
            for (let i = 0; i < 4; i++) {
                ctx.moveTo(-p.size/2, -p.size/2 + i * p.size/3);
                ctx.lineTo(p.size/2, -p.size/2 + i * p.size/3);
                ctx.moveTo(-p.size/2 + i * p.size/3, -p.size/2);
                ctx.lineTo(-p.size/2 + i * p.size/3, p.size/2);
            }
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
            ctx.stroke();
            ctx.restore();

            // تحديث الموقع
            p.x += p.speedX;
            p.y += p.speedY;
            p.angle += p.spin;

            // ارتداد عند الحواف
            if (p.x < 0 || p.x > width) p.speedX *= -1;
            if (p.y < 0 || p.y > height) p.speedY *= -1;
        });

        // 3. رسم التموجات الضوئية
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffd700';
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.lineWidth = 2;
        waves.forEach(wave => {
            ctx.beginPath();
            for (let x = 0; x < width; x += 10) {
                let y = wave.y + Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            // تحريك الموجة
            wave.offset += wave.speed * 0.02;
        });

        ctx.shadowBlur = 0;
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
})();

/******************************************
 * 2. إدارة LocalStorage والمستخدمين      *
 ******************************************/

// هيكلة بيانات المستخدمين
let users = [];            // مصفوفة الكائنات
let currentUser = null;    // userId للمستخدم الحالي

// مفاتيح التخزين
const STORAGE_USERS = 'tasbeeh_users';
const STORAGE_CURRENT = 'tasbeeh_current';
const STORAGE_HISTORY = 'tasbeeh_history';  // سجل التصفير لكل المستخدمين

// تهيئة البيانات عند التحميل
function loadData() {
    // تحميل المستخدمين
    const storedUsers = localStorage.getItem(STORAGE_USERS);
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    } else {
        // إنشاء بيانات وهمية (100 مستخدم) عند أول استخدام
        generateMockUsers();
    }

    // تحميل المستخدم الحالي
    const storedCurrent = localStorage.getItem(STORAGE_CURRENT);
    if (storedCurrent) {
        currentUser = storedCurrent;
    } else {
        currentUser = null;
    }
}

// حفظ المستخدمين
function saveUsers() {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

// حفظ المستخدم الحالي
function saveCurrentUser(userId) {
    if (userId) {
        localStorage.setItem(STORAGE_CURRENT, userId);
        currentUser = userId;
    } else {
        localStorage.removeItem(STORAGE_CURRENT);
        currentUser = null;
    }
}

// توليد 100 مستخدم وهمي مع أرقام عشوائية
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
            password: '123456', // كلمة مرور موحدة للوهميين
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
        password: password, // في تطبيق حقيقي يجب التشفير، لكن هنا للتبسيط
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

/******************************************
 * 3. إدارة سجل التصفير (History)         *
 ******************************************/
function getHistoryForUser(userId) {
    const allHistory = JSON.parse(localStorage.getItem(STORAGE_HISTORY)) || [];
    return allHistory.filter(entry => entry.userId === userId).sort((a,b) => new Date(b.date) - new Date(a.date));
}

function addHistoryEntry(userId, value) {
    const allHistory = JSON.parse(localStorage.getItem(STORAGE_HISTORY)) || [];
    allHistory.push({
        userId: userId,
        value: value,
        date: new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(allHistory));
}

/******************************************
 * 4. المتغيرات العامة لعناصر DOM          *
 ******************************************/
// شاشات
const splashScreen = document.getElementById('splashScreen');
const authScreen = document.getElementById('authScreen');
const mainScreen = document.getElementById('mainApp');
const top100Screen = document.getElementById('top100Screen');

// عناصر splash
const splashProgress = document.getElementById('splashProgressContainer');
const progressBar = document.getElementById('splashProgressBar');

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

// Tabs
const tabTasbeeh = document.getElementById('tabTasbeeh');
const tabFatimah = document.getElementById('tabFatimah');
const tasbeehPane = document.getElementById('tasbeehContent');
const fatimahPane = document.getElementById('fatimahContent');

// عدادات التسبيح الذكي
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

// Modal الإحصائيات
const statsModal = document.getElementById('statsModal');
const statsMaxSession = document.getElementById('statsMaxSession');
const statsMaxSessionDate = document.getElementById('statsMaxSessionDate');
const statsTotalClicks = document.getElementById('statsTotalClicks');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Modal السجل
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

/******************************************
 * 5. متغيرات حالة التسبيح الذكي           *
 ******************************************/
let smartCurrentCounter = 0;            // العداد الحالي
let smartMaxSession = 0;                // أعلى رقم وصل له في هذه الجلسة (للتحديث)

/******************************************
 * 6. متغيرات حالة تسبيح فاطمة             *
 ******************************************/
const PHASES = [
    { text: 'الله أكبر', required: 34 },
    { text: 'الحمد لله', required: 33 },
    { text: 'سبحان الله', required: 33 }
];
let fatimahCurrentPhase = 0;            // 0,1,2
let fatimahPhaseCounter = 0;            // عدد الضغطات في المرحلة الحالية
let fatimahCycles = 0;                  // عدد الختمات

/******************************************
 * 7. دالة تحديث واجهة المستخدم عند التبديل *
 ******************************************/
function updateUIForUser() {
    if (!currentUser) return;
    const user = findUserById(currentUser);
    if (!user) return;

    // تحديث عدادات الذكي
    smartCurrentCounter = 0;
    smartCounterSpan.innerText = smartCurrentCounter;
    // تحديث أعلى رقم جلسة من قاعدة البيانات (لكن الجلسة الحالية تبدأ من 0)
    smartMaxSession = user.maxSession || 0;

    // تحديث عدادات فاطمة
    fatimahCycles = user.fatimahCompletions || 0;
    fatimahCyclesSpan.innerText = fatimahCycles;
    resetFatimahCounters(); // تعيد ضبط المرحلة والعداد
}

// إعادة ضبط عدادات فاطمة إلى بداية المرحلة الأولى
function resetFatimahCounters() {
    fatimahCurrentPhase = 0;
    fatimahPhaseCounter = 0;
    updateFatimahUI();
}

// تحديث واجهة فاطمة
function updateFatimahUI() {
    const phase = PHASES[fatimahCurrentPhase];
    fatimahPhaseLabel.innerText = phase.text;
    fatimahPhaseCount.innerText = `${fatimahPhaseCounter}/${phase.required}`;
}

/******************************************
 * 8. منطق التبديل بين الشاشات              *
 ******************************************/
function showScreen(screen) {
    splashScreen.classList.remove('active');
    authScreen.classList.remove('active');
    mainScreen.classList.remove('active');
    top100Screen.classList.remove('active');
    
    if (screen === 'splash') splashScreen.classList.add('active');
    else if (screen === 'auth') authScreen.classList.add('active');
    else if (screen === 'main') mainScreen.classList.add('active');
    else if (screen === 'top100') top100Screen.classList.add('active');
}

// التحقق من وجود مستخدم حالي وتحديد مسار البداية
function checkAuthAndProceed() {
    if (currentUser) {
        // مستخدم مسجل مسبقاً -> عرض splash مع progress bar ثم الدخول للرئيسية
        showScreen('splash');
        splashProgress.classList.remove('hidden');
        let width = 0;
        const interval = setInterval(() => {
            width += 2;
            progressBar.style.width = width + '%';
            if (width >= 100) {
                clearInterval(interval);
                splashProgress.classList.add('hidden');
                updateUIForUser();
                showScreen('main');
            }
        }, 20); // ثانيتان بالضبط (100 * 20 = 2000ms)
    } else {
        // لا يوجد مستخدم -> عرض شاشة المصادقة
        showScreen('auth');
        // ضبط وضع التسجيل كوضع افتراضي
        setAuthMode('register');
    }
}

/******************************************
 * 9. وضع المصادقة (تسجيل / دخول)           *
 ******************************************/
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

// معالج تبديل وضع المصادقة
authToggle.addEventListener('click', () => {
    setAuthMode(authMode === 'register' ? 'login' : 'register');
});

// معالج تقديم النموذج
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
        // تسجيل جديد
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
        const result = registerUser(fullName, username, password);
        if (result.success) {
            // تسجيل دخول تلقائي بعد التسجيل
            saveCurrentUser(result.user.userId);
            updateUIForUser();
            showScreen('main');
        } else {
            authMessage.innerText = result.message;
        }
    } else {
        // تسجيل دخول
        const user = findUserByUsername(username);
        if (!user || user.password !== password) {
            authMessage.innerText = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            return;
        }
        saveCurrentUser(user.userId);
        updateUIForUser();
        showScreen('main');
    }
});

/******************************************
 * 10. أحداث التنقل بين التبويبات           *
 ******************************************/
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

/******************************************
 * 11. منطق التسبيح الذكي                   *
 ******************************************/
smartIncrementBtn.addEventListener('click', () => {
    if (!currentUser) return;
    smartCurrentCounter++;
    smartCounterSpan.innerText = smartCurrentCounter;

    // تحديث أعلى رقم في الجلسة
    if (smartCurrentCounter > smartMaxSession) {
        smartMaxSession = smartCurrentCounter;
    }
});

smartResetBtn.addEventListener('click', () => {
    if (!currentUser) return;
    // حفظ الرقم الحالي في السجل
    addHistoryEntry(currentUser, smartCurrentCounter);
    // تحديث إجمالي الضغطات في قاعدة بيانات المستخدم
    const user = findUserById(currentUser);
    if (user) {
        user.totalClicks = (user.totalClicks || 0) + smartCurrentCounter;
        // تحديث أعلى رقم في جلسة إذا كان أكبر من المسجل
        if (smartCurrentCounter > (user.maxSession || 0)) {
            user.maxSession = smartCurrentCounter;
            user.maxSessionDate = new Date().toLocaleDateString('ar-EG');
        }
        saveUsers();
    }
    // إعادة تعيين العداد الحالي
    smartCurrentCounter = 0;
    smartCounterSpan.innerText = smartCurrentCounter;
    // تحديث smartMaxSession المحلي إلى أعلى قيمة من قاعدة البيانات (لأنه قد تغير)
    if (user) smartMaxSession = user.maxSession || 0;
});

smartStatsBtn.addEventListener('click', () => {
    if (!currentUser) return;
    const user = findUserById(currentUser);
    if (user) {
        statsMaxSession.innerText = user.maxSession || 0;
        statsMaxSessionDate.innerText = user.maxSessionDate || '---';
        statsTotalClicks.innerText = user.totalClicks || 0;
        statsModal.classList.add('active');
    }
});

smartHistoryBtn.addEventListener('click', () => {
    if (!currentUser) return;
    const history = getHistoryForUser(currentUser);
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
});

/******************************************
 * 12. إغلاق النوافذ المنبثقة               *
 ******************************************/
closeModalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        statsModal.classList.remove('active');
        historyModal.classList.remove('active');
    });
});

// إغلاق عند النقر خارج المحتوى (اختياري)
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

/******************************************
 * 13. منطق تسبيح فاطمة الزهراء             *
 ******************************************/
fatimahIncrementBtn.addEventListener('click', () => {
    if (!currentUser) return;
    fatimahPhaseCounter++;
    const currentPhaseObj = PHASES[fatimahCurrentPhase];
    
    if (fatimahPhaseCounter >= currentPhaseObj.required) {
        // إكمال المرحلة الحالية
        if (fatimahCurrentPhase === 2) {
            // تم إكمال الدورة كاملة
            fatimahCycles++;
            fatimahCyclesSpan.innerText = fatimahCycles;
            // تحديث قاعدة بيانات المستخدم
            const user = findUserById(currentUser);
            if (user) {
                user.fatimahCompletions = fatimahCycles;
                saveUsers();
            }
            // إعادة تعيين إلى المرحلة الأولى
            fatimahCurrentPhase = 0;
            fatimahPhaseCounter = 0;
        } else {
            // الانتقال إلى المرحلة التالية
            fatimahCurrentPhase++;
            fatimahPhaseCounter = 0;
        }
    }
    updateFatimahUI();
});

fatimahResetBtn.addEventListener('click', () => {
    resetFatimahCounters();
    // لا نؤثر على الختمات المحفوظة، فقط نعيد تعيين الجلسة الحالية
});

/******************************************
 * 14. شاشة Top 100                        *
 ******************************************/
function openTop100(type) {
    showScreen('top100');
    renderTopLists();
}

function renderTopLists() {
    // ترتيب المستخدمين حسب الإجمالي
    const sortedByTotal = [...users].sort((a,b) => (b.totalClicks || 0) - (a.totalClicks || 0));
    const sortedBySession = [...users].sort((a,b) => (b.maxSession || 0) - (a.maxSession || 0));
    const sortedByFatimah = [...users].sort((a,b) => (b.fatimahCompletions || 0) - (a.fatimahCompletions || 0));

    renderList(topTotalList, sortedByTotal.slice(0, 100), 'totalClicks');
    renderList(topSessionList, sortedBySession.slice(0, 100), 'maxSession');
    renderList(topFatimahList, sortedByFatimah.slice(0, 100), 'fatimahCompletions');
}

function renderList(container, list, field) {
    container.innerHTML = '';
    list.forEach((user, index) => {
        const rank = index + 1;
        const div = document.createElement('div');
        div.className = 'top-item glass-card';
        // تمييز المستخدم الحالي
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

// أزرار فتح Top100
smartTopBtn.addEventListener('click', () => openTop100('total'));
fatimahTopBtn.addEventListener('click', () => openTop100('fatimah'));

// العودة من Top100
backFromTop.addEventListener('click', () => {
    showScreen('main');
});

// تبديل تبويبات Top100
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

/******************************************
 * 15. تهيئة التطبيق                        *
 ******************************************/
loadData();
checkAuthAndProceed();
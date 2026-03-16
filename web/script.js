// Data Persistence Helper
const DataStore = {
    get: (key, defaultVal) => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultVal;
    },
    set: (key, val) => {
        localStorage.setItem(key, JSON.stringify(val));
    }
};

// Initial Data (Same as mobile for consistency)
const defaultTreeData = [
    {
        id: 1,
        title: "前端基础",
        level: 1,
        children: [
            {
                id: 11,
                title: "HTML5",
                level: 2,
                total: 20,
                practice: 5,
                children: [
                    { id: 111, title: "语义化标签", level: 3, total: 10, practice: 2 },
                    { id: 112, title: "多媒体标签", level: 3, total: 5, practice: 1 },
                    { id: 113, title: "Web Storage", level: 3, total: 5, practice: 2 }
                ]
            },
            {
                id: 12,
                title: "CSS3",
                level: 2,
                total: 30,
                practice: 12,
                children: [
                    { id: 121, title: "Flex布局", level: 3, total: 10, practice: 5 },
                    { id: 122, title: "Grid布局", level: 3, total: 10, practice: 3 },
                    { id: 123, title: "动画与过渡", level: 3, total: 10, practice: 4 }
                ]
            }
        ]
    },
    {
        id: 2,
        title: "JavaScript",
        level: 1,
        children: [
            {
                id: 21,
                title: "ES6+",
                level: 2,
                total: 40,
                practice: 15,
                children: [
                    { id: 211, title: "Promise/Async", level: 3, total: 15, practice: 8 },
                    { id: 212, title: "Class类", level: 3, total: 10, practice: 2 },
                    { id: 213, title: "模块化", level: 3, total: 15, practice: 5 }
                ]
            },
            {
                id: 22,
                title: "原型与继承",
                level: 2,
                total: 20,
                practice: 10,
                children: [
                    { id: 221, title: "原型链", level: 3, total: 10, practice: 6 },
                    { id: 222, title: "继承方式", level: 3, total: 10, practice: 4 }
                ]
            }
        ]
    },
    {
        id: 3,
        title: "Vue.js",
        level: 1,
        children: [
            {
                id: 31,
                title: "基础核心",
                level: 2,
                total: 25,
                practice: 20,
                children: [
                    { id: 311, title: "响应式原理", level: 3, total: 10, practice: 8 },
                    { id: 312, title: "组件通信", level: 3, total: 8, practice: 8 },
                    { id: 313, title: "生命周期", level: 3, total: 7, practice: 4 }
                ]
            },
            {
                id: 32,
                title: "Vue Router",
                level: 2,
                total: 15,
                practice: 3,
                children: [
                    { id: 321, title: "路由守卫", level: 3, total: 8, practice: 2 },
                    { id: 322, title: "动态路由", level: 3, total: 7, practice: 1 }
                ]
            }
        ]
    }
];

const defaultNotes = [
    { 
        id: 1, 
        title: "Vue3 响应式原理笔记", 
        date: "2023-10-24", 
        count: 2, 
        tag: "Vue.js",
        content: "Vue3 使用 Proxy 来实现响应式...\n\n相比 Object.defineProperty，Proxy 可以...",
        questions: [
            { id: 101, title: "Vue3 的响应式基础 API 是什么？", type: "单选题", options: ["A. ref", "B. reactive", "C. computed"] },
            { id: 102, title: "Proxy 可以拦截哪些操作？", type: "多选题", options: ["A. 属性读取", "B. 属性设置", "C. 属性删除"] }
        ]
    },
    { 
        id: 2, 
        title: "JS 原型链复习", 
        date: "2023-10-22", 
        count: 0, 
        tag: "JavaScript",
        content: "原型链是 JS 继承的基础...",
        questions: []
    },
    { 
        id: 3, 
        title: "HTTP 协议状态码", 
        date: "2023-10-20", 
        count: 0, 
        tag: "网络",
        content: "200 OK\n404 Not Found\n500 Internal Server Error",
        questions: []
    }
];

// Load Data
let knowledgeTreeData = DataStore.get('knowledgeTree', defaultTreeData);
let mockNotes = DataStore.get('notes', defaultNotes);
let currentEditingNoteId = null;

// Init
document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

function initPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    // Highlight Sidebar
    highlightSidebar(page);

    // Common Init
    loadSettings();

    // Page Specific Init
    if (page === 'index.html' || page === '') {
        initHome();
    } else if (page === 'knowledge.html') {
        initKnowledge();
    } else if (page === 'note.html') {
        initNote();
    } else if (page === 'quiz.html') {
        initQuiz();
    } else if (page === 'center.html') {
        initCenter();
    }
}

function highlightSidebar(page) {
    // Remove active class from all
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active', 'text-primary', 'bg-blue-50');
        el.classList.add('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900');
    });

    // Find current link
    const link = document.querySelector(`.nav-item[href="${page}"]`) || document.querySelector(`.nav-item[href="index.html"]`);
    if (link) {
        link.classList.add('active', 'text-primary', 'bg-blue-50');
        link.classList.remove('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900');
    }
}

function initHome() {
    // Preview Tree
    const previewContainer = document.getElementById('home-tree-preview');
    if (previewContainer) {
        renderTree(knowledgeTreeData, previewContainer, 'normal');
    }
    renderKnowledgeProgress();
    initCharts();
}

function initKnowledge() {
    renderTree(knowledgeTreeData, document.getElementById('web-manage-tree-root'), 'manage');
}

function initNote() {
    renderWebNoteList();
}

function initQuiz() {
    renderTree(knowledgeTreeData, document.getElementById('web-manage-tree-root'), 'quiz');
    initQuizDashboardCharts();
    
    // Check URL params for mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode) {
        if (mode === 'special') showPracticeView('special');
        else if (mode === 'random') { showPracticeView('random'); startQuizSession('random'); }
        else if (mode === 'wrong') { showPracticeView('wrong'); startQuizSession('wrong'); }
        else if (mode === 'new') { showPracticeView('new'); startQuizSession('new'); }
    }
}

function showPracticeView(type) {
    document.getElementById('quiz-dashboard').classList.add('hidden');
    document.getElementById('quiz-practice-view').classList.remove('hidden');
    
    const sidebar = document.getElementById('quiz-sidebar');
    const content = document.getElementById('quiz-content-wrapper');
    const title = document.getElementById('practice-mode-title');
    const placeholder = document.getElementById('quiz-placeholder');
    const activeView = document.getElementById('quiz-active-view');
    const resultView = document.getElementById('quiz-result-view');
    
    // Reset Views
    placeholder.classList.remove('hidden');
    activeView.classList.add('hidden');
    resultView.classList.add('hidden');
    
    if (type === 'special') {
        sidebar.classList.remove('hidden');
        content.classList.remove('col-span-12');
        content.classList.add('col-span-9');
        title.textContent = '专项练习模式';
        // Wait for user to select node
    } else {
        sidebar.classList.add('hidden');
        content.classList.remove('col-span-9');
        content.classList.add('col-span-12');
        
        // Hide placeholder immediately for auto-start modes
        placeholder.classList.add('hidden');
        activeView.classList.remove('hidden');
        
        if (type === 'random') {
            title.textContent = '随机练习模式';
            document.getElementById('quiz-title').textContent = '随机抽查练习';
            document.getElementById('quiz-subtitle').textContent = '共 5 题 • 综合测试';
        } else if (type === 'wrong') {
            title.textContent = '错题攻坚模式';
            document.getElementById('quiz-title').textContent = '错题复习';
            document.getElementById('quiz-subtitle').textContent = '共 12 题 • 重点突破';
        } else if (type === 'new') {
            title.textContent = '新题速递模式';
            document.getElementById('quiz-title').textContent = '新题尝鲜';
            document.getElementById('quiz-subtitle').textContent = '共 10 题 • 查漏补缺';
        }
        
        // Hide intro cards & preview for direct modes
        document.getElementById('quiz-intro-cards').classList.add('hidden');
        document.getElementById('quiz-preview-section').classList.add('hidden');
    }
}

function showQuizDashboard() {
    document.getElementById('quiz-practice-view').classList.add('hidden');
    document.getElementById('quiz-dashboard').classList.remove('hidden');
    // Reset state
    currentQuizState.isSubmitted = false;
    currentQuizState.currentIndex = 0;
}

function showSpecialPractice() {
    showPracticeView('special');
}

function startRandomPractice() {
    showPracticeView('random');
    startQuizSession('random');
}

function startWrongPractice() {
    showPracticeView('wrong');
    startQuizSession('wrong');
}

function startNewKnowledgePractice() {
    showPracticeView('new');
    startQuizSession('new');
}

function initQuizDashboardCharts() {
    // 1. Activity Chart
    const ctxActivity = document.getElementById('quizActivityChart');
    if (ctxActivity) {
         new Chart(ctxActivity, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: '练习题数',
                    data: [12, 19, 3, 5, 2, 3, 15],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [2, 2] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // 2. Daily Goal Chart (Doughnut)
    const ctxGoal = document.getElementById('quizDailyGoalChart');
    if (ctxGoal) {
        new Chart(ctxGoal, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [15, 15],
                    backgroundColor: ['#10b981', '#f1f5f9'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    }
}

function initCenter() {
    initCharts(); // For Radar Chart
    
    // Check URL params for tab
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'settings') {
        const settingsBtn = document.querySelectorAll('.center-nav-item')[2]; 
        if(settingsBtn) switchCenterTab('settings', settingsBtn);
    }
}

// Navigation (Deprecated switchTab, kept for compatibility if needed or removed)
// function switchTab(tabName, element) { ... } 


// --- Note Logic ---
function renderWebNoteList() {
    const container = document.getElementById('web-note-list');
    if (!container) return;
    container.innerHTML = '';
    
    mockNotes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition mb-1 border border-transparent hover:border-gray-100 group';
        item.onclick = () => loadWebNote(note.id);
        
        item.innerHTML = `
            <h4 class="font-bold text-gray-800 text-sm mb-1 group-hover:text-primary transition">${note.title}</h4>
            <div class="flex justify-between items-center text-xs text-gray-400">
                <span>${note.date}</span>
                <span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">${note.tag}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function loadWebNote(noteId) {
    const note = mockNotes.find(n => n.id === noteId);
    if (!note) return;
    
    currentEditingNoteId = note.id;
    
    document.getElementById('web-note-placeholder').classList.add('hidden');
    document.getElementById('web-note-editor').classList.remove('hidden');
    
    document.getElementById('web-note-title').value = note.title;
    document.getElementById('web-note-content').value = note.content || '';
    document.getElementById('web-note-tag').textContent = note.tag;
    
    renderWebNoteQuestions(note);
}

function createNote() {
    switchTab('note');
    currentEditingNoteId = null;
    document.getElementById('web-note-placeholder').classList.add('hidden');
    document.getElementById('web-note-editor').classList.remove('hidden');
    
    document.getElementById('web-note-title').value = '';
    document.getElementById('web-note-content').value = '';
    document.getElementById('web-note-tag').textContent = '未分类';
    document.getElementById('web-note-questions').innerHTML = '<div class="text-xs text-gray-400 text-center py-4">暂无题目</div>';
}

function renderWebNoteQuestions(note) {
    const container = document.getElementById('web-note-questions');
    if (!note.questions || note.questions.length === 0) {
        container.innerHTML = '<div class="text-xs text-gray-400 text-center py-4">暂无关联题目</div>';
        return;
    }
    
    container.innerHTML = '';
    note.questions.forEach(q => {
        const item = document.createElement('div');
        item.className = 'bg-gray-50 p-2 rounded border border-gray-100 flex justify-between items-center';
        item.innerHTML = `
            <span class="text-xs text-gray-700 truncate flex-1">${q.title}</span>
            <span class="text-[10px] bg-blue-100 text-primary px-1 rounded ml-2">${q.type}</span>
        `;
        container.appendChild(item);
    });
}

function saveNote() {
    const title = document.getElementById('web-note-title').value;
    const content = document.getElementById('web-note-content').value;
    
    if (!title) {
        alert('请输入标题');
        return;
    }
    
    if (!currentEditingNoteId) {
        const newNote = {
            id: Date.now(),
            title: title,
            content: content,
            date: new Date().toISOString().split('T')[0],
            tag: '未分类',
            questions: []
        };
        mockNotes.unshift(newNote);
        currentEditingNoteId = newNote.id;
    } else {
        const note = mockNotes.find(n => n.id === currentEditingNoteId);
        if (note) {
            note.title = title;
            note.content = content;
        }
    }
    
    DataStore.set('notes', mockNotes);
    renderWebNoteList();
    alert('保存成功');
}

// --- Quiz Execution Logic ---

let currentQuizState = {
    questions: [],
    currentIndex: 0,
    userAnswers: {}, // { qId: answer }
    mode: 'immediate', // 'immediate' or 'submit_all'
    isSubmitted: false,
    sessionType: 'special' // 'special', 'random', 'wrong', 'new'
};

function setQuizMode(mode) {
    currentQuizState.mode = mode;
    // Update UI
    const immBtn = document.getElementById('mode-immediate-btn');
    const subBtn = document.getElementById('mode-submit-btn');
    
    if (mode === 'immediate') {
        immBtn.classList.add('bg-white', 'shadow-sm', 'text-primary');
        immBtn.classList.remove('text-slate-500', 'hover:text-slate-700');
        subBtn.classList.remove('bg-white', 'shadow-sm', 'text-primary');
        subBtn.classList.add('text-slate-500', 'hover:text-slate-700');
    } else {
        subBtn.classList.add('bg-white', 'shadow-sm', 'text-primary');
        subBtn.classList.remove('text-slate-500', 'hover:text-slate-700');
        immBtn.classList.remove('bg-white', 'shadow-sm', 'text-primary');
        immBtn.classList.add('text-slate-500', 'hover:text-slate-700');
    }
}

function startQuizSession(sessionType = 'special') {
    currentQuizState.sessionType = sessionType;
    
    // Hide Intro/Preview, Show Real Content
    document.getElementById('quiz-intro-cards').classList.add('hidden');
    document.getElementById('quiz-preview-section').classList.add('hidden');
    document.getElementById('quiz-real-content').classList.remove('hidden');
    document.getElementById('start-quiz-btn').classList.add('hidden'); // Hide start button once started
    
    // Mock Data Generation
    if (sessionType === 'random') {
        currentQuizState.questions = generateMockQuestions(5, '随机');
    } else if (sessionType === 'wrong') {
        currentQuizState.questions = generateMockQuestions(12, '错题');
    } else if (sessionType === 'new') {
        currentQuizState.questions = generateMockQuestions(10, '新题');
    } else {
        // Special
        // Check if quiz-title has text, if not use a default
        const titleEl = document.getElementById('quiz-title');
        const titleText = titleEl && titleEl.textContent ? titleEl.textContent : '专项练习';
        currentQuizState.questions = generateMockQuestions(20, titleText);
    }
    
    currentQuizState.currentIndex = 0;
    currentQuizState.userAnswers = {};
    currentQuizState.isSubmitted = false;
    
    // Default mode logic if not set by UI
    if (!currentQuizState.mode) currentQuizState.mode = 'immediate';
    
    renderQuizInterface();
}

function generateMockQuestions(count, prefix) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        type: i % 3 === 0 ? 'multi' : 'single',
        title: `${prefix} - 模拟题目 ${i + 1}：关于前端技术的深入探讨与应用？`,
        options: ['选项 A: 技术原理分析', '选项 B: 实际应用场景', '选项 C: 性能优化方案', '选项 D: 最佳实践指南'],
        correct: i % 3 === 0 ? [0, 2] : 1,
        explain: '这是题目的详细解析。包含原理分析、代码示例和注意事项。'
    }));
}

function renderQuizInterface() {
    const container = document.getElementById('quiz-real-content');
    
    // Safety check for empty questions
    if (!currentQuizState.questions || currentQuizState.questions.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-slate-400">暂无题目数据</div>';
        return;
    }
    
    const question = currentQuizState.questions[currentQuizState.currentIndex];
    const total = currentQuizState.questions.length;
    
    // Update Subtitle Progress
    document.getElementById('quiz-subtitle').innerHTML = `
        模式: <span class="font-bold text-primary">${currentQuizState.mode === 'immediate' ? '立即反馈' : '全卷提交'}</span> 
        • 进度: <span class="font-bold text-slate-800">${currentQuizState.currentIndex + 1}/${total}</span>
    `;
    
    let html = `
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-4 animate-fade-in">
            <div class="flex gap-3 mb-4">
                <span class="bg-blue-50 text-primary px-2 py-1 rounded text-xs font-bold h-fit whitespace-nowrap">${question.type === 'single' ? '单选' : '多选'}</span>
                <h3 class="text-lg font-bold text-slate-800 leading-relaxed">${question.title}</h3>
            </div>
            
            <div class="space-y-3">
                ${question.options.map((opt, idx) => {
                    const isSelected = isOptionSelected(question.id, idx);
                    // Show result if: (Immediate Mode AND Selected) OR (Submitted)
                    const showResult = (currentQuizState.mode === 'immediate' && isSelected) || currentQuizState.isSubmitted;
                    
                    let baseClass = "p-4 border rounded-lg flex items-center gap-3 cursor-pointer transition relative overflow-hidden group";
                    let stateClass = "border-slate-200 hover:bg-slate-50 hover:border-slate-300";
                    let icon = `<div class="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-transparent group-hover:border-primary group-hover:text-slate-300">${String.fromCharCode(65 + idx)}</div>`;
                    
                    if (isSelected) {
                        stateClass = "bg-blue-50 border-primary";
                        icon = `<div class="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs"><i class="fas fa-check"></i></div>`;
                    }
                    
                    // Result Coloring
                    if (showResult) {
                        const isCorrect = Array.isArray(question.correct) ? question.correct.includes(idx) : question.correct === idx;
                        
                        // If selected and correct -> Green
                        // If selected and wrong -> Red
                        // If not selected but correct (and submitted) -> Green Outline (Optional, usually we just show user answer status)
                        // Let's stick to: Green if correct option, Red if user selected wrong option.
                        
                        if (currentQuizState.isSubmitted) {
                             // Exam Mode Result
                             if (isCorrect) {
                                 stateClass = "bg-green-50 border-green-500";
                                 icon = `<div class="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs"><i class="fas fa-check"></i></div>`;
                             } else if (isSelected && !isCorrect) {
                                 stateClass = "bg-red-50 border-red-500";
                                 icon = `<div class="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"><i class="fas fa-times"></i></div>`;
                             }
                        } else {
                            // Immediate Mode Result (Only validate selected)
                            // If this option is the correct one -> Green
                            // If this option is selected but wrong -> Red
                             if (isCorrect) {
                                 stateClass = "bg-green-50 border-green-500";
                                 icon = `<div class="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs"><i class="fas fa-check"></i></div>`;
                             } else if (isSelected) { // Selected and not correct
                                 stateClass = "bg-red-50 border-red-500";
                                 icon = `<div class="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"><i class="fas fa-times"></i></div>`;
                             }
                        }
                    }

                    return `
                    <div class="${baseClass} ${stateClass}" onclick="${currentQuizState.isSubmitted ? '' : `selectOption(${idx})`}">
                        ${icon}
                        <span class="text-sm text-slate-700">${opt}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>

        <!-- Explanation -->
        ${(currentQuizState.isSubmitted || (currentQuizState.mode === 'immediate' && currentQuizState.userAnswers[question.id] !== undefined)) ? `
        <div class="bg-slate-50 border border-slate-100 rounded-xl p-5 animate-fade-in mb-4">
            <h4 class="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <i class="fas fa-lightbulb text-yellow-500"></i> 解析
            </h4>
            <p class="text-sm text-slate-600 leading-relaxed">${question.explain}</p>
        </div>
        ` : ''}
        
        <!-- Footer Navigation -->
        <div class="flex justify-between items-center pt-4 border-t border-slate-100">
            <button class="text-slate-500 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-500 px-3 py-1 flex items-center gap-1" 
                onclick="prevQuestion()" ${currentQuizState.currentIndex === 0 ? 'disabled' : ''}>
                <i class="fas fa-arrow-left"></i> 上一题
            </button>
            
            <div class="flex gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
                ${currentQuizState.questions.map((q, i) => {
                    let dotClass = "bg-slate-200";
                    if (i === currentQuizState.currentIndex) dotClass = "bg-primary scale-125";
                    else if (currentQuizState.userAnswers[q.id] !== undefined) dotClass = "bg-blue-300";
                    return `<div class="w-2 h-2 rounded-full shrink-0 transition ${dotClass}"></div>`;
                }).join('')}
            </div>

            <div class="flex gap-2">
                 ${currentQuizState.isSubmitted ? 
                 `<button class="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition" onclick="returnToResult()">
                    <i class="fas fa-th mr-1"></i>答题卡
                 </button>` : ''
                 }
                 
                 ${currentQuizState.currentIndex === total - 1 ? 
                    (currentQuizState.isSubmitted ? 
                        `<button class="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/20" onclick="returnToResult()">
                            <i class="fas fa-flag-checkered mr-1"></i>完成
                         </button>` : 
                        `<button class="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/20" onclick="submitQuiz()">
                            <i class="fas fa-flag-checkered mr-1"></i>交卷
                         </button>`
                    ) :
                    `<button class="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition disabled:opacity-50" onclick="nextQuestion()">
                        下一题 <i class="fas fa-arrow-right ml-1"></i>
                     </button>`
                 }
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function selectOption(optionIndex) {
    if (currentQuizState.isSubmitted) return;
    
    const question = currentQuizState.questions[currentQuizState.currentIndex];
    
    // In Immediate Mode, if already answered (and thus result shown), prevent changing? 
    // Usually yes, to prevent "guessing until green".
    if (currentQuizState.mode === 'immediate' && currentQuizState.userAnswers[question.id] !== undefined) {
        // Allow changing if multi-select? 
        // For simple logic, let's say once answered/revealed, locked.
        // But for multi, we need a confirm button usually.
        // Simplified: Single choice locks immediately. Multi choice waits? 
        // Let's assume Single choice locks.
        if (question.type === 'single') return;
    }

    if (question.type === 'single') {
        currentQuizState.userAnswers[question.id] = optionIndex;
        renderQuizInterface();
    } else {
        // Multi logic
        let current = currentQuizState.userAnswers[question.id] || [];
        if (!Array.isArray(current)) current = [];
        
        if (current.includes(optionIndex)) {
            current = current.filter(i => i !== optionIndex);
        } else {
            current.push(optionIndex);
        }
        currentQuizState.userAnswers[question.id] = current;
        renderQuizInterface();
    }
}

function isOptionSelected(qId, optIdx) {
    const ans = currentQuizState.userAnswers[qId];
    if (ans === undefined) return false;
    return Array.isArray(ans) ? ans.includes(optIdx) : ans === optIdx;
}

function nextQuestion() {
    if (currentQuizState.currentIndex < currentQuizState.questions.length - 1) {
        currentQuizState.currentIndex++;
        renderQuizInterface();
    }
}

function prevQuestion() {
    if (currentQuizState.currentIndex > 0) {
        currentQuizState.currentIndex--;
        renderQuizInterface();
    }
}

function submitQuiz() {
    if (confirm('确定交卷吗？')) {
        currentQuizState.isSubmitted = true;
        
        // Calculate Score
        let correctCount = 0;
        currentQuizState.questions.forEach(q => {
            const ans = currentQuizState.userAnswers[q.id];
            let isCorrect = false;
            if (Array.isArray(q.correct)) {
                // Multi check: Exact match arrays
                if (Array.isArray(ans) && ans.length === q.correct.length && ans.every(v => q.correct.includes(v))) {
                    isCorrect = true;
                }
            } else {
                if (ans === q.correct) isCorrect = true;
            }
            if (isCorrect) correctCount++;
        });
        
        const total = currentQuizState.questions.length;
        const score = Math.round((correctCount / total) * 100);
        
        // Show Result View
        document.getElementById('quiz-active-view').classList.add('hidden');
        document.getElementById('quiz-result-view').classList.remove('hidden');
        
        // Update Data
        document.getElementById('result-score').textContent = score;
        document.getElementById('result-total').textContent = total;
        document.getElementById('result-correct').textContent = correctCount;
        document.getElementById('result-wrong').textContent = total - correctCount;
        
        // Render Answer Sheet
        renderAnswerSheet();
    }
}

function renderAnswerSheet() {
    const container = document.getElementById('result-answer-sheet');
    if (!container) return;
    container.innerHTML = '';
    
    currentQuizState.questions.forEach((q, idx) => {
        const ans = currentQuizState.userAnswers[q.id];
        let isCorrect = false;
        
        if (Array.isArray(q.correct)) {
            if (Array.isArray(ans) && ans.length === q.correct.length && ans.every(v => q.correct.includes(v))) {
                isCorrect = true;
            }
        } else {
            if (ans === q.correct) isCorrect = true;
        }
        
        const item = document.createElement('div');
        // Colors: Correct = Green, Wrong = Red, Unanswered = Gray/Red
        let colorClass = isCorrect ? 'bg-green-100 text-green-600 border-green-200' : 'bg-red-100 text-red-600 border-red-200';
        if (ans === undefined) colorClass = 'bg-slate-100 text-slate-400 border-slate-200'; // Or treat as wrong
        
        item.className = `h-10 rounded-lg flex items-center justify-center font-bold text-sm border cursor-pointer hover:opacity-80 transition ${colorClass}`;
        item.textContent = idx + 1;
        item.onclick = () => reviewQuestion(idx);
        
        container.appendChild(item);
    });
}

function reviewQuestion(index) {
    currentQuizState.currentIndex = index;
    
    // Switch Views
    document.getElementById('quiz-result-view').classList.add('hidden');
    document.getElementById('quiz-active-view').classList.remove('hidden');
    
    renderQuizInterface();
}

function returnToResult() {
    document.getElementById('quiz-active-view').classList.add('hidden');
    document.getElementById('quiz-result-view').classList.remove('hidden');
}


function quitQuiz() {
    if (confirm('确定退出练习吗？进度将不会保存。')) {
        // Return to dashboard
        showQuizDashboard();
    }
}

// --- Knowledge Management Logic ---
let currentSelectedNode = null;


function searchTree(keyword) {
    const container = document.getElementById('web-manage-tree-root');
    if (!keyword) {
        renderTree(knowledgeTreeData, container, 'manage');
        return;
    }
    // Simple filter for demo
    // Ideally this should filter the tree data
    // For now just re-render to reset
    renderTree(knowledgeTreeData, container, 'manage');
}

function renderTree(data, container, mode = 'manage') {
    if (!container) return;
    container.innerHTML = '';
    
    const ul = document.createElement('ul');
    ul.className = 'space-y-1';
    
    data.forEach(node => {
        const li = document.createElement('li');
        
        const content = document.createElement('div');
        content.className = `flex items-center justify-between p-2 rounded cursor-pointer hover:bg-slate-50 transition group ${currentSelectedNode && currentSelectedNode.id === node.id ? 'bg-blue-50 text-primary' : 'text-slate-700'}`;
        
        // Indentation based on level (simplified)
        // In a real recursive render, we'd handle padding
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'flex items-center gap-2 text-sm';
        titleSpan.innerHTML = `
            <i class="fas ${node.children ? 'fa-folder text-yellow-400' : 'fa-file-alt text-slate-400'} text-xs"></i>
            ${node.title}
        `;
        
        content.appendChild(titleSpan);
        
        if (mode === 'manage') {
            const actions = document.createElement('div');
            actions.className = 'flex gap-2 opacity-0 group-hover:opacity-100 transition';
            actions.innerHTML = `
                <button class="text-[10px] text-slate-400 hover:text-primary"><i class="fas fa-plus"></i></button>
                <button class="text-[10px] text-slate-400 hover:text-red-500"><i class="fas fa-trash"></i></button>
            `;
            content.appendChild(actions);
        } else if (mode === 'quiz') {
             const badge = document.createElement('span');
             badge.className = 'text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded';
             badge.textContent = `${node.practice || 0}/${node.total || 0}`;
             content.appendChild(badge);
        }
        
        content.onclick = (e) => {
            e.stopPropagation();
            if (mode === 'manage') selectNode(node);
            if (mode === 'quiz') selectQuizNode(node);
        };
        
        li.appendChild(content);
        
        if (node.children && node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'pl-4 border-l border-slate-100 ml-2 mt-1';
            renderTree(node.children, childrenContainer, mode);
            li.appendChild(childrenContainer);
        }
        
        ul.appendChild(li);
    });
    
    container.appendChild(ul);
}

function selectNode(node) {
    currentSelectedNode = node;
    
    // Update Detail View
    document.getElementById('knowledge-placeholder').classList.add('hidden');
    document.getElementById('knowledge-detail').classList.remove('hidden');
    
    document.getElementById('selected-node-title').textContent = node.title;
    document.getElementById('selected-node-id').textContent = node.id;
    document.getElementById('selected-node-count').textContent = node.total || 0;
    
    // Highlight in Tree
    renderTree(knowledgeTreeData, document.getElementById('web-manage-tree-root'), 'manage');
    
    // Render Question List
    renderQuestionList(node);
}

function selectQuizNode(node) {
    currentSelectedNode = node;
    
    // Update UI
    const placeholder = document.getElementById('quiz-placeholder');
    const activeView = document.getElementById('quiz-active-view');
    
    if (placeholder) placeholder.classList.add('hidden');
    if (activeView) activeView.classList.remove('hidden');
    
    const title = document.getElementById('quiz-title');
    if (title) title.textContent = node.title;
    
    // Highlight Tree
    renderTree(knowledgeTreeData, document.getElementById('web-manage-tree-root'), 'quiz');
    
    // Render Preview
    renderQuizPreview(node);
}

function renderQuizPreview(node) {
    const list = document.getElementById('quiz-preview-list');
    if (!list) return;
    list.innerHTML = '';
    
    // Mock Data based on node
    const questions = [
        { title: `[${node.title}] 基础概念辨析`, type: '单选', diff: '简单', error: '12%' },
        { title: `[${node.title}] 核心原理应用`, type: '多选', diff: '中等', error: '35%' },
        { title: `[${node.title}] 源码分析与实现`, type: '判断', diff: '困难', error: '60%' },
        { title: `[${node.title}] 常见面试题解析`, type: '简答', diff: '中等', error: '25%' },
    ];
    
    questions.forEach(q => {
        const item = document.createElement('div');
        item.className = 'p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-white hover:shadow-sm transition';
        
        let color = 'bg-blue-100 text-primary';
        if (q.type === '多选') color = 'bg-purple-100 text-purple-600';
        if (q.type === '判断') color = 'bg-orange-100 text-orange-600';
        
        item.innerHTML = `
            <div class="flex gap-3 items-start">
                <span class="${color} px-2 py-0.5 rounded text-xs font-bold h-fit whitespace-nowrap">${q.type}</span>
                <div>
                    <div class="text-sm font-bold text-slate-700 mb-1">${q.title}</div>
                    <div class="text-xs text-slate-400">难度: ${q.diff} • 错误率: ${q.error}</div>
                </div>
            </div>
            <i class="fas fa-chevron-right text-slate-300"></i>
        `;
        list.appendChild(item);
    });
}

function renderQuestionList(node) {
    const list = document.getElementById('node-question-list');
    list.innerHTML = '';
    
    // Mock questions for demo
    const questions = [
        { title: `关于 ${node.title} 的基础概念题`, type: '单选题', difficulty: '简单' },
        { title: `${node.title} 的高级应用场景`, type: '多选题', difficulty: '困难' },
        { title: `${node.title} 代码填空`, type: '填空题', difficulty: '中等' }
    ];
    
    questions.forEach(q => {
        const item = document.createElement('div');
        item.className = 'p-3 border border-slate-100 rounded-lg hover:shadow-sm transition bg-white';
        item.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-medium text-slate-800">${q.title}</h4>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">${q.difficulty}</span>
            </div>
            <div class="flex gap-2">
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-primary">${q.type}</span>
            </div>
        `;
        list.appendChild(item);
    });
}

function addRootNode() {
    const title = prompt('输入知识点名称');
    if (title) {
        knowledgeTreeData.push({
            id: Date.now(),
            title: title,
            level: 1,
            children: []
        });
        DataStore.set('knowledgeTree', knowledgeTreeData);
        renderTree(knowledgeTreeData, document.getElementById('web-manage-tree-root'), 'manage');
    }
}

// --- Chart Logic ---
function initCharts() {
    // 1. Line Chart (Activity)
    const ctx = document.getElementById('webChart');
    if (ctx) {
        // Gradient
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [
                    {
                        label: '复习量',
                        data: [120, 132, 101, 134, 90, 230, 210],
                        borderColor: '#3b82f6',
                        backgroundColor: gradient,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 6
                    },
                    {
                        label: '新学',
                        data: [80, 90, 70, 100, 60, 150, 140],
                        borderColor: '#10b981',
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#1e293b',
                        bodyColor: '#475569',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 10,
                        titleFont: { family: 'Inter', size: 12 },
                        bodyFont: { family: 'Inter', size: 11 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', borderDash: [2, 2] },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // 2. Doughnut Chart (Distribution)
    const ctxDist = document.getElementById('distributionChart');
    if (ctxDist) {
        new Chart(ctxDist, {
            type: 'doughnut',
            data: {
                labels: ['JS', 'Vue', 'CSS', 'HTML'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#3b82f6', '#6366f1', '#10b981', '#fb923c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { display: false } }
            }
        });
    }
    
    // 3. Radar Chart (User Stats)
    const ctxRadar = document.getElementById('centerRadarChart');
    if (ctxRadar) {
        new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['基础', '框架', '工程化', '算法', '网络', '设计'],
                datasets: [{
                    label: '当前能力',
                    data: [85, 90, 75, 60, 70, 65],
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: '#f1f5f9' },
                        grid: { color: '#f1f5f9' },
                        pointLabels: {
                            font: { size: 10, family: 'Inter' },
                            color: '#64748b'
                        },
                        ticks: { display: false }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // 4. Quiz Goal Chart (Doughnut)
    const ctxQuizGoal = document.getElementById('quizGoalChart');
    if (ctxQuizGoal) {
        new Chart(ctxQuizGoal, {
            type: 'doughnut',
            data: {
                labels: ['已完成', '未完成'],
                datasets: [{
                    data: [150, 50],
                    backgroundColor: ['#3b82f6', '#f1f5f9'],
                    borderWidth: 0,
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }
}

// --- Center & Settings Logic ---

function switchCenterTab(tabName, btn) {
    // Hide all panels
    document.querySelectorAll('.center-panel').forEach(el => el.classList.add('hidden'));
    
    // Show selected panel
    document.getElementById(`center-panel-${tabName}`).classList.remove('hidden');
    
    // Update Nav State
    document.querySelectorAll('.center-nav-item').forEach(el => {
        el.classList.remove('text-primary', 'bg-blue-50');
        el.classList.add('text-slate-600', 'hover:bg-slate-50');
    });
    btn.classList.add('text-primary', 'bg-blue-50');
    btn.classList.remove('text-slate-600', 'hover:bg-slate-50');
}

function openSettings() {
    switchTab('center');
    // Find the settings button and click it to switch sub-tab
    const settingsBtn = document.querySelectorAll('.center-nav-item')[2]; 
    if(settingsBtn) switchCenterTab('settings', settingsBtn);
}

// AI Settings Logic
function saveAISettings() {
    const provider = document.getElementById('web-ai-provider').value;
    const apiKey = document.getElementById('web-ai-key').value;
    
    if (provider) DataStore.set('ai_provider', provider);
    if (apiKey) DataStore.set('ai_api_key', apiKey);
    
    console.log('Settings saved:', provider);
}

function loadSettings() {
    const provider = DataStore.get('ai_provider', 'openai');
    const apiKey = DataStore.get('ai_api_key', '');
    const sound = DataStore.get('setting_sound', true);
    
    // Web
    const webProvider = document.getElementById('web-ai-provider');
    const webKey = document.getElementById('web-ai-key');
    if (webProvider) webProvider.value = provider;
    if (webKey) webKey.value = apiKey;
    
    const soundToggle = document.getElementById('setting-sound');
    if (soundToggle) soundToggle.checked = sound;
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling; // The eye icon or a wrapper
    // In our new layout, the eye icon is the *second* sibling after the key icon
    // But let's just query by parent
    
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function toggleSound(checkbox) {
    DataStore.set('setting_sound', checkbox.checked);
}

// --- New Feature: Knowledge Progress Dynamic Render ---
function renderKnowledgeProgress() {
    const container = document.getElementById('knowledge-progress-list');
    if (!container) return;
    container.innerHTML = '';

    // Recursive helper to count total items
    function countStats(node) {
        let total = node.total || 0;
        let practice = node.practice || 0;
        if (node.children) {
            node.children.forEach(child => {
                const childStats = countStats(child);
                total += childStats.total;
                practice += childStats.practice;
            });
        }
        return { total, practice };
    }

    const colors = [
        { bar: 'bg-blue-500', bg: 'bg-slate-100' },
        { bar: 'bg-indigo-500', bg: 'bg-slate-100' },
        { bar: 'bg-emerald-500', bg: 'bg-slate-100' },
        { bar: 'bg-orange-400', bg: 'bg-slate-100' },
        { bar: 'bg-purple-500', bg: 'bg-slate-100' }
    ];

    knowledgeTreeData.forEach((node, index) => {
        // We only show top level nodes or flattened list? 
        // Let's show top level nodes with aggregated stats
        const stats = countStats(node);
        const percent = stats.total > 0 ? Math.round((stats.practice / stats.total) * 100) : 0;
        const color = colors[index % colors.length];

        const item = document.createElement('div');
        item.className = 'space-y-1';
        item.innerHTML = `
            <div class="flex justify-between text-[10px] text-slate-600 font-medium">
                <span>${node.title}</span>
                <span>${stats.practice}/${stats.total} 题</span>
            </div>
            <div class="w-full ${color.bg} h-1.5 rounded-full overflow-hidden relative group cursor-pointer" title="掌握率 ${percent}%">
                <div class="${color.bar} h-full rounded-full transition-all duration-500" style="width: ${percent}%"></div>
            </div>
        `;
        container.appendChild(item);
    });
}

// --- New Feature: AI Connection Test ---
function testAIConnection(platform = 'web') {
    const btnId = platform === 'web' ? 'web-ai-test-btn' : 'mobile-ai-test-btn';
    const statusId = platform === 'web' ? 'web-ai-status' : 'mobile-ai-status';
    const keyId = platform === 'web' ? 'web-ai-key' : 'mobile-ai-key';
    
    const btn = document.getElementById(btnId);
    const status = document.getElementById(statusId);
    const key = document.getElementById(keyId).value;

    if (!key) {
        status.innerHTML = '<span class="text-red-500"><i class="fas fa-times-circle"></i> 请输入 API Key</span>';
        status.classList.remove('hidden');
        return;
    }

    // Loading State
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    status.classList.add('hidden');

    // Simulate API Call
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        status.classList.remove('hidden');
        
        // Mock Success (randomly fail if key is "fail")
        if (key === 'fail') {
            status.innerHTML = '<span class="text-red-500"><i class="fas fa-times-circle"></i> 连接失败: 401 Unauthorized</span>';
        } else {
            status.innerHTML = '<span class="text-green-500"><i class="fas fa-check-circle"></i> 连接成功</span>';
            // Save if successful
            saveAISettings();
        }
    }, 1500);
}

// Initialize Settings on Load
window.addEventListener('load', loadSettings);

// Mock Modal Functions
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function hideAddQuestionForm() { document.getElementById('add-question-overlay').classList.add('hidden'); }
function showAddQuestionForm() { document.getElementById('add-question-overlay').classList.remove('hidden'); }

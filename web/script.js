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

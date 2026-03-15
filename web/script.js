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
    initWeb();
});

function initWeb() {
    renderWebNoteList();
    renderTree(knowledgeTreeData, document.getElementById('web-manage-tree-root'), 'manage');
    
    // Preview Tree on Home
    const previewContainer = document.getElementById('home-tree-preview');
    if (previewContainer) {
        renderTree(knowledgeTreeData, previewContainer, 'normal');
    }
    
    initCharts();
}

// Navigation
function switchTab(tabName, element) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    
    // Show selected view
    document.getElementById(`view-${tabName}`).classList.remove('hidden');
    
    // Update Sidebar State
    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active', 'text-primary', 'bg-blue-50');
            el.classList.add('text-gray-600', 'hover:bg-gray-50', 'hover:text-primary');
        });
        element.classList.add('active', 'text-primary', 'bg-blue-50');
        element.classList.remove('text-gray-600', 'hover:bg-gray-50', 'hover:text-primary');
    }
    
    // Update Title
    const titles = {
        'home': '首页概览',
        'knowledge': '知识体系管理',
        'note': '智能笔记',
        'quiz': '题库练习',
        'center': '个人中心'
    };
    document.getElementById('page-title').textContent = titles[tabName] || '智库 AI';
}

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

// --- Tree Logic ---
function renderTree(data, container, mode = 'normal') {
    if (!data || !container) return;
    container.innerHTML = '';
    
    data.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'ml-4 py-1';
        
        const hasChildren = node.children && node.children.length > 0;
        let iconClass = 'fas fa-circle';
        let iconStyle = 'font-size: 6px;';
        let iconColor = 'text-gray-300';
        
        if (hasChildren) {
            iconClass = 'fas fa-caret-right';
            iconStyle = '';
            iconColor = 'text-gray-400';
        }

        const toggleIcon = `<i class="${iconClass} ${iconColor} mr-2 w-4 text-center transition-transform duration-200 node-icon" style="${iconStyle}"></i>`;
        
        let actionBtn = '';
        
        if (mode === 'normal') {
             const countInfo = (node.total !== undefined) 
                ? `<span class="text-[10px] text-gray-400 mr-2 shrink-0">${node.practice || 0}/${node.total}</span>` 
                : '';
            
            if (node.level >= 2) {
                 actionBtn = `<div class="ml-auto flex items-center">${countInfo}<button class="bg-primary text-white text-xs px-2 py-0.5 rounded hover:bg-blue-600 transition" onclick="event.stopPropagation(); alert('Start Quiz: ${node.title}')">练习</button></div>`;
            }
        } else if (mode === 'manage') {
            actionBtn = `
                <div class="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button class="text-green-500 hover:bg-green-50 p-1 rounded" title="添加子节点" onclick="event.stopPropagation(); addNode(${node.id})"><i class="fas fa-plus"></i></button>
                    <button class="text-blue-500 hover:bg-blue-50 p-1 rounded" title="编辑" onclick="event.stopPropagation(); editNode(${node.id})"><i class="fas fa-edit"></i></button>
                    <button class="text-red-500 hover:bg-red-50 p-1 rounded" title="删除" onclick="event.stopPropagation(); deleteNode(${node.id})"><i class="fas fa-trash"></i></button>
                </div>`;
        }

        nodeEl.innerHTML = `
            <div class="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 transition group node-content" onclick="toggleNode(this)">
                ${toggleIcon}
                <span class="text-sm text-gray-700 font-medium">${node.title}</span>
                ${actionBtn}
            </div>
            ${hasChildren ? '<div class="pl-2 border-l border-gray-100 hidden children-container"></div>' : ''}
        `;
        
        container.appendChild(nodeEl);
        
        if (hasChildren) {
            const childrenContainer = nodeEl.querySelector('.children-container');
            renderTree(node.children, childrenContainer, mode);
        }
    });
}

function toggleNode(element) {
    const childrenContainer = element.nextElementSibling;
    const icon = element.querySelector('.node-icon');
    
    if (childrenContainer && childrenContainer.classList.contains('children-container')) {
        const isHidden = childrenContainer.classList.contains('hidden');
        if (isHidden) {
            childrenContainer.classList.remove('hidden');
            icon.classList.remove('fa-caret-right');
            icon.classList.add('fa-caret-down');
        } else {
            childrenContainer.classList.add('hidden');
            icon.classList.remove('fa-caret-down');
            icon.classList.add('fa-caret-right');
        }
    }
}

// --- Chart Logic ---
function initCharts() {
    // 1. Learning Trend Chart (Line with Gradient)
    const ctx = document.getElementById('webChart');
    if (ctx) {
        // Destroy existing if any to prevent overlay
        if (window.myWebChart) window.myWebChart.destroy();

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(24, 144, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(24, 144, 255, 0)');

        window.myWebChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '复习题目数',
                    data: [12, 19, 3, 5, 2, 3, 15],
                    borderColor: '#1890ff',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#1890ff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 12 },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [2, 4], color: '#f0f0f0', drawBorder: false },
                        ticks: { font: { size: 10 }, color: '#999' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, color: '#999' }
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

    // 2. Knowledge Distribution Chart (Doughnut)
    const ctxDist = document.getElementById('distributionChart');
    if (ctxDist) {
        if (window.myDistChart) window.myDistChart.destroy();

        window.myDistChart = new Chart(ctxDist, {
            type: 'doughnut',
            data: {
                labels: ['前端基础', 'JavaScript', 'Vue.js', 'React', 'Node.js'],
                datasets: [{
                    data: [35, 45, 25, 15, 10], // Mock data
                    backgroundColor: [
                        '#1890ff', // Blue
                        '#faad14', // Yellow
                        '#52c41a', // Green
                        '#13c2c2', // Cyan
                        '#722ed1'  // Purple
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 8,
                            font: { size: 10 },
                            color: '#666'
                        }
                    }
                },
                cutout: '75%'
            }
        });
    }
}

// --- Placeholder Actions ---
function addNode(id) { alert('Web版: 添加节点 ' + id); }
function editNode(id) { alert('Web版: 编辑节点 ' + id); }
function deleteNode(id) { alert('Web版: 删除节点 ' + id); }
function importTreeJSON() { alert('Web版: 导入JSON'); }
function exportTreeJSON() { alert('Web版: 导出JSON'); }
function addRootNode() { alert('Web版: 新建根节点'); }
function startRandomQuiz() { alert('Web版: 开始随机练习'); }
function openKnowledgeTree() { switchTab('knowledge'); }
function continueLastQuiz() { alert('Web版: 继续上次练习'); }
function generateQuestionsFromNote() { alert('Web版: AI生成题目'); }
function addQuestionToNoteContext() { alert('Web版: 手动添加题目'); }
function openSettings() { alert('Web版: 设置'); }
function exportAllData() { alert('Web版: 导出数据'); }
function importAllData() { alert('Web版: 导入数据'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }


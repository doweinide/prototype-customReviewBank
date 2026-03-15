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

// --- Knowledge Management Logic ---

let currentSelectedNode = null;

function searchTree(keyword) {
    const container = document.getElementById('web-manage-tree-root');
    if (!keyword) {
        renderTree(knowledgeTreeData, container, 'manage'); 
        return;
    }
    
    // Flatten tree for search
    const matches = [];
    function traverse(nodes) {
        nodes.forEach(node => {
            if (node.title.toLowerCase().includes(keyword.toLowerCase())) {
                matches.push(node);
            }
            if (node.children) {
                traverse(node.children);
            }
        });
    }
    traverse(knowledgeTreeData);
    
    container.innerHTML = '';
    if (matches.length === 0) {
        container.innerHTML = '<div class="p-3 text-gray-400 text-center text-sm">无搜索结果</div>';
        return;
    }
    
    matches.forEach(node => {
         const nodeEl = document.createElement('div');
         nodeEl.className = 'ml-0 py-2 border-b border-gray-50 last:border-0';
         nodeEl.innerHTML = `
            <div class="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50" onclick="selectManageNode(${node.id})">
                <i class="fas fa-search mr-2 text-gray-300 text-xs"></i>
                <span class="text-sm text-gray-700">${node.title}</span>
                <span class="ml-auto text-xs text-gray-400 bg-gray-100 px-1.5 rounded">ID: ${node.id}</span>
            </div>
        `;
        container.appendChild(nodeEl);
    });
}

function selectManageNode(nodeId) {
    // Find node
    let targetNode = null;
    function find(nodes) {
        for (let node of nodes) {
            if (node.id === nodeId) {
                targetNode = node;
                return;
            }
            if (node.children) find(node.children);
        }
    }
    find(knowledgeTreeData);
    
    if (!targetNode) return;
    currentSelectedNode = targetNode;
    
    // Update UI
    document.getElementById('knowledge-placeholder').classList.add('hidden');
    document.getElementById('knowledge-detail').classList.remove('hidden');
    
    document.getElementById('selected-node-title').textContent = targetNode.title;
    document.getElementById('selected-node-id').textContent = targetNode.id;
    document.getElementById('selected-node-level').textContent = `Level ${targetNode.level}`;
    
    // Init questions array if missing
    if (!targetNode.questions) targetNode.questions = [];
    document.getElementById('selected-node-count').textContent = targetNode.questions.length;
    
    renderNodeQuestions(targetNode);
    
    // Highlight in tree (if visible)
    document.querySelectorAll('.node-content').forEach(el => el.classList.remove('bg-blue-50', 'text-primary'));
    // Note: If searched, the tree structure might not be fully rendered to find the element easily by ID without re-rendering. 
    // For prototype simplicity, we just render content.
}

function renderNodeQuestions(node) {
    const container = document.getElementById('node-question-list');
    container.innerHTML = '';
    
    if (node.questions.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-48 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <i class="fas fa-clipboard-list text-2xl mb-2 opacity-50"></i>
                <p class="text-xs">暂无题目</p>
                <button class="mt-3 text-primary text-xs hover:underline" onclick="showAddQuestionForm()">立即录入</button>
            </div>
        `;
        return;
    }
    
    node.questions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'bg-gray-50 p-4 rounded-xl border border-gray-100 group hover:border-primary/30 transition';
        item.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="bg-white border border-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-medium shadow-sm">${q.type}</span>
                    <span class="text-xs text-gray-400">ID: ${q.id}</span>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button class="text-gray-400 hover:text-blue-500" title="编辑"><i class="fas fa-edit"></i></button>
                    <button class="text-gray-400 hover:text-red-500" title="删除" onclick="deleteQuestion(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p class="text-sm text-gray-800 font-medium mb-2">${q.title}</p>
            ${q.options ? `
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    ${q.options.map((opt, i) => `
                        <div class="flex items-center gap-1.5">
                            <span class="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px]">${String.fromCharCode(65+i)}</span>
                            <span>${opt}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        container.appendChild(item);
    });
}

function showAddQuestionForm() {
    document.getElementById('add-question-overlay').classList.remove('hidden');
    document.getElementById('new-q-title').value = '';
    // Reset other fields...
}

function hideAddQuestionForm() {
    document.getElementById('add-question-overlay').classList.add('hidden');
}

function saveNewQuestion() {
    if (!currentSelectedNode) return;
    
    const title = document.getElementById('new-q-title').value;
    const type = document.getElementById('new-q-type').value;
    
    if (!title) {
        alert("请输入题目内容");
        return;
    }
    
    const newQ = {
        id: Date.now(),
        title: title,
        type: type,
        options: []
    };
    
    if (type === '单选题' || type === '多选题') {
        const inputs = document.getElementById('new-q-options').querySelectorAll('input');
        inputs.forEach(input => {
            if (input.value) newQ.options.push(input.value);
        });
        if (newQ.options.length < 2) {
             // For prototype, let's just add mocks if empty
             if(newQ.options.length === 0) newQ.options = ["选项 A", "选项 B", "选项 C", "选项 D"];
        }
    }
    
    currentSelectedNode.questions.push(newQ);
    // Update counts
    currentSelectedNode.total = (currentSelectedNode.total || 0) + 1;
    document.getElementById('selected-node-count').textContent = currentSelectedNode.questions.length;
    
    DataStore.set('knowledgeTree', knowledgeTreeData);
    
    renderNodeQuestions(currentSelectedNode);
    hideAddQuestionForm();
    
    // Refresh tree to show updated counts if we were using a recursive render that showed counts
    // For now, just update the detail view is enough.
}

function deleteQuestion(idx) {
    if (!currentSelectedNode) return;
    if (confirm("确定删除此题目？")) {
        currentSelectedNode.questions.splice(idx, 1);
        currentSelectedNode.total = Math.max(0, (currentSelectedNode.total || 0) - 1);
        document.getElementById('selected-node-count').textContent = currentSelectedNode.questions.length;
        DataStore.set('knowledgeTree', knowledgeTreeData);
        renderNodeQuestions(currentSelectedNode);
    }
}

function showAIQuestionForm() {
    if (!currentSelectedNode) return;
    const count = prompt("请输入要生成的题目数量:", "3");
    if (count) {
        // Mock AI Generation
        const newQuestions = Array(parseInt(count)).fill(0).map((_, i) => ({
            id: Date.now() + i,
            title: `[AI生成] 关于 ${currentSelectedNode.title} 的测试题目 #${i+1}`,
            type: "单选题",
            options: ["正确选项", "干扰项 A", "干扰项 B", "干扰项 C"]
        }));
        
        currentSelectedNode.questions.push(...newQuestions);
        currentSelectedNode.total = (currentSelectedNode.total || 0) + parseInt(count);
        DataStore.set('knowledgeTree', knowledgeTreeData);
        
        document.getElementById('selected-node-count').textContent = currentSelectedNode.questions.length;
        renderNodeQuestions(currentSelectedNode);
        alert(`成功生成 ${count} 道题目！`);
    }
}

function showBatchImportForm() {
    if (!currentSelectedNode) {
        alert("请先选择一个知识点节点！");
        return;
    }
    document.getElementById('batch-import-overlay').classList.remove('hidden');
    document.getElementById('batch-import-input').value = '';
}

function hideBatchImportForm() {
    document.getElementById('batch-import-overlay').classList.add('hidden');
}

function processBatchImportQuestions() {
    if (!currentSelectedNode) return;
    
    const input = document.getElementById('batch-import-input').value;
    if (!input.trim()) {
        alert("请输入 JSON 数据");
        return;
    }
    
    try {
        const data = JSON.parse(input);
        if (!Array.isArray(data)) {
            alert("格式错误：必须是 JSON 数组");
            return;
        }
        
        let successCount = 0;
        data.forEach(item => {
            if (item.title && item.type) {
                currentSelectedNode.questions.push({
                    id: Date.now() + Math.random(), // Simple unique ID
                    title: item.title,
                    type: item.type,
                    options: item.options || [],
                    explanation: item.explanation || ""
                });
                successCount++;
            }
        });
        
        if (successCount > 0) {
            currentSelectedNode.total = (currentSelectedNode.total || 0) + successCount;
            document.getElementById('selected-node-count').textContent = currentSelectedNode.questions.length;
            
            DataStore.set('knowledgeTree', knowledgeTreeData);
            renderNodeQuestions(currentSelectedNode);
            hideBatchImportForm();
            alert(`成功导入 ${successCount} 道题目！`);
        } else {
            alert("未找到有效的题目数据，请检查字段名 (title, type)");
        }
        
    } catch (e) {
        alert("JSON 解析失败：" + e.message);
    }
}

// Update renderTree to use selection logic
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
        let clickHandler = `toggleNode(this)`; // Default toggle
        
        if (mode === 'manage') {
            // In manage mode, clicking the row selects the node
            clickHandler = `selectManageNode(${node.id})`;
            
            // Add subtle actions
             actionBtn = `
                <div class="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button class="text-green-500 hover:bg-green-50 p-1 rounded" title="添加子节点" onclick="event.stopPropagation(); addNode(${node.id})"><i class="fas fa-plus"></i></button>
                    <button class="text-red-500 hover:bg-red-50 p-1 rounded" title="删除" onclick="event.stopPropagation(); deleteNode(${node.id})"><i class="fas fa-trash"></i></button>
                </div>`;
        } else if (mode === 'normal') {
             // ... existing normal mode logic ...
             const countInfo = (node.total !== undefined) 
                ? `<span class="text-[10px] text-gray-400 mr-2 shrink-0">${node.practice || 0}/${node.total}</span>` 
                : '';
            
            if (node.level >= 2) {
                 actionBtn = `<div class="ml-auto flex items-center">${countInfo}<button class="bg-primary text-white text-xs px-2 py-0.5 rounded hover:bg-blue-600 transition" onclick="event.stopPropagation(); alert('Start Quiz: ${node.title}')">练习</button></div>`;
            }
        }

        nodeEl.innerHTML = `
            <div class="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 transition group node-content" onclick="${clickHandler}">
                <span onclick="event.stopPropagation(); toggleNode(this.parentNode)">${toggleIcon}</span>
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
    // 1. Learning Trend Chart (Multi-dataset Line)
    const ctx = document.getElementById('webChart');
    if (ctx) {
        if (window.myWebChart) window.myWebChart.destroy();

        // Create gradients
        const ctx2d = ctx.getContext('2d');
        const gradientBlue = ctx2d.createLinearGradient(0, 0, 0, 300);
        gradientBlue.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        gradientBlue.addColorStop(1, 'rgba(59, 130, 246, 0)');

        const gradientGreen = ctx2d.createLinearGradient(0, 0, 0, 300);
        gradientGreen.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        gradientGreen.addColorStop(1, 'rgba(16, 185, 129, 0)');

        window.myWebChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [
                    {
                        label: '复习量',
                        data: [12, 19, 15, 25, 22, 30, 45],
                        borderColor: '#3b82f6', // blue-500
                        backgroundColor: gradientBlue,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    },
                    {
                        label: '新学',
                        data: [5, 8, 12, 10, 15, 20, 18],
                        borderColor: '#10b981', // emerald-500
                        backgroundColor: gradientGreen,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    },
                    {
                        label: '错题',
                        data: [2, 5, 3, 6, 4, 8, 5],
                        borderColor: '#f87171', // red-400
                        borderDash: [5, 5],
                        borderWidth: 2,
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
                        boxPadding: 4
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [2, 4], color: '#f1f5f9', drawBorder: false },
                        ticks: { font: { size: 10 }, color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, color: '#94a3b8' }
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

    // 2. Knowledge Distribution Chart (Doughnut - Compact)
    const ctxDist = document.getElementById('distributionChart');
    if (ctxDist) {
        if (window.myDistChart) window.myDistChart.destroy();

        window.myDistChart = new Chart(ctxDist, {
            type: 'doughnut',
            data: {
                labels: ['JavaScript', 'Vue.js', 'CSS', 'HTML', 'Other'],
                datasets: [{
                    data: [45, 25, 20, 10, 5],
                    backgroundColor: [
                        '#3b82f6', // blue
                        '#6366f1', // indigo
                        '#10b981', // emerald
                        '#f97316', // orange
                        '#cbd5e1'  // slate
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '70%'
            }
        });
    }
}

// --- Center / Settings Logic ---

function switchCenterTab(tabName, btnElement) {
    // Hide all center panels
    document.querySelectorAll('.center-panel').forEach(el => el.classList.add('hidden'));
    const panel = document.getElementById(`center-panel-${tabName}`);
    if (panel) panel.classList.remove('hidden');

    // Update Sidebar State
    document.querySelectorAll('.center-nav-item').forEach(el => {
        el.classList.remove('text-primary', 'bg-blue-50');
        el.classList.add('text-gray-600', 'hover:bg-gray-50');
    });
    if (btnElement) {
        btnElement.classList.remove('text-gray-600', 'hover:bg-gray-50');
        btnElement.classList.add('text-primary', 'bg-blue-50');
    }

    if (tabName === 'stats') {
        renderCenterStats();
    }
}

function openSettings() {
    switchTab('center');
    // Find the settings button in the center nav
    // We need to trigger the click or manually switch
    const settingsBtn = document.querySelector('button[onclick*="switchCenterTab(\'settings\'"]');
    if (settingsBtn) {
        switchCenterTab('settings', settingsBtn);
    }
}

function renderCenterStats() {
    const ctx = document.getElementById('centerRadarChart');
    if (!ctx) return;
    
    if (window.myCenterRadarChart) window.myCenterRadarChart.destroy();

    window.myCenterRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['基础', '原理', '实战', '算法', '架构', '调试'],
            datasets: [{
                label: '当前能力',
                data: [85, 65, 90, 55, 40, 75],
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue-500
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
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    angleLines: { color: '#f1f5f9' },
                    grid: { color: '#f1f5f9' },
                    pointLabels: { font: { size: 12 }, color: '#64748b' },
                    ticks: { display: false, backdropColor: 'transparent' }
                }
            }
        }
    });
}

function toggleSound(checkbox) {
    const enabled = checkbox.checked;
    DataStore.set('setting_sound', enabled);
    console.log("Sound enabled:", enabled);
}

function exportAllData() {
    const data = {
        knowledgeTree: DataStore.get('knowledgeTree', defaultTreeData),
        notes: DataStore.get('notes', defaultNotes),
        settings: {
            sound: DataStore.get('setting_sound', true)
        },
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zhiku_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importAllData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.knowledgeTree) DataStore.set('knowledgeTree', data.knowledgeTree);
            if (data.notes) DataStore.set('notes', data.notes);
            if (data.settings) {
                if (data.settings.sound !== undefined) DataStore.set('setting_sound', data.settings.sound);
            }
            
            alert('数据恢复成功！页面即将刷新...');
            location.reload();
        } catch (err) {
            alert('导入失败：文件格式错误');
            console.error(err);
        }
    };
    reader.readAsText(file);
    input.value = ''; 
}

function clearAllData() {
    if (confirm('确定要清空所有数据吗？此操作无法撤销！\n(这将重置为默认演示数据)')) {
        localStorage.removeItem('knowledgeTree');
        localStorage.removeItem('notes');
        localStorage.removeItem('setting_sound');
        alert('数据已清空，即将刷新...');
        location.reload();
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
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }


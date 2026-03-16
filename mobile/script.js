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

// Initial Data
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
let currentEditingNoteId = null; // Track currently edited note
let currentTreeContext = null; // Track context for tree selection (note vs question)

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Auto-init charts if on Center page
    if (path.includes('center.html') || document.getElementById('quizCurveChart')) {
        const ctxQuiz = document.getElementById('quizCurveChart');
        if (ctxQuiz) {
            const ctx2d = ctxQuiz.getContext('2d');
            // Create a beautiful gradient
            const gradient = ctx2d.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)'); // Blue-500
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

            new Chart(ctxQuiz, {
                type: 'line',
                data: {
                    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                    datasets: [{
                        label: '本周做题',
                        data: [15, 22, 18, 30, 25, 45, 32],
                        borderColor: '#3b82f6', // Blue-500
                        backgroundColor: gradient,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#3b82f6',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#3b82f6',
                        pointHoverBorderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#1e293b',
                            bodyColor: '#475569',
                            borderColor: '#e2e8f0',
                            borderWidth: 1,
                            padding: 10,
                            boxPadding: 4,
                            callbacks: {
                                label: (context) => `${context.parsed.y} 道题`
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: 10, family: "'Inter', sans-serif" },
                                color: '#94a3b8'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                borderDash: [4, 4],
                                color: '#f1f5f9',
                                drawBorder: false
                            },
                            ticks: {
                                font: { size: 10, family: "'Inter', sans-serif" },
                                color: '#94a3b8',
                                stepSize: 10
                            }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    }
                }
            });
        }
        
        loadSettings(); // Load settings when on center page
    }
    
    // Auto-init Note list if on Note page
    if (path.includes('note.html') || document.getElementById('note-list-container')) {
        renderNoteTree(knowledgeTreeData, document.getElementById('note-tree-container'));
        renderNoteList();
    }

    // Auto-init Tree Manage if on Knowledge page
    if (path.includes('knowledge.html') && document.getElementById('manage-tree-root')) {
        renderTree(knowledgeTreeData, document.getElementById('manage-tree-root'), 'manage');
    }
});

// --- Tree Rendering Logic ---
function renderTree(data, container, mode = 'manage') {
    if (!container) return;
    container.innerHTML = '';
    
    const ul = document.createElement('ul');
    ul.className = 'space-y-2';
    
    data.forEach(node => {
        const li = document.createElement('li');
        
        const content = document.createElement('div');
        content.className = 'flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm active:bg-gray-50 transition cursor-pointer';
        
        const left = document.createElement('div');
        left.className = 'flex items-center gap-3';
        
        // Icon logic: if has children, show toggle icon
        const iconClass = node.children && node.children.length > 0 
            ? 'fa-folder text-yellow-400' 
            : 'fa-file-alt text-gray-400';
            
        left.innerHTML = `
            <i class="fas ${iconClass} text-lg w-5 text-center"></i>
            <div>
                <div class="text-sm font-medium text-gray-800">${node.title}</div>
                ${mode === 'manage' ? `<div class="text-[10px] text-gray-400">${node.children ? node.children.length + ' 子项' : '0 题目'}</div>` : ''}
            </div>
        `;
        
        content.appendChild(left);
        
        if (mode === 'manage') {
            const actions = document.createElement('div');
            actions.className = 'flex gap-3 text-gray-400';
            actions.innerHTML = `
                <i class="fas fa-plus hover:text-primary p-2" onclick="event.stopPropagation(); addChildNode(${node.id})"></i>
                <i class="fas fa-trash hover:text-red-500 p-2" onclick="event.stopPropagation(); deleteNode(${node.id})"></i>
            `;
            content.appendChild(actions);
            // Toggle on click for manage mode too
            content.onclick = (e) => toggleNode(e, node.id);
        } else if (mode === 'select' || mode === 'normal') {
            // For select/normal, clicking the content selects it, but we need a way to expand
            // Let's add an expand icon if it has children
            if (node.children && node.children.length > 0) {
                 const expandBtn = document.createElement('div');
                 expandBtn.innerHTML = `<i class="fas fa-chevron-right text-gray-300 text-xs transition-transform" id="icon-${node.id}"></i>`;
                 expandBtn.className = 'p-2';
                 content.appendChild(expandBtn);
                 content.onclick = (e) => toggleNode(e, node.id);
            } else {
                 content.onclick = () => selectNodeForContext(node);
            }
        }
        
        li.appendChild(content);
        
        if (node.children && node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            // Added 'hidden' class by default for collapsed state
            childrenContainer.className = 'pl-4 border-l-2 border-gray-100 ml-4 mt-2 space-y-2 hidden'; 
            childrenContainer.id = `children-${node.id}`;
            renderTree(node.children, childrenContainer, mode);
            li.appendChild(childrenContainer);
        }
        
        ul.appendChild(li);
    });
    
    container.appendChild(ul);
}

function toggleNode(event, nodeId) {
    // If it's manage mode or we want expand/collapse
    event.stopPropagation();
    const childrenContainer = document.getElementById(`children-${nodeId}`);
    const icon = document.getElementById(`icon-${nodeId}`);
    
    if (childrenContainer) {
        childrenContainer.classList.toggle('hidden');
        if (icon) {
            if (childrenContainer.classList.contains('hidden')) {
                icon.classList.remove('rotate-90');
            } else {
                icon.classList.add('rotate-90');
            }
        }
    }
}

// --- Note Logic ---
function renderNoteList() {
    const container = document.getElementById('note-list-container');
    if (!container) return;
    container.innerHTML = '';
    
    mockNotes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition transform duration-100';
        item.onclick = () => loadNote(note.id);
        
        item.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-800 text-sm line-clamp-1">${note.title}</h3>
                <span class="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">${note.date}</span>
            </div>
            <p class="text-xs text-gray-500 line-clamp-2 mb-3 h-8">${note.content}</p>
            <div class="flex justify-between items-center border-t border-gray-50 pt-2">
                <span class="text-[10px] text-primary bg-blue-50 px-2 py-0.5 rounded font-medium">${note.tag}</span>
                <span class="text-[10px] text-gray-400"><i class="fas fa-tasks mr-1"></i>${note.questions ? note.questions.length : 0} 题</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderNoteTree(data, container) {
    // For now, reuse the main tree render but simplified or specialized if needed
    // Assuming simple list for now, or just reuse renderTree with 'select' mode but adapted styles
    // Since mobile screen is small, maybe just show root nodes or use renderTree logic
    renderTree(data, container, 'select'); 
    // Note: The HTML expects toggle behavior, currently we just render it. 
    // To make it functional, we'd need to handle visibility toggling which is done by toggleNoteView
}

function toggleNoteView(viewType) {
    const listContainer = document.getElementById('note-list-container');
    const treeContainer = document.getElementById('note-tree-container');
    const toggleList = document.getElementById('view-toggle-list');
    const toggleTree = document.getElementById('view-toggle-tree');
    
    if (viewType === 'list') {
        listContainer.classList.remove('hidden');
        treeContainer.classList.add('hidden');
        toggleList.classList.add('text-primary', 'bg-white', 'shadow-sm');
        toggleList.classList.remove('text-gray-400');
        toggleTree.classList.remove('text-primary', 'bg-white', 'shadow-sm');
        toggleTree.classList.add('text-gray-400');
    } else {
        listContainer.classList.add('hidden');
        treeContainer.classList.remove('hidden');
        toggleTree.classList.add('text-primary', 'bg-white', 'shadow-sm');
        toggleTree.classList.remove('text-gray-400');
        toggleList.classList.remove('text-primary', 'bg-white', 'shadow-sm');
        toggleList.classList.add('text-gray-400');
    }
}

function createNote() {
    currentEditingNoteId = null;
    document.getElementById('note-view-title').textContent = '新建笔记';
    document.getElementById('note-title-input').value = '';
    document.getElementById('note-content-input').value = '';
    document.getElementById('selected-note-node').textContent = '选择关联知识点...';
    document.getElementById('note-related-questions-container').innerHTML = '';
    
    document.getElementById('note-edit-view').classList.remove('hidden');
}

function loadNote(id) {
    const note = mockNotes.find(n => n.id === id);
    if (!note) return;
    
    currentEditingNoteId = note.id;
    document.getElementById('note-view-title').textContent = '编辑笔记';
    document.getElementById('note-title-input').value = note.title;
    document.getElementById('note-content-input').value = note.content;
    document.getElementById('selected-note-node').textContent = note.tag || '选择关联知识点...';
    
    // Render related questions
    const qContainer = document.getElementById('note-related-questions-container');
    qContainer.innerHTML = '';
    if (note.questions) {
        note.questions.forEach(q => {
            const qItem = document.createElement('div');
            qItem.className = 'p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 flex justify-between items-center';
            qItem.innerHTML = `<span>${q.title}</span> <span class="bg-white px-2 py-0.5 rounded text-[10px] border border-gray-200">${q.type}</span>`;
            qContainer.appendChild(qItem);
        });
    }

    document.getElementById('note-edit-view').classList.remove('hidden');
}

function closeNoteEdit() {
    document.getElementById('note-edit-view').classList.add('hidden');
}

function saveNote() {
    const title = document.getElementById('note-title-input').value;
    const content = document.getElementById('note-content-input').value;
    const tag = document.getElementById('selected-note-node').textContent;
    
    if (!title) {
        alert('请输入标题');
        return;
    }
    
    if (currentEditingNoteId) {
        const note = mockNotes.find(n => n.id === currentEditingNoteId);
        note.title = title;
        note.content = content;
        note.tag = tag !== '选择关联知识点...' ? tag : '未分类';
    } else {
        const newNote = {
            id: Date.now(),
            title: title,
            content: content,
            date: new Date().toISOString().split('T')[0],
            tag: tag !== '选择关联知识点...' ? tag : '未分类',
            questions: []
        };
        mockNotes.unshift(newNote);
    }
    
    DataStore.set('notes', mockNotes);
    renderNoteList();
    closeNoteEdit();
}

// --- Knowledge Tree Interaction ---
function openKnowledgeTree(context) {
    currentTreeContext = context;
    renderTree(knowledgeTreeData, document.getElementById('tree-root'), 'select');
    openModal('tree-modal');
}

function selectNodeForContext(node) {
    if (currentTreeContext === 'select-for-note') {
        document.getElementById('selected-note-node').textContent = node.title;
    } else if (currentTreeContext === 'select-for-question') {
        document.getElementById('selected-node-name').textContent = node.title;
    } else {
        // Default action (e.g. from Home): Start Practice
        alert(`开始 "${node.title}" 的专项练习`);
        // In a real app, navigate to quiz page or start session
    }
    
    // Close modal
    document.getElementById('tree-modal').classList.add('hidden');
    document.getElementById('tree-modal').classList.remove('flex');
}

function searchTree(keyword) {
    const container = document.getElementById('tree-root'); // Use tree-root for modal search
    if (!keyword) {
        renderTree(knowledgeTreeData, container, 'select');
        return;
    }
    // Simple mock filter - in reality, would filter the data structure
    renderTree(knowledgeTreeData, container, 'select'); 
}

function addRootNode() {
    const title = prompt("请输入根节点名称");
    if (title) {
        knowledgeTreeData.push({
            id: Date.now(),
            title: title,
            level: 1,
            children: []
        });
        DataStore.set('knowledgeTree', knowledgeTreeData);
        renderTree(knowledgeTreeData, document.getElementById('manage-tree-root'), 'manage');
    }
}

function addChildNode(parentId) {
    // Recursive search to find parent
    function findNode(nodes, id) {
        for (let node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }
    
    const parent = findNode(knowledgeTreeData, parentId);
    if (parent) {
        const title = prompt("请输入子节点名称");
        if (title) {
            if (!parent.children) parent.children = [];
            parent.children.push({
                id: Date.now(),
                title: title,
                level: parent.level + 1,
                children: []
            });
            DataStore.set('knowledgeTree', knowledgeTreeData);
            renderTree(knowledgeTreeData, document.getElementById('manage-tree-root'), 'manage');
        }
    }
}

function deleteNode(id) {
    if(confirm('确定删除该节点及其子节点吗？')) {
        // Simple delete logic - filter out
        function filterNodes(nodes, id) {
            return nodes.filter(n => {
                if (n.id === id) return false;
                if (n.children) {
                    n.children = filterNodes(n.children, id);
                }
                return true;
            });
        }
        knowledgeTreeData = filterNodes(knowledgeTreeData, id);
        DataStore.set('knowledgeTree', knowledgeTreeData);
        renderTree(knowledgeTreeData, document.getElementById('manage-tree-root'), 'manage');
    }
}

function switchAddTab(tab) {
    if (tab === 'single') {
        document.getElementById('add-single-form').classList.remove('hidden');
        document.getElementById('add-batch-form').classList.add('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.add('bg-primary', 'text-white');
        document.querySelectorAll('.tab-btn')[0].classList.remove('text-gray-500', 'hover:bg-gray-50');
        document.querySelectorAll('.tab-btn')[1].classList.remove('bg-primary', 'text-white');
        document.querySelectorAll('.tab-btn')[1].classList.add('text-gray-500', 'hover:bg-gray-50');
    } else {
        document.getElementById('add-single-form').classList.add('hidden');
        document.getElementById('add-batch-form').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[1].classList.add('bg-primary', 'text-white');
        document.querySelectorAll('.tab-btn')[1].classList.remove('text-gray-500', 'hover:bg-gray-50');
        document.querySelectorAll('.tab-btn')[0].classList.remove('bg-primary', 'text-white');
        document.querySelectorAll('.tab-btn')[0].classList.add('text-gray-500', 'hover:bg-gray-50');
    }
}

function importTreeJSON() {
    alert("点击右上角下载图标可导出。导入功能暂未开放文件选择器。");
}

function exportTreeJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(knowledgeTreeData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "knowledge_tree.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Modal Logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // For Tailwind, we remove 'hidden' and ensure it's 'flex'
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Load settings if opening settings modal
    if (modalId === 'settings-modal') {
        loadSettings();
    }
    
    // Animate the inner content
    const content = modal.firstElementChild;
    if (content) {
        content.classList.remove('translate-y-full');
        content.classList.add('translate-y-0');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const content = modal.firstElementChild;
    if (content) {
        content.classList.remove('translate-y-0');
        content.classList.add('translate-y-full');
    }
    
    // Wait for animation
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

// AI Settings Logic (Mobile)
function saveAISettings() {
    const provider = document.getElementById('mobile-ai-provider').value;
    const apiKey = document.getElementById('mobile-ai-key').value;
    
    if (provider) DataStore.set('ai_provider', provider);
    if (apiKey) DataStore.set('ai_api_key', apiKey);
}

function loadSettings() {
    const provider = DataStore.get('ai_provider', 'openai');
    const apiKey = DataStore.get('ai_api_key', '');
    
    const mobileProvider = document.getElementById('mobile-ai-provider');
    const mobileKey = document.getElementById('mobile-ai-key');
    
    if (mobileProvider) mobileProvider.value = provider;
    if (mobileKey) mobileKey.value = apiKey;
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// New Feature: AI Connection Test (Mobile)
function testAIConnection(platform) {
    // Only handles 'mobile' here, but keeping sig for consistency
    const btn = document.getElementById('mobile-ai-test-btn');
    const status = document.getElementById('mobile-ai-status');
    const key = document.getElementById('mobile-ai-key').value;

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
            status.innerHTML = '<span class="text-red-500"><i class="fas fa-times-circle"></i> 连接失败</span>';
        } else {
            status.innerHTML = '<span class="text-green-500"><i class="fas fa-check-circle"></i> 连接成功</span>';
            // Save if successful
            saveAISettings();
        }
    }, 1500);
}

// Navigation Helper
function navigateTo(page) {
    window.location.href = page;
}

function startRandomQuiz() {
    navigateTo('quiz.html');
}

// --- Additional Mobile Logic (Missing Functions) ---

function closeNoteQuestions() {
    document.getElementById('note-questions-view').classList.add('translate-x-full');
    setTimeout(() => {
        document.getElementById('note-questions-view').classList.add('hidden');
    }, 300);
}

function addQuestionToNoteContext() {
    alert('正在分析笔记内容生成题目...');
}

function generateQuestionsFromNote() {
    document.getElementById('gen-result-overlay').classList.remove('hidden');
    document.getElementById('gen-result-overlay').classList.add('flex');
    const container = document.getElementById('gen-result-container');
    container.innerHTML = '<div class="flex items-center justify-center h-40 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> AI 正在生成...</div>';
    
    setTimeout(() => {
        container.innerHTML = `
            <div class="space-y-3">
                <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div class="font-bold text-sm text-gray-800 mb-1">Q1: Vue3 响应式原理使用了什么 API？</div>
                    <div class="text-xs text-gray-600">A. Object.defineProperty <br> B. Proxy (正确)</div>
                </div>
                 <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div class="font-bold text-sm text-gray-800 mb-1">Q2: Proxy 相比 defineProperty 的优势？</div>
                    <div class="text-xs text-gray-600">A. 兼容性更好 <br> B. 可监听数组变化 (正确)</div>
                </div>
            </div>
        `;
    }, 1500);
}

function saveGeneratedQuestions() {
    alert('题目已保存到题库！');
    closeModal('gen-result-overlay');
}

function saveQuestion() {
    alert('题目保存成功！');
    // Logic to save question to tree node would go here
}

function toggleOptionExplain(icon) {
    const input = icon.parentElement.nextElementSibling;
    input.classList.toggle('hidden');
}

function addOptionInput() {
    const container = document.getElementById('options-container');
    const div = document.createElement('div');
    div.className = 'option-wrapper';
    div.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            <input type="radio" name="correct-opt" title="设为正确答案" class="text-primary focus:ring-primary">
            <input type="text" placeholder="新选项" class="flex-1 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary">
            <i class="fas fa-comment-dots text-gray-400 cursor-pointer hover:text-primary p-1" onclick="toggleOptionExplain(this)" title="添加解析"></i>
        </div>
        <input type="text" class="option-explain hidden w-full mt-1 p-2 border border-dashed border-gray-300 rounded text-xs bg-gray-50 focus:outline-none" placeholder="选项解析...">
    `;
    container.appendChild(div);
}

function processBatchImport() {
    const json = document.getElementById('batch-input').value;
    try {
        const data = JSON.parse(json);
        alert(`成功解析 ${data.length} 道题目，已导入！`);
    } catch (e) {
        alert('JSON 格式错误，请检查。');
    }
}

function continueLastQuiz() {
    alert('继续上次的练习...');
}

function startReview() {
    alert('开始今日复习计划...');
}

// --- Quiz Logic ---
let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {}; // { questionId: answer }
let quizMode = 'immediate'; // 'immediate' or 'submit_all'

const mockQuizData = [
    { 
        id: 1, 
        title: "HTML5 中哪个标签用于定义导航链接？", 
        type: "单选题", 
        options: ["A. <nav>", "B. <header>", "C. <footer>", "D. <section>"], 
        correct: "A",
        explain: "<nav> 标签定义导航链接的部分。"
    },
    { 
        id: 2, 
        title: "CSS3 中 flex-direction 的默认值是？", 
        type: "单选题", 
        options: ["A. column", "B. row", "C. row-reverse", "D. column-reverse"], 
        correct: "B",
        explain: "默认值是 row（水平方向）。"
    },
    { 
        id: 3, 
        title: "ES6 中用于声明常量的关键字是？", 
        type: "单选题", 
        options: ["A. var", "B. let", "C. const", "D. final"], 
        correct: "C",
        explain: "const 用于声明常量。"
    }
];

function initQuizPage() {
    // Check if we are on quiz page
    const container = document.getElementById('quiz-container');
    if (!container) return;

    currentQuizQuestions = mockQuizData; // In real app, load based on params
    currentQuestionIndex = 0;
    userAnswers = {};
    
    renderQuizQuestion();
    updateQuizProgress();
}

function renderQuizQuestion() {
    const container = document.getElementById('quiz-container');
    const question = currentQuizQuestions[currentQuestionIndex];
    
    if (!question) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-xl p-5 shadow-sm mb-4">
            <div class="flex justify-between items-start mb-4">
                <span class="bg-blue-100 text-primary text-xs px-2 py-0.5 rounded font-medium">${question.type}</span>
            </div>
            <h3 class="text-base font-bold text-gray-800 mb-6 leading-relaxed">${question.title}</h3>
            
            <div class="space-y-3">
                ${question.options.map((opt, idx) => {
                    const optKey = opt.charAt(0);
                    const isSelected = userAnswers[question.id] === optKey;
                    let optionClass = "p-3 rounded-lg border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition";
                    let iconClass = "w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-400";
                    
                    if (isSelected) {
                        optionClass = "p-3 rounded-lg border border-blue-200 bg-blue-50 flex items-center gap-3 cursor-pointer transition";
                        iconClass = "w-5 h-5 rounded-full bg-primary border-primary flex items-center justify-center text-xs text-white";
                    }

                    return `
                    <div class="${optionClass}" onclick="selectOption(${question.id}, '${optKey}')">
                        <div class="${iconClass}">
                            ${isSelected ? '<i class="fas fa-check"></i>' : String.fromCharCode(65 + idx)}
                        </div>
                        <div class="text-sm text-gray-600">${opt}</div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Update buttons
    const prevBtn = document.getElementById('prev-btn');
    const actionBtn = document.getElementById('action-btn');
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (actionBtn) {
        const isLast = currentQuestionIndex === currentQuizQuestions.length - 1;
        actionBtn.textContent = isLast ? '提交试卷' : '下一题';
    }
}

function selectOption(qId, option) {
    userAnswers[qId] = option;
    renderQuizQuestion();
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuizQuestion();
        updateQuizProgress();
    }
}

function handleAction() {
    const isLast = currentQuestionIndex === currentQuizQuestions.length - 1;
    if (isLast) {
        submitQuiz();
    } else {
        currentQuestionIndex++;
        renderQuizQuestion();
        updateQuizProgress();
    }
}

function updateQuizProgress() {
    const el = document.getElementById('quiz-progress');
    if (el) el.textContent = `${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;
}

function submitQuiz() {
    let correctCount = 0;
    
    currentQuizQuestions.forEach(q => {
        if (userAnswers[q.id] === q.correct) {
            correctCount++;
        }
    });
    
    const score = Math.round((correctCount / currentQuizQuestions.length) * 100);
    
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('quiz-action-bar').classList.add('hidden');
    document.getElementById('quiz-overview').classList.remove('hidden');
    
    document.getElementById('score-display').textContent = score;
    document.getElementById('total-count').textContent = currentQuizQuestions.length;
    document.getElementById('correct-count').textContent = correctCount;
    
    // Render Grid
    const grid = document.getElementById('overview-grid');
    grid.innerHTML = currentQuizQuestions.map((q, idx) => {
        const isCorrect = userAnswers[q.id] === q.correct;
        const bgClass = isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
        return `<div class="w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center font-bold text-sm">${idx + 1}</div>`;
    }).join('');
}

function restartQuiz() {
    userAnswers = {};
    currentQuestionIndex = 0;
    document.getElementById('quiz-overview').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('quiz-action-bar').classList.remove('hidden');
    renderQuizQuestion();
    updateQuizProgress();
}

function changeQuizMode(mode) {
    quizMode = mode;
    // Reload or adjust logic if needed
    alert('模式已切换为: ' + (mode === 'immediate' ? '立即判题' : '整组提交'));
}

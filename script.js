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
                children: [
                    { id: 111, title: "语义化标签", level: 3 },
                    { id: 112, title: "多媒体标签", level: 3 },
                    { id: 113, title: "Web Storage", level: 3 }
                ]
            },
            {
                id: 12,
                title: "CSS3",
                level: 2,
                children: [
                    { id: 121, title: "Flex布局", level: 3 },
                    { id: 122, title: "Grid布局", level: 3 },
                    { id: 123, title: "动画与过渡", level: 3 }
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
                children: [
                    { id: 211, title: "Promise/Async", level: 3 },
                    { id: 212, title: "Class类", level: 3 },
                    { id: 213, title: "模块化", level: 3 }
                ]
            },
            {
                id: 22,
                title: "原型与继承",
                level: 2,
                children: [
                    { id: 221, title: "原型链", level: 3 },
                    { id: 222, title: "继承方式", level: 3 }
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
                children: [
                    { id: 311, title: "响应式原理", level: 3 },
                    { id: 312, title: "组件通信", level: 3 },
                    { id: 313, title: "生命周期", level: 3 }
                ]
            },
            {
                id: 32,
                title: "Vue Router",
                level: 2,
                children: [
                    { id: 321, title: "路由守卫", level: 3 },
                    { id: 322, title: "动态路由", level: 3 }
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

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Auto-init charts if on Center page
    if (path.includes('center.html') || document.getElementById('quizCurveChart')) {
        initCharts();
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


// Modal Logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // For Tailwind, we remove 'hidden' and ensure it's 'flex'
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Animate the inner content
    // We assume the inner content is the first child (the white card)
    const content = modal.firstElementChild;
    if (content) {
        // Reset transform to trigger slide up if using transform classes
        // In Tailwind config above, we used 'animate-slide-up' class which runs on mount
        // But if we re-open, we might need to re-trigger it. 
        // Simplest way for prototype: ensure translate-y is handled
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

// Navigation Logic
function navigateTo(page) {
    window.location.href = page;
}

// --- Note Logic ---
function toggleNoteView(mode) {
    const treeContainer = document.getElementById('note-tree-container');
    const listContainer = document.getElementById('note-list-container');
    const toggleTree = document.getElementById('view-toggle-tree');
    const toggleList = document.getElementById('view-toggle-list');

    if (mode === 'tree') {
        treeContainer.classList.remove('hidden');
        listContainer.classList.add('hidden');
        
        toggleTree.classList.add('text-primary', 'bg-white', 'shadow-sm');
        toggleTree.classList.remove('text-gray-400', 'hover:text-primary');
        
        toggleList.classList.remove('text-primary', 'bg-white', 'shadow-sm');
        toggleList.classList.add('text-gray-400', 'hover:text-primary');
    } else {
        treeContainer.classList.add('hidden');
        listContainer.classList.remove('hidden');
        
        toggleList.classList.add('text-primary', 'bg-white', 'shadow-sm');
        toggleList.classList.remove('text-gray-400', 'hover:text-primary');
        
        toggleTree.classList.remove('text-primary', 'bg-white', 'shadow-sm');
        toggleTree.classList.add('text-gray-400', 'hover:text-primary');
    }
}

function renderNoteTree(data, container) {
    if (!data || !container) return;
    container.innerHTML = '';
    
    data.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'ml-3 py-1';
        
        // Find notes for this node
        const nodeNotes = mockNotes.filter(n => n.tag === node.title); // Using tag match for prototype
        const hasNotes = nodeNotes.length > 0;
        const hasChildren = node.children && node.children.length > 0;
        
        // Determine icon
        let iconClass = 'fas fa-circle';
        let iconStyle = 'font-size: 6px;';
        let iconColor = 'text-gray-300';
        
        if (hasChildren || hasNotes) {
            iconClass = 'fas fa-caret-right';
            iconStyle = '';
            iconColor = 'text-gray-400';
        }

        const toggleIcon = `<i class="${iconClass} ${iconColor} mr-2 w-4 text-center transition-transform duration-200 node-icon" style="${iconStyle}"></i>`;
        
        nodeEl.innerHTML = `
            <div class="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 transition node-content" onclick="toggleNode(this)">
                ${toggleIcon}
                <span class="text-sm text-gray-700 font-medium">${node.title}</span>
                ${hasNotes ? `<span class="ml-2 text-xs text-primary bg-blue-50 px-1.5 rounded">${nodeNotes.length}</span>` : ''}
            </div>
            <div class="pl-4 border-l border-gray-100 hidden children-container">
                <!-- Notes attached directly to this node -->
                ${nodeNotes.map(note => `
                    <div class="flex items-center justify-between p-2 mb-1 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition ml-3 border border-yellow-100" onclick="event.stopPropagation(); openNoteQuestions(${note.id})">
                        <div class="flex items-center overflow-hidden">
                            <i class="fas fa-file-alt text-yellow-500 mr-2 text-xs"></i>
                            <span class="text-sm text-gray-700 truncate">${note.title}</span>
                        </div>
                        <i class="fas fa-chevron-right text-xs text-gray-300"></i>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(nodeEl);
        
        // Render children nodes recursively
        if (hasChildren) {
            const childrenContainer = nodeEl.querySelector('.children-container');
            renderNoteTree(node.children, childrenContainer);
        }
    });
}

function openNoteQuestions(noteId) {
    const note = mockNotes.find(n => n.id === noteId);
    if (!note) return;
    
    document.getElementById('note-questions-view').classList.remove('translate-x-full');
    const container = document.getElementById('note-questions-list');
    
    // Mock Questions for Note
    const questions = [
        { id: 101, title: "Vue3 的响应式基础 API 是什么？", type: "单选题" },
        { id: 102, title: "ref 和 reactive 的区别？", type: "简答题" }
    ];
    
    container.innerHTML = `
        <div class="mb-4">
            <h2 class="text-base font-bold text-gray-800">${note.title}</h2>
            <p class="text-xs text-gray-500 mt-1">关联习题: ${questions.length}</p>
        </div>
    `;
    
    questions.forEach(q => {
        container.innerHTML += `
            <div class="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100">
                <div class="flex justify-between items-start mb-2">
                    <span class="bg-blue-50 text-primary text-[10px] px-1.5 py-0.5 rounded">${q.type}</span>
                    <div class="flex gap-3 text-gray-400">
                        <i class="fas fa-edit cursor-pointer hover:text-blue-500"></i>
                        <i class="fas fa-trash cursor-pointer hover:text-red-500"></i>
                    </div>
                </div>
                <p class="text-sm text-gray-700 font-medium">${q.title}</p>
            </div>
        `;
    });
}

function closeNoteQuestions() {
    document.getElementById('note-questions-view').classList.add('translate-x-full');
}

function renderNoteRelatedQuestions(noteId) {
    const container = document.getElementById('note-related-questions-container');
    if (!container) return;
    
    const note = mockNotes.find(n => n.id === noteId);
    if (!note || !note.questions || note.questions.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 text-xs py-4">暂无关联题目</div>';
        return;
    }
    
    container.innerHTML = '';
    note.questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-start group';
        item.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="bg-blue-100 text-primary text-[10px] px-1.5 rounded">${q.type || '未知'}</span>
                    <span class="text-sm text-gray-800 font-medium line-clamp-2">${q.title}</span>
                </div>
                ${q.options ? `<div class="text-xs text-gray-500 pl-1 mt-1">${q.options.join(' | ')}</div>` : ''}
            </div>
            <div class="flex gap-2 ml-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button class="text-gray-400 hover:text-primary p-1" onclick="editNoteQuestion(${noteId}, ${index})" title="编辑"><i class="fas fa-edit"></i></button>
                <button class="text-gray-400 hover:text-red-500 p-1" onclick="deleteNoteQuestion(${noteId}, ${index})" title="删除"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(item);
    });
}

function saveNote(silent = false) {
    const title = document.getElementById('note-title-input').value;
    const content = document.getElementById('note-content-input').value;
    const tag = document.getElementById('selected-note-node').textContent;
    const finalTag = tag === '选择关联知识点...' ? '未分类' : tag;
    
    if (!title && !content && !silent) {
        alert('笔记内容不能为空');
        return false;
    }
    
    if (!currentEditingNoteId) {
        // Create new
        const newNote = {
            id: Date.now(),
            title: title || "未命名笔记",
            date: new Date().toISOString().split('T')[0],
            count: 0,
            tag: finalTag,
            content: content,
            questions: []
        };
        mockNotes.unshift(newNote);
        currentEditingNoteId = newNote.id;
    } else {
        // Update existing
        const note = mockNotes.find(n => n.id === currentEditingNoteId);
        if (note) {
            note.title = title || "未命名笔记";
            note.content = content;
            note.tag = finalTag;
        }
    }
    
    DataStore.set('notes', mockNotes);
    renderNoteList();
    renderNoteRelatedQuestions(currentEditingNoteId);
    
    if (!silent) {
        // Simple toast simulation
        const btn = document.querySelector('#note-edit-view header span[onclick="saveNote()"]');
        const originalText = btn.textContent;
        btn.textContent = '已保存';
        btn.classList.add('text-green-500');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('text-green-500');
        }, 1500);
    }
    return true;
}

function addQuestionToNoteContext() {
    // Ensure note is saved first so we have an ID
    if (!currentEditingNoteId) {
        if (!saveNote(true)) return; 
    } else {
        saveNote(true); // Auto-save current state just in case
    }
    
    // Simple prompt for prototype
    const title = prompt("请输入题目内容:");
    if (!title) return;
    
    const type = prompt("请输入题目类型 (单选题/多选题/简答题):", "单选题");
    
    const note = mockNotes.find(n => n.id === currentEditingNoteId);
    if (note) {
        if (!note.questions) note.questions = [];
        note.questions.push({
            id: Date.now(),
            title: title,
            type: type || "简答题",
            options: ["A. 选项一", "B. 选项二"] // Mock options
        });
        note.count = note.questions.length; // Update count
        DataStore.set('notes', mockNotes);
        renderNoteRelatedQuestions(currentEditingNoteId);
        renderNoteList(); // Refresh list count
    }
}

function deleteNoteQuestion(noteId, index) {
    if (!confirm("确定要删除这道题目吗？")) return;
    
    const note = mockNotes.find(n => n.id === noteId);
    if (note && note.questions) {
        note.questions.splice(index, 1);
        note.count = note.questions.length;
        DataStore.set('notes', mockNotes);
        renderNoteRelatedQuestions(noteId);
        renderNoteList();
    }
}

function editNoteQuestion(noteId, index) {
    const note = mockNotes.find(n => n.id === noteId);
    if (!note || !note.questions[index]) return;
    
    const q = note.questions[index];
    const newTitle = prompt("修改题目内容:", q.title);
    if (newTitle) {
        q.title = newTitle;
        DataStore.set('notes', mockNotes);
        renderNoteRelatedQuestions(noteId);
    }
}

function createNote() {
    if (window.location.pathname.includes('note.html')) {
        currentEditingNoteId = null; // Reset
        document.getElementById('note-edit-view').classList.remove('hidden');
        document.getElementById('note-view-title').textContent = '新建笔记';
        document.getElementById('note-title-input').value = '';
        document.getElementById('selected-note-node').textContent = '选择关联知识点...';
        document.getElementById('note-content-input').value = '';
        document.getElementById('note-related-questions-container').innerHTML = '<div class="text-center text-gray-400 text-xs py-4">保存笔记后可添加题目</div>';
    } else {
        window.location.href = 'note.html?action=create';
    }
}

function renderNoteList() {
    const container = document.getElementById('note-list-container');
    if (!container) return;
    container.innerHTML = '';
    
    mockNotes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'bg-white rounded-xl p-4 shadow-sm flex justify-between items-center cursor-pointer transition active:bg-gray-50';
        item.onclick = () => {
             // Switch to edit view
            currentEditingNoteId = note.id;
            document.getElementById('note-edit-view').classList.remove('hidden');
            
            document.getElementById('note-view-title').textContent = '编辑笔记';
            document.getElementById('note-title-input').value = note.title;
            document.getElementById('selected-note-node').textContent = note.tag;
            document.getElementById('note-content-input').value = note.content || "这是模拟的笔记内容...\n\n点击右上角生成题目体验 AI 功能。";
            
            renderNoteRelatedQuestions(note.id);
        };
        
        item.innerHTML = `
            <div>
                <h4 class="text-base font-medium text-gray-800 mb-1">${note.title}</h4>
                <p class="text-xs text-gray-400"><span class="inline-block bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 mr-1">${note.tag}</span> ${note.date}</p>
            </div>
            <div class="text-right">
                <span class="text-xl font-bold text-primary block">${note.count || (note.questions ? note.questions.length : 0)}</span>
                <div class="text-[10px] text-gray-400">已生成题目</div>
            </div>
        `;
        container.appendChild(item);
    });
}

function closeNoteEdit() {
    document.getElementById('note-edit-view').classList.add('hidden');
}

let lastGeneratedQuestions = [];

function generateQuestionsFromNote() {
    const content = document.getElementById('note-content-input').value;
    if (!content.trim()) {
        alert('请先输入笔记内容！');
        return;
    }
    
    openModal('gen-result-overlay');
    const container = document.getElementById('gen-result-container');
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-48 text-gray-400">
            <i class="fas fa-spinner text-3xl mb-4 text-primary animate-spin"></i>
            <p>正在分析笔记内容...</p>
            <p class="text-xs mt-2">AI 正在提取知识点并生成题目</p>
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
        // Store globally for saving later
        lastGeneratedQuestions = [
            { id: Date.now(), title: "根据笔记内容，Vue3 中使用 Proxy 替代了 Vue2 中的什么机制？", type: "单选题", options: ["A. Object.defineProperty", "B. Observer", "C. Watcher"] },
            { id: Date.now() + 1, title: "Ref 函数主要用于处理什么类型的数据？", type: "单选题", options: ["A. 基本数据类型", "B. 引用数据类型", "C. 所有类型"] }
        ];
        
        lastGeneratedQuestions.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'bg-gray-50 border border-gray-100 rounded-lg p-3 mb-3';
            card.innerHTML = `
                <div class="font-bold mb-2 text-sm text-gray-800">${index + 1}. ${item.title}</div>
                <div class="text-xs text-gray-600 pl-2 space-y-1">
                    ${item.options.map(opt => `<div>${opt}</div>`).join('')}
                </div>
            `;
            container.appendChild(card);
        });
        
        const summary = document.createElement('div');
        summary.className = 'text-center text-gray-500 text-xs mt-4';
        summary.innerHTML = `<i class="fas fa-check-circle text-green-500 mr-1"></i> 成功生成 ${lastGeneratedQuestions.length} 道题目`;
        container.appendChild(summary);
        
    }, 2000);
}

function saveGeneratedQuestions() {
    if (!lastGeneratedQuestions || lastGeneratedQuestions.length === 0) return;
    
    // If creating new note, save it first
    if (!currentEditingNoteId) {
        const title = document.getElementById('note-title-input').value || "未命名笔记";
        const content = document.getElementById('note-content-input').value;
        const tag = document.getElementById('selected-note-node').textContent;
        const finalTag = tag === '选择关联知识点...' ? '未分类' : tag;
        
        const newNote = {
            id: Date.now(),
            title: title,
            date: new Date().toISOString().split('T')[0],
            count: 0,
            tag: finalTag,
            content: content,
            questions: []
        };
        mockNotes.unshift(newNote);
        currentEditingNoteId = newNote.id;
    }
    
    const note = mockNotes.find(n => n.id === currentEditingNoteId);
    if (note) {
        if (!note.questions) note.questions = [];
        note.questions.push(...lastGeneratedQuestions);
        note.count = note.questions.length;
        DataStore.set('notes', mockNotes);
        
        renderNoteRelatedQuestions(note.id);
        renderNoteList();
        
        alert(`已保存 ${lastGeneratedQuestions.length} 道题目到笔记！`);
        closeModal('gen-result-overlay');
    }
}

// --- Tree & Question Logic ---
function openKnowledgeTree(mode = 'normal') {
    const container = document.getElementById(mode === 'manage' ? 'manage-tree-root' : 'tree-root');
    const searchInput = document.getElementById('tree-search-input');
    if (searchInput) searchInput.value = '';
    
    renderTree(knowledgeTreeData, container, mode);
    
    if (mode === 'normal' || mode === 'select-for-question' || mode === 'select-for-note') {
        openModal('tree-modal');
    }
}

function searchTree(keyword) {
    const container = document.getElementById('tree-root');
    if (!keyword) {
        renderTree(knowledgeTreeData, container, 'select'); 
        return;
    }
    
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
         
         const clickHandler = `selectNodeForQuestion(${node.id}, '${node.title}', this)`;
         
         nodeEl.innerHTML = `
            <div class="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50" onclick="${clickHandler}">
                <i class="fas fa-search mr-2 text-gray-300 text-xs"></i>
                <span class="text-sm text-gray-700">${node.title}</span>
            </div>
        `;
        container.appendChild(nodeEl);
    });
}

function renderTree(data, container, mode = 'normal') {
    if (!data || !container) return;
    container.innerHTML = '';
    
    data.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'ml-3 py-1';
        
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
        let clickHandler = `toggleNode(this)`;

        if (mode === 'normal') {
            if (node.level === 2) {
                actionBtn = `<button class="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded shadow-sm active:bg-blue-600" onclick="event.stopPropagation(); startQuiz('level2', ${node.id}, '${node.title}')">做题</button>`;
            } else if (node.level === 3) {
                actionBtn = `<button class="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded shadow-sm active:bg-blue-600" onclick="event.stopPropagation(); startQuiz('level3', ${node.id}, '${node.title}')">做题</button>`;
            }
        } else if (mode === 'manage') {
            actionBtn = `
                <div class="ml-auto flex gap-2">
                    <button class="w-6 h-6 rounded flex items-center justify-center bg-green-500 text-white text-xs active:scale-95 transition" title="添加子节点" onclick="event.stopPropagation(); addNode(${node.id})"><i class="fas fa-folder-plus"></i></button>
                    <button class="w-6 h-6 rounded flex items-center justify-center bg-blue-500 text-white text-xs active:scale-95 transition" title="添加题目" onclick="event.stopPropagation(); addQuestionToNode(${node.id}, '${node.title}')"><i class="fas fa-file-circle-plus"></i></button>
                    <button class="w-6 h-6 rounded flex items-center justify-center bg-orange-400 text-white text-xs active:scale-95 transition" title="编辑节点" onclick="event.stopPropagation(); editNode(${node.id})"><i class="fas fa-edit"></i></button>
                </div>`;
        } else if (mode === 'select' || mode === 'select-for-question') {
             clickHandler = `selectNodeForQuestion(${node.id}, '${node.title}', this)`;
        } else if (mode === 'select-for-note') {
             clickHandler = `selectNodeForNote(${node.id}, '${node.title}', this)`;
        }

        nodeEl.innerHTML = `
            <div class="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 transition node-content" onclick="${clickHandler}">
                ${toggleIcon}
                <span class="text-sm text-gray-700 font-medium">${node.title}</span>
                ${actionBtn}
            </div>
            ${hasChildren ? '<div class="pl-4 border-l border-gray-100 hidden children-container"></div>' : ''}
        `;
        
        container.appendChild(nodeEl);
        
        if (hasChildren) {
            const childrenContainer = nodeEl.querySelector('.children-container');
            renderTree(node.children, childrenContainer, mode);
        }
    });
}

function selectNodeForNote(id, title, element) {
    document.querySelectorAll('.node-content').forEach(el => el.classList.remove('bg-blue-50', 'text-primary'));
    element.classList.add('bg-blue-50', 'text-primary');
    document.getElementById('selected-note-node').textContent = title;
    setTimeout(() => { closeModal('tree-modal'); }, 300);
}

function selectNodeForQuestion(id, title, element) {
    document.querySelectorAll('.node-content').forEach(el => el.classList.remove('bg-blue-50', 'text-primary'));
    element.classList.add('bg-blue-50', 'text-primary');
    document.getElementById('selected-node-name').textContent = title;
    document.getElementById('selected-node-name').dataset.id = id;
    setTimeout(() => { closeModal('tree-modal'); }, 300);
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

function startRandomQuiz() {
    window.location.href = 'quiz.html?mode=random';
}

function startQuiz(level, id, title) {
    window.location.href = `quiz.html?mode=tree&id=${id}&title=${encodeURIComponent(title)}`;
}

function startReview() {
    window.location.href = 'quiz.html?mode=review';
}

function switchAddTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.add-tab-content');
    
    // Reset classes
    tabs.forEach(t => {
        t.classList.remove('bg-primary', 'text-white', 'font-medium');
        t.classList.add('text-gray-500', 'hover:bg-gray-50');
    });
    
    contents.forEach(c => c.classList.add('hidden'));
    
    // Activate selected
    if (tab === 'single') {
        tabs[0].classList.remove('text-gray-500', 'hover:bg-gray-50');
        tabs[0].classList.add('bg-primary', 'text-white', 'font-medium');
        document.getElementById('add-single-form').classList.remove('hidden');
    } else {
        tabs[1].classList.remove('text-gray-500', 'hover:bg-gray-50');
        tabs[1].classList.add('bg-primary', 'text-white', 'font-medium');
        document.getElementById('add-batch-form').classList.remove('hidden');
    }
}

function toggleOptionExplain(icon) {
    const wrapper = icon.closest('.option-wrapper');
    const explainInput = wrapper.querySelector('.option-explain');
    
    if (explainInput.classList.contains('hidden')) {
        explainInput.classList.remove('hidden');
        explainInput.focus();
    } else {
        explainInput.classList.add('hidden');
    }
}

function addOptionInput() {
    const container = document.getElementById('options-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'option-wrapper';
    wrapper.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            <input type="radio" name="correct-opt" title="设为正确答案" class="text-primary focus:ring-primary">
            <input type="text" placeholder="选项" class="flex-1 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary">
            <i class="fas fa-comment-dots text-gray-400 cursor-pointer hover:text-primary p-1" onclick="toggleOptionExplain(this)" title="添加解析"></i>
        </div>
        <input type="text" class="option-explain hidden w-full mt-1 p-2 border border-dashed border-gray-300 rounded text-xs bg-gray-50 focus:outline-none" placeholder="选项解析...">
    `;
    container.appendChild(wrapper);
}

function processBatchImport() {
    const jsonStr = document.getElementById('batch-input').value;
    try {
        const data = JSON.parse(jsonStr);
        if (Array.isArray(data)) {
            alert(`成功解析 ${data.length} 道题目！\n(原型演示：已导入数据库)`);
            window.location.href = 'index.html'; // Back to home
        } else {
            alert('JSON 格式错误：必须是数组格式');
        }
    } catch (e) {
        alert('JSON 解析失败，请检查格式');
    }
}

function saveQuestion() {
    const nodeName = document.getElementById('selected-node-name').textContent;
    if (nodeName.includes('...')) {
        alert('请先选择知识点！');
        return;
    }
    alert(`题目已保存到 "${nodeName}" 节点下！`);
    window.location.href = 'index.html'; // Back to home
}

function importTreeJSON() {
    const json = prompt("请粘贴树结构 JSON:");
    if (json) {
        try {
            const newData = JSON.parse(json);
            knowledgeTreeData.push(newData);
            DataStore.set('knowledgeTree', knowledgeTreeData);
            renderTree(knowledgeTreeData, document.getElementById('manage-tree-root'), 'manage');
            alert('导入成功！');
        } catch (e) {
            alert('JSON 格式错误');
        }
    }
}

function exportTreeJSON() {
    const json = JSON.stringify(knowledgeTreeData, null, 2);
    alert("JSON 已生成 (查看控制台可复制)");
    console.log(json);
}

function addRootNode() {
    const name = prompt("输入根节点名称:");
    if (name) {
        knowledgeTreeData.push({ id: Date.now(), title: name, level: 1, children: [] });
        DataStore.set('knowledgeTree', knowledgeTreeData);
        renderTree(knowledgeTreeData, document.getElementById('manage-tree-root'), 'manage');
    }
}

function addNode(parentId) {
    const name = prompt("输入子节点名称:");
    if (name) {
        alert(`在节点 ID ${parentId} 下添加 "${name}" (原型演示)`);
        // Actual logic: traverse tree, find parent, push to children, save to DataStore
    }
}

function editNode(id) {
    const newName = prompt("修改节点名称:", "新名称");
    if (newName) {
        alert(`节点 ID ${id} 名称修改为 "${newName}" (原型演示)`);
    }
}

function addQuestionToNode(id, title) {
     const addSection = document.getElementById('add-question-section');
     const treeSection = document.getElementById('tree-manage-section');
     if(addSection && treeSection) {
         treeSection.classList.add('hidden');
         addSection.classList.remove('hidden');
         
         const nameEl = document.getElementById('selected-node-name');
         nameEl.textContent = title;
         nameEl.dataset.id = id;
     }
}

function openWrongBook() {
    alert('打开错题本...');
}

// Chart Initialization
let chartsInitialized = false;
function initCharts() {
    if (chartsInitialized) return;
    
    const canvas1 = document.getElementById('quizCurveChart');
    if (canvas1) {
        const ctx1 = canvas1.getContext('2d');
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '做题数',
                    data: [12, 19, 3, 5, 2, 3, 15],
                    borderColor: '#1890ff',
                    tension: 0.4
                }, {
                    label: '复习数',
                    data: [5, 10, 5, 8, 6, 4, 10],
                    borderColor: '#52c41a',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    const canvas2 = document.getElementById('newKnowledgeChart');
    if (canvas2) {
        const ctx2 = canvas2.getContext('2d');
        new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['1月', '2月', '3月', '4月'],
                datasets: [{
                    label: '新增知识点',
                    data: [20, 35, 40, 15],
                    backgroundColor: '#722ed1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
    
    chartsInitialized = true;
}

// Global click for modal close
window.onclick = function(event) {
    const modal = document.getElementById('tree-modal');
    if (event.target == modal) {
        closeModal('tree-modal');
    }
}

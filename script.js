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
            const countInfo = (node.total !== undefined) 
                ? `<span class="text-[10px] text-gray-400 mr-2 shrink-0">${node.practice || 0}/${node.total}</span>` 
                : '';
            
            if (node.level === 2) {
                actionBtn = `<div class="ml-auto flex items-center">${countInfo}<button class="bg-primary text-white text-[10px] px-2 py-0.5 rounded shadow-sm active:bg-blue-600 shrink-0" onclick="event.stopPropagation(); startQuiz('level2', ${node.id}, '${node.title}')">做题</button></div>`;
            } else if (node.level === 3) {
                actionBtn = `<div class="ml-auto flex items-center">${countInfo}<button class="bg-primary text-white text-[10px] px-2 py-0.5 rounded shadow-sm active:bg-blue-600 shrink-0" onclick="event.stopPropagation(); startQuiz('level3', ${node.id}, '${node.title}')">做题</button></div>`;
            } else {
                 // For level 1 or others without button, just show count if exists
                 if (countInfo) {
                     actionBtn = `<div class="ml-auto">${countInfo}</div>`;
                 }
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

// --- Home Page Logic ---
function continueLastQuiz() {
    // In a real app, this would load the last active session ID
    // For prototype, we mock resuming a specific topic
    const lastTopic = {
        id: 311,
        title: "Vue3 响应式原理"
    };
    
    if (confirm(`继续上次练习：${lastTopic.title}？`)) {
        window.location.href = `quiz.html?mode=tree&id=${lastTopic.id}&title=${encodeURIComponent(lastTopic.title)}`;
    }
}

// --- Center Page Logic ---
function openSettings() {
    openModal('settings-modal');
}

function openMessages() {
    openModal('messages-modal');
}

function openDataBackup() {
    openModal('backup-modal');
}

function openHelp() {
    openModal('help-modal');
}

function openAbout() {
    alert("智库 AI - 构建你的第二大脑\nVersion: 1.0.0 Alpha\n\nDesigned for Future Learning.");
}

function clearAllData() {
    if (confirm("警告：这将清除所有本地存储的数据（笔记、知识树、做题记录），操作不可撤销！\n\n确定要继续吗？")) {
        localStorage.clear();
        alert("数据已清除，页面将刷新。");
        window.location.reload();
    }
}

function markAllRead() {
    const list = document.getElementById('message-list');
    const dots = list.querySelectorAll('.bg-red-500');
    dots.forEach(dot => dot.remove());
    
    // Remove badge in menu
    const badge = document.querySelector('.text-red-500.rounded-full'); // simplified selector
    if (badge) badge.remove();
    
    alert("所有消息已标记为已读");
}

function exportAllData() {
    const data = {
        knowledgeTree: DataStore.get('knowledgeTree', defaultTreeData),
        notes: DataStore.get('notes', defaultNotes),
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    
    // Create download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zhiku_backup_${new Date().toISOString().slice(0,10)}.json`;
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
            if (data.knowledgeTree && data.notes) {
                if (confirm(`检测到备份文件 (${data.exportDate})\n\n确定要覆盖当前所有数据吗？`)) {
                    DataStore.set('knowledgeTree', data.knowledgeTree);
                    DataStore.set('notes', data.notes);
                    alert("数据恢复成功！页面将刷新。");
                    window.location.reload();
                }
            } else {
                alert("无效的备份文件格式");
            }
        } catch (err) {
            alert("文件解析失败：" + err.message);
        }
    };
    reader.readAsText(file);
    // Reset input
    input.value = '';
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

// --- Quiz Engine Logic ---

const quizMockData = [
    {
        id: 1,
        title: "在 Vue 3 中，使用哪个函数来定义引用类型的响应式对象？",
        type: "单选题",
        options: ["ref()", "reactive()", "computed()", "watch()"],
        answer: 1, 
        explanation: "reactive() 主要用于定义对象、数组等引用类型的响应式数据，而 ref() 主要用于定义基本类型，虽然 ref 也可以定义对象（内部调用 reactive）。"
    },
    {
        id: 2,
        title: "下列哪个生命周期钩子在 Vue 3 Composition API 中不存在？",
        type: "单选题",
        options: ["onMounted", "onCreated", "onUpdated", "onUnmounted"],
        answer: 1,
        explanation: "Vue 3 Composition API 中没有 onCreated 和 onBeforeCreate，直接在 setup() 函数中执行即可。"
    },
    {
        id: 3,
        title: "Vue Router 4 中获取当前路由参数的 Hook 是？",
        type: "单选题",
        options: ["useRouter", "useRoute", "useParams", "useQuery"],
        answer: 1,
        explanation: "useRoute() 用于获取当前路由信息（包括 params, query 等），useRouter() 用于执行路由跳转。"
    },
    {
        id: 4,
        title: "Pinia 相比 Vuex 的主要改进不包括？",
        type: "单选题",
        options: ["去除了 Mutation", "更好的 TypeScript 支持", "不再支持 Options API", "体积更小"],
        answer: 2,
        explanation: "Pinia 依然支持 Options API（通过 mapState, mapActions 等），同时也完美支持 Composition API。"
    },
    {
        id: 5,
        title: "Vite 在开发环境下使用什么方式打包？",
        type: "单选题",
        options: ["Webpack", "Rollup", "Esbuild (No-bundle)", "Parcel"],
        answer: 2,
        explanation: "Vite 在开发环境下基于浏览器原生 ES Module (No-bundle) 进行开发，生产环境使用 Rollup 打包。"
    }
];

let quizState = {
    questions: [],
    currentIndex: 0,
    userAnswers: {}, // { questionIndex: optionIndex }
    mode: 'immediate', // 'immediate' | 'submit_all'
    isReview: false,
    submitted: false // specific for submit_all mode to check if submitted
};

function initQuizPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const mode = urlParams.get('mode'); // 'random', 'tree', 'review'
    
    if (title) {
        document.getElementById('quiz-title').textContent = title;
    }
    
    // Default mock load
    // In real app, fetch based on IDs or Tree Node
    quizState.questions = [...quizMockData]; 
    quizState.currentIndex = 0;
    quizState.userAnswers = {};
    quizState.isReview = false;
    quizState.submitted = false;
    
    // Set initial mode from UI select
    const modeSelect = document.getElementById('quiz-mode-select');
    if (modeSelect) {
        quizState.mode = modeSelect.value;
    }

    renderQuizQuestion();
}

function changeQuizMode(newMode) {
    if (Object.keys(quizState.userAnswers).length > 0) {
        if (!confirm("切换模式将清空当前进度，确定吗？")) {
            // Revert select
            document.getElementById('quiz-mode-select').value = quizState.mode;
            return;
        }
    }
    quizState.mode = newMode;
    quizState.userAnswers = {};
    quizState.currentIndex = 0;
    quizState.submitted = false;
    quizState.isReview = false;
    
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('quiz-overview').classList.add('hidden');
    document.getElementById('quiz-action-bar').classList.remove('hidden');
    
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const container = document.getElementById('quiz-container');
    const question = quizState.questions[quizState.currentIndex];
    const total = quizState.questions.length;
    
    // Update Progress
    document.getElementById('quiz-progress').textContent = `${quizState.currentIndex + 1}/${total}`;
    
    // Check if answered
    const userAnswer = quizState.userAnswers[quizState.currentIndex];
    const isAnswered = userAnswer !== undefined;
    const isCorrect = isAnswered && userAnswer === question.answer;
    
    // Determine View State
    // Immediate mode: show result if answered
    // Submit All mode: show result only if submitted (isReview = true)
    const showResult = (quizState.mode === 'immediate' && isAnswered) || 
                       (quizState.mode === 'submit_all' && quizState.submitted);

    let optionsHtml = '';
    question.options.forEach((opt, idx) => {
        let bgClass = 'bg-white border-gray-200';
        let textClass = 'text-gray-800';
        let icon = '';
        
        if (showResult) {
            if (idx === question.answer) {
                bgClass = 'bg-green-50 border-green-500 text-green-700';
                icon = '<i class="fas fa-check float-right mt-1"></i>';
            } else if (idx === userAnswer) {
                bgClass = 'bg-red-50 border-red-500 text-red-700';
                icon = '<i class="fas fa-times float-right mt-1"></i>';
            }
        } else if (idx === userAnswer) {
             bgClass = 'bg-blue-50 border-primary text-primary';
        }
        
        // Disable click if showing result
        const clickAttr = showResult ? '' : `onclick="selectQuizOption(${idx})"`;
        const cursorClass = showResult ? 'cursor-default' : 'cursor-pointer active:bg-blue-50';

        optionsHtml += `
            <div class="option-item border rounded-xl p-4 mb-3 transition ${bgClass} ${cursorClass}" ${clickAttr}>
                <span class="font-medium mr-2">${String.fromCharCode(65 + idx)}.</span>
                ${opt}
                ${icon}
            </div>
        `;
    });

    let explanationHtml = '';
    if (showResult) {
        explanationHtml = `
            <div class="mt-6 p-4 bg-gray-100 rounded-xl animate-fade-in">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
                        ${isCorrect ? '回答正确' : '回答错误'}
                    </span>
                    <span class="text-xs text-gray-500">正确答案: ${String.fromCharCode(65 + question.answer)}</span>
                </div>
                <div class="text-sm text-gray-600 leading-relaxed">
                    <span class="font-bold text-gray-700">解析：</span>${question.explanation}
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="bg-white rounded-xl p-5 mb-4 shadow-sm min-h-[120px] flex flex-col justify-center">
            <span class="inline-block px-2 py-0.5 bg-blue-50 text-primary rounded text-xs w-fit mb-2">${question.type}</span>
            <p class="text-base font-medium leading-relaxed text-gray-800">${question.title}</p>
        </div>
        <div class="space-y-1">
            ${optionsHtml}
        </div>
        ${explanationHtml}
    `;
    
    updateActionButtons();
}

function selectQuizOption(idx) {
    if (quizState.mode === 'immediate' && quizState.userAnswers[quizState.currentIndex] !== undefined) return; // Already answered
    
    quizState.userAnswers[quizState.currentIndex] = idx;
    renderQuizQuestion();
}

function prevQuestion() {
    if (quizState.currentIndex > 0) {
        quizState.currentIndex--;
        renderQuizQuestion();
    }
}

function handleAction() {
    const total = quizState.questions.length;
    const isLast = quizState.currentIndex === total - 1;
    const isAnswered = quizState.userAnswers[quizState.currentIndex] !== undefined;

    // Review Mode (Post-submission or traversing finished immediate quiz)
    if (quizState.submitted || (quizState.mode === 'immediate' && Object.keys(quizState.userAnswers).length === total)) {
        if (isLast) {
            showQuizOverview();
        } else {
            quizState.currentIndex++;
            renderQuizQuestion();
        }
        return;
    }

    if (quizState.mode === 'immediate') {
        // Immediate Logic
        if (!isAnswered) {
            alert('请先选择一个答案');
            return;
        }
        
        if (isLast) {
             // Finish Immediate Quiz
             quizState.submitted = true; // Mark as done so we enter review mode behavior
             showQuizOverview();
        } else {
            quizState.currentIndex++;
            renderQuizQuestion();
        }
        
    } else {
        // Submit All Logic
        if (isLast) {
            if (Object.keys(quizState.userAnswers).length < total) {
                if (!confirm(`还有 ${total - Object.keys(quizState.userAnswers).length} 道题未做，确定提交吗？`)) return;
            }
            quizState.submitted = true;
            showQuizOverview();
        } else {
            quizState.currentIndex++;
            renderQuizQuestion();
        }
    }
}

function updateActionButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const actionBtn = document.getElementById('action-btn');
    
    prevBtn.disabled = quizState.currentIndex === 0;
    prevBtn.classList.toggle('opacity-30', quizState.currentIndex === 0);
    
    const isLast = quizState.currentIndex === quizState.questions.length - 1;
    const isReviewing = quizState.submitted || (quizState.mode === 'immediate' && quizState.submitted); // quizState.submitted is enough

    if (isReviewing) {
        actionBtn.textContent = isLast ? '返回概览' : '下一题';
        actionBtn.classList.remove('bg-gray-300');
        actionBtn.classList.add('bg-primary');
        return;
    }
    
    if (quizState.mode === 'immediate') {
        const isAnswered = quizState.userAnswers[quizState.currentIndex] !== undefined;
        
        if (isAnswered) {
             actionBtn.textContent = isLast ? '查看结果' : '下一题';
             actionBtn.classList.remove('bg-gray-300');
             actionBtn.classList.add('bg-primary');
        } else {
             actionBtn.textContent = '请选择';
             actionBtn.classList.add('bg-gray-300');
             actionBtn.classList.remove('bg-primary');
        }
    } else {
        // Submit All Mode
        actionBtn.textContent = isLast ? '提交试卷' : '下一题';
        actionBtn.classList.remove('bg-gray-300');
        actionBtn.classList.add('bg-primary');
    }
}

function showQuizOverview() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('quiz-action-bar').classList.add('hidden');
    document.getElementById('quiz-overview').classList.remove('hidden');
    document.getElementById('quiz-mode-select').disabled = true; // Disable mode switch in overview
    
    // Calculate Score
    let correct = 0;
    quizState.questions.forEach((q, idx) => {
        if (quizState.userAnswers[idx] === q.answer) correct++;
    });
    
    document.getElementById('score-display').textContent = Math.round((correct / quizState.questions.length) * 100);
    document.getElementById('total-count').textContent = quizState.questions.length;
    document.getElementById('correct-count').textContent = correct;
    
    // Generate Grid
    const grid = document.getElementById('overview-grid');
    grid.innerHTML = '';
    
    quizState.questions.forEach((q, idx) => {
        const ua = quizState.userAnswers[idx];
        let colorClass = 'bg-gray-100 text-gray-400'; // Unanswered
        
        if (ua !== undefined) {
            if (ua === q.answer) {
                colorClass = 'bg-green-100 text-green-600 border border-green-200';
            } else {
                colorClass = 'bg-red-100 text-red-600 border border-red-200';
            }
        }
        
        const item = document.createElement('div');
        item.className = `aspect-square rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-80 transition ${colorClass}`;
        item.textContent = idx + 1;
        item.onclick = () => reviewQuestion(idx);
        grid.appendChild(item);
    });
}

function reviewQuestion(index) {
    quizState.currentIndex = index;
    
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('quiz-action-bar').classList.remove('hidden');
    document.getElementById('quiz-overview').classList.add('hidden');
    
    renderQuizQuestion();
}

function restartQuiz() {
    if (confirm('确定要重新开始吗？')) {
        quizState.userAnswers = {};
        quizState.currentIndex = 0;
        quizState.submitted = false;
        
        document.getElementById('quiz-container').classList.remove('hidden');
        document.getElementById('quiz-action-bar').classList.remove('hidden');
        document.getElementById('quiz-overview').classList.add('hidden');
        document.getElementById('quiz-mode-select').disabled = false;
        
        renderQuizQuestion();
    }
}

// Global click for modal close
window.onclick = function(event) {
    const modal = document.getElementById('tree-modal');
    if (event.target == modal) {
        closeModal('tree-modal');
    }
}

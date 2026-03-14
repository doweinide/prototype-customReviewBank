// Mock Data for Knowledge Tree
const knowledgeTreeData = [
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

// Tab Switching Logic
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Update Tab Bar Styles
    document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find the clicked tab button based on onclick attribute text (simple hack) or add IDs to buttons
    const tabs = document.querySelectorAll('.tab-item');
    if (tabName === 'home') {
        tabs[0].classList.add('active');
        document.getElementById('page-title').textContent = '首页';
    } else {
        tabs[1].classList.add('active');
        document.getElementById('page-title').textContent = '我的中心';
        // Initialize charts when tab is shown if not already done
        initCharts();
    }
}

// Modal Logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.querySelector('.modal-content').style.transform = 'translateY(100%)';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Knowledge Tree Logic
function openKnowledgeTree(mode = 'normal') {
    const container = document.getElementById(mode === 'manage' ? 'manage-tree-root' : 'tree-root');
    // Clear search
    const searchInput = document.getElementById('tree-search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    renderTree(knowledgeTreeData, container, mode);
    
    if (mode === 'normal') {
        openModal('tree-modal');
    } else if (mode === 'select-for-question') {
        renderTree(knowledgeTreeData, document.getElementById('tree-root'), 'select');
        openModal('tree-modal');
    }
}

function searchTree(keyword) {
    const container = document.getElementById('tree-root');
    if (!keyword) {
        renderTree(knowledgeTreeData, container, 'select'); // Assume select mode for now or detect
        return;
    }
    
    // Simple filter logic: flat list of matches
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
    
    // Render matches flat
    container.innerHTML = '';
    if (matches.length === 0) {
        container.innerHTML = '<div style="padding:10px; color:#999">无搜索结果</div>';
        return;
    }
    
    matches.forEach(node => {
         const nodeEl = document.createElement('div');
         nodeEl.className = 'tree-node';
         nodeEl.style.marginLeft = '0'; // Flat view
         
         const clickHandler = `selectNodeForQuestion(${node.id}, '${node.title}', this)`;
         
         nodeEl.innerHTML = `
            <div class="node-content" onclick="${clickHandler}">
                <i class="fas fa-search node-icon" style="font-size: 10px;"></i>
                <span class="node-title">${node.title}</span>
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
        nodeEl.className = 'tree-node';
        
        const hasChildren = node.children && node.children.length > 0;
        // Only show caret if there are children, otherwise circle
        let iconClass = 'fas fa-circle';
        let iconStyle = 'font-size: 6px;';
        
        if (hasChildren) {
            iconClass = 'fas fa-caret-right';
            iconStyle = '';
        }

        const toggleIcon = `<i class="${iconClass} node-icon" style="${iconStyle}"></i>`;
        
        // Action Button Logic
        let actionBtn = '';
        let clickHandler = `toggleNode(this)`;

        if (mode === 'normal') {
            if (node.level === 2) {
                actionBtn = `<button class="btn-small node-actions" onclick="event.stopPropagation(); startQuiz('level2', ${node.id}, '${node.title}')">做题</button>`;
            } else if (node.level === 3) {
                actionBtn = `<button class="btn-small node-actions" onclick="event.stopPropagation(); startQuiz('level3', ${node.id}, '${node.title}')">做题</button>`;
            }
        } else if (mode === 'manage') {
            actionBtn = `
                <div class="node-actions">
                    <button class="btn-small" style="background:#52c41a" title="添加子节点" onclick="event.stopPropagation(); addNode(${node.id})"><i class="fas fa-folder-plus"></i></button>
                    <button class="btn-small" style="background:#1890ff" title="添加题目" onclick="event.stopPropagation(); addQuestionToNode(${node.id}, '${node.title}')"><i class="fas fa-file-circle-plus"></i></button>
                    <button class="btn-small" style="background:#fa8c16" title="编辑节点" onclick="event.stopPropagation(); editNode(${node.id})"><i class="fas fa-edit"></i></button>
                </div>`;
        } else if (mode === 'select') {
             // Selection mode for adding question
             clickHandler = `selectNodeForQuestion(${node.id}, '${node.title}', this)`;
        }

        nodeEl.innerHTML = `
            <div class="node-content" onclick="${clickHandler}">
                ${toggleIcon}
                <span class="node-title">${node.title}</span>
                ${actionBtn}
            </div>
            ${hasChildren ? '<div class="children-container"></div>' : ''}
        `;
        
        container.appendChild(nodeEl);
        
        // Render children if they exist
        if (hasChildren) {
            const childrenContainer = nodeEl.querySelector('.children-container');
            renderTree(node.children, childrenContainer, mode);
        }
    });
}

function selectNodeForQuestion(id, title, element) {
    // Visual selection
    document.querySelectorAll('.node-content').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    
    // Logic
    document.getElementById('selected-node-name').textContent = title;
    document.getElementById('selected-node-name').dataset.id = id;
    
    // Close modal after short delay
    setTimeout(() => {
        closeModal('tree-modal');
    }, 300);
}

function toggleNode(element) {
    const childrenContainer = element.nextElementSibling;
    const icon = element.querySelector('.node-icon');
    
    if (childrenContainer && childrenContainer.classList.contains('children-container')) {
        const isOpen = childrenContainer.classList.toggle('open');
        if (isOpen) {
            icon.classList.remove('fa-caret-right');
            icon.classList.add('fa-caret-down');
        } else {
            icon.classList.remove('fa-caret-down');
            icon.classList.add('fa-caret-right');
        }
    }
}

// Full Page View Management
function openView(viewId) {
    const view = document.getElementById(viewId);
    view.classList.add('active');
}

function closeView(viewId) {
    const view = document.getElementById(viewId);
    view.classList.remove('active');
}

// Interaction Mocks
function startRandomQuiz() {
    openView('quiz-view');
    document.getElementById('quiz-title').textContent = '随机做题';
}

function startQuiz(level, id, title) {
    // alert(`开始做题: [${level === 'level2' ? '二级目录' : '知识点'}] ${title}\n(随机抽取该节点下所有题目)`);
    openView('quiz-view');
    document.getElementById('quiz-title').textContent = title;
}

function selectOption(el) {
    // Toggle selection style
    const options = el.parentElement.children;
    for(let opt of options) {
        opt.classList.remove('selected');
    }
    el.classList.add('selected');
}

function submitAnswer() {
    alert('回答提交！(原型演示)');
    // In real app: check answer, show result, next question
}

function startReview() {
    openView('quiz-view');
    document.getElementById('quiz-title').textContent = '今日复习';
}

function addKnowledgeTree() {
    openView('tree-manage-view');
    renderTree(knowledgeTreeData, document.getElementById('manage-tree-root'), 'manage');
}

// Add Question Logic
function switchAddTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.add-tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.style.display = 'none');
    
    if (tab === 'single') {
        tabs[0].classList.add('active');
        document.getElementById('add-single-form').style.display = 'block';
    } else {
        tabs[1].classList.add('active');
        document.getElementById('add-batch-form').style.display = 'block';
    }
}

function toggleOptionExplain(icon) {
    const wrapper = icon.closest('.option-wrapper');
    const explainInput = wrapper.querySelector('.option-explain');
    explainInput.classList.toggle('hidden');
    if (!explainInput.classList.contains('hidden')) {
        explainInput.focus();
    }
}

function addOptionInput() {
    const container = document.getElementById('options-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'option-wrapper';
    wrapper.innerHTML = `
        <div class="option-input-group">
            <input type="radio" name="correct-opt" title="设为正确答案">
            <input type="text" placeholder="选项">
            <i class="fas fa-comment-dots" onclick="toggleOptionExplain(this)" title="添加解析"></i>
        </div>
        <input type="text" class="option-explain hidden" placeholder="选项解析...">
    `;
    container.appendChild(wrapper);
}

function processBatchImport() {
    const jsonStr = document.getElementById('batch-input').value;
    try {
        const data = JSON.parse(jsonStr);
        if (Array.isArray(data)) {
            alert(`成功解析 ${data.length} 道题目！\n(原型演示：已导入数据库)`);
            closeView('add-question-view');
        } else {
            alert('JSON 格式错误：必须是数组格式');
        }
    } catch (e) {
        alert('JSON 解析失败，请检查格式');
    }
}

function addQuestion() {
    // Reset form or selection
    document.getElementById('selected-node-name').textContent = '请选择知识点...';
    delete document.getElementById('selected-node-name').dataset.id;
    openView('add-question-view');
}

function addQuestionToNode(id, title) {
    openView('add-question-view');
    // Pre-fill selection
    const nameEl = document.getElementById('selected-node-name');
    nameEl.textContent = title;
    nameEl.dataset.id = id;
}

function saveQuestion() {
    const nodeName = document.getElementById('selected-node-name').textContent;
    if (nodeName.includes('...')) {
        alert('请先选择知识点！');
        return;
    }
    alert(`题目已保存到 "${nodeName}" 节点下！`);
    closeView('add-question-view');
}

// Tree Management Logic
function importTreeJSON() {
    const json = prompt("请粘贴树结构 JSON:");
    if (json) {
        try {
            const newData = JSON.parse(json);
            // Mock merge or replace
            knowledgeTreeData.push(newData); 
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
    // In real app, could trigger download
}

function addRootNode() {
    const name = prompt("输入根节点名称:");
    if (name) {
        knowledgeTreeData.push({
            id: Date.now(),
            title: name,
            level: 1,
            children: []
        });
        renderTree(knowledgeTreeData, document.getElementById('manage-tree-root'), 'manage');
    }
}

function addNode(parentId) {
    const name = prompt("输入子节点名称:");
    if (name) {
        // Recursive find and add (simplified mock)
        alert(`在节点 ID ${parentId} 下添加 "${name}" (原型演示)`);
        // Real implementation would traverse tree to find parentId and push to children
    }
}

function editNode(id) {
    const newName = prompt("修改节点名称:", "新名称");
    if (newName) {
        alert(`节点 ID ${id} 名称修改为 "${newName}" (原型演示)`);
    }
}

function openWrongBook() {
    alert('打开错题本...');
}

// Chart Initialization
let chartsInitialized = false;
function initCharts() {
    if (chartsInitialized) return;
    
    // Quiz/Review Curve Chart
    const ctx1 = document.getElementById('quizCurveChart').getContext('2d');
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
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // New Knowledge Trend Chart
    const ctx2 = document.getElementById('newKnowledgeChart').getContext('2d');
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
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
    
    chartsInitialized = true;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('tree-modal');
    if (event.target == modal) {
        closeModal('tree-modal');
    }
}

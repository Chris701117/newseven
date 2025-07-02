// 主應用程式類別
class App {
    constructor() {
        this.currentModule = 'dashboard';
        this.currentView = 'dashboard';
        this.sidebarCollapsed = false;
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadDashboard();
        this.checkMobile();
        
        // 監聽視窗大小變化
        window.addEventListener('resize', () => {
            this.checkMobile();
        });
    }
    
    bindEvents() {
        // 側邊欄切換
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }
        
        // 選單項目點擊
        document.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            const menuLink = e.target.closest('.menu-link');
            const submenuLink = e.target.closest('.submenu a');
            
            if (submenuLink) {
                e.preventDefault();
                const view = submenuLink.getAttribute('data-view');
                if (view) {
                    this.loadView(view);
                }
                return;
            }
            
            if (menuLink && menuItem) {
                e.preventDefault();
                
                // 處理子選單展開/收合
                if (menuItem.querySelector('.submenu')) {
                    menuItem.classList.toggle('expanded');
                }
                
                // 處理模組切換
                const module = menuItem.getAttribute('data-module');
                if (module && module !== this.currentModule) {
                    this.switchModule(module);
                }
            }
        });
        
        // 通知下拉選單
        const notificationBtn = document.querySelector('.notification-btn');
        const notifications = document.getElementById('notifications');
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifications.classList.toggle('active');
            });
        }
        
        // 點擊外部關閉通知
        document.addEventListener('click', (e) => {
            if (!notifications.contains(e.target)) {
                notifications.classList.remove('active');
            }
        });
        
        // 模態框事件
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        
        [modalOverlay, modalClose, modalCancel].forEach(element => {
            if (element) {
                element.addEventListener('click', (e) => {
                    if (e.target === modalOverlay || e.target === modalClose || e.target === modalCancel) {
                        this.closeModal();
                    }
                });
            }
        });
        
        // 全域搜尋
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }
    }
    
    checkMobile() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            const sidebar = document.getElementById('sidebar');
            if (this.isMobile) {
                sidebar.classList.remove('collapsed');
                sidebar.classList.remove('active');
            } else {
                sidebar.classList.remove('active');
            }
        }
    }
    
    toggleSidebar() {
        if (this.isMobile) {
            this.toggleMobileSidebar();
            return;
        }
        
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        this.sidebarCollapsed = sidebar.classList.contains('collapsed');
    }
    
    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    }
    
    switchModule(module) {
        // 更新選單狀態
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeMenuItem = document.querySelector(`[data-module="${module}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        this.currentModule = module;
        
        // 載入對應的視圖
        switch (module) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'social':
                this.loadView('posts-manage');
                break;
            case 'marketing':
                this.loadView('marketing-items');
                break;
            case 'operation':
                this.loadView('operation-items');
                break;
            case 'settings':
                this.loadView('profile');
                break;
            default:
                this.loadDashboard();
        }
    }
    
    loadView(view) {
        this.currentView = view;
        this.updatePageTitle(view);
        
        // 顯示載入指示器
        this.showLoading();
        
        // 模擬載入延遲
        setTimeout(() => {
            const content = this.getViewContent(view);
            document.getElementById('contentArea').innerHTML = content;
            this.hideLoading();
            
            // 初始化視圖特定的功能
            this.initViewFeatures(view);
        }, 300);
    }
    
    loadDashboard() {
        this.currentView = 'dashboard';
        this.updatePageTitle('dashboard');
        
        this.showLoading();
        
        setTimeout(() => {
            const content = Views.getDashboard();
            document.getElementById('contentArea').innerHTML = content;
            this.hideLoading();
            
            // 載入儀表板資料
            this.loadDashboardData();
        }, 300);
    }
    
    updatePageTitle(view) {
        const titles = {
            'dashboard': '儀表板',
            'posts-manage': '貼文管理',
            'posts-list': '貼文列表',
            'posts-calendar': '貼文總覽',
            'posts-publish': '正式發佈',
            'fb-analytics': 'FB數據',
            'marketing-items': '行銷項目管理',
            'marketing-list': '行銷項目列表',
            'marketing-overview': '行銷項目總覽',
            'onelink': 'Onelink管理',
            'vendors': '廠商聯絡',
            'operation-items': '營運項目管理',
            'operation-list': '營運項目列表',
            'operation-overview': '營運項目總覽',
            'profile': '個人設定',
            'facebook': 'FB粉絲頁設定',
            'groups': '群組權限',
            'users': '帳號管理',
            'ai-settings': 'AI助手設定'
        };
        
        const title = titles[view] || '七七七科技後台';
        document.getElementById('pageTitle').textContent = title;
    }
    
    getViewContent(view) {
        // 使用 Views 類別取得視圖內容
        switch (view) {
            case 'posts-manage':
                return Views.getPostsManage();
            case 'posts-list':
                return Views.getPostsList();
            case 'posts-calendar':
                return Views.getPostsCalendar();
            case 'posts-publish':
                return Views.getPostsPublish();
            case 'fb-analytics':
                return Views.getFBAnalytics();
            case 'marketing-items':
                return Views.getMarketingItems();
            case 'marketing-list':
                return Views.getMarketingList();
            case 'marketing-overview':
                return Views.getMarketingOverview();
            case 'onelink':
                return Views.getOnelink();
            case 'vendors':
                return Views.getVendors();
            case 'operation-items':
                return Views.getOperationItems();
            case 'operation-list':
                return Views.getOperationList();
            case 'operation-overview':
                return Views.getOperationOverview();
            case 'profile':
                return Views.getProfile();
            case 'facebook':
                return Views.getFacebookSettings();
            case 'groups':
                return Views.getGroups();
            case 'users':
                return Views.getUsers();
            case 'ai-settings':
                return Views.getAISettingsView();
            default:
                return '<div class="card"><div class="card-body"><p>視圖不存在</p></div></div>';
        }
    }
    
    initViewFeatures(view) {
        // 初始化視圖特定的功能
        switch (view) {
            case 'posts-manage':
                this.initPostsManage();
                break;
            case 'posts-list':
                this.initPostsList();
                break;
            case 'posts-calendar':
                this.initPostsCalendar();
                break;
            case 'marketing-items':
                this.initMarketingItems();
                break;
            case 'operation-items':
                this.initOperationItems();
                break;
            case 'ai-settings':
                this.initAISettings();
                break;
            // 其他視圖的初始化...
        }
    }
    
    initPostsManage() {
        // 初始化貼文管理功能
        const form = document.getElementById('postForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost();
            });
        }
    }
    
    initPostsList() {
        // 初始化貼文列表功能
        this.loadPostsList();
    }
    
    initPostsCalendar() {
        // 初始化貼文日曆功能
        this.loadPostsCalendar();
    }
    
    initMarketingItems() {
        // 初始化行銷項目功能
        this.loadMarketingItems();
    }
    
    initOperationItems() {
        // 初始化營運項目功能
        this.loadOperationItems();
    }
    
    async loadDashboardData() {
        try {
            // 載入儀表板統計資料
            const stats = await API.getDashboardStats();
            this.updateDashboardStats(stats);
        } catch (error) {
            console.error('載入儀表板資料失敗:', error);
        }
    }
    
    updateDashboardStats(stats) {
        // 更新儀表板統計數據
        const elements = {
            'totalPosts': stats.totalPosts || 0,
            'scheduledPosts': stats.scheduledPosts || 0,
            'marketingItems': stats.marketingItems || 0,
            'operationItems': stats.operationItems || 0
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    async loadPostsList() {
        try {
            const posts = await API.getPosts();
            this.renderPostsList(posts);
        } catch (error) {
            console.error('載入貼文列表失敗:', error);
        }
    }
    
    renderPostsList(posts) {
        const tbody = document.querySelector('#postsTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = posts.data.map(post => `
            <tr>
                <td>${post.title}</td>
                <td>${post.author}</td>
                <td>${new Date(post.scheduled_time).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${post.status === '已發佈' ? 'bg-success' : 'bg-warning'}">
                        ${post.status}
                    </span>
                </td>
                <td>
                    <span class="badge bg-primary">${post.tag}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="app.editPost(${post.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="app.deletePost(${post.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    async savePost() {
        const form = document.getElementById('postForm');
        const formData = new FormData(form);
        
        const postData = {
            title: formData.get('title'),
            content: formData.get('content'),
            scheduled_time: formData.get('scheduled_time'),
            start_time: formData.get('start_time'),
            end_time: formData.get('end_time'),
            tag: formData.get('tag'),
            author: '當前使用者' // 應該從認證系統取得
        };
        
        try {
            this.showLoading();
            await API.createPost(postData);
            this.hideLoading();
            this.showNotification('貼文儲存成功', 'success');
            form.reset();
        } catch (error) {
            this.hideLoading();
            this.showNotification('貼文儲存失敗', 'error');
            console.error('儲存貼文失敗:', error);
        }
    }
    
    showModal(title, content, onConfirm = null) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalConfirm = document.getElementById('modalConfirm');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        
        if (onConfirm) {
            modalConfirm.onclick = onConfirm;
        }
        
        modal.classList.add('active');
    }
    
    closeModal() {
        const modal = document.getElementById('modalOverlay');
        modal.classList.remove('active');
    }
    
    showLoading() {
        const loading = document.getElementById('loadingOverlay');
        loading.classList.add('active');
    }
    
    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        loading.classList.remove('active');
    }
    
    showNotification(message, type = 'info') {
        // 建立通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // 添加樣式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            padding: 1rem;
            z-index: 4000;
            transform: translateX(100%);
            transition: var(--transition);
            min-width: 300px;
        `;
        
        if (type === 'success') {
            notification.style.borderLeftColor = 'var(--success-color)';
            notification.style.borderLeftWidth = '4px';
        } else if (type === 'error') {
            notification.style.borderLeftColor = 'var(--error-color)';
            notification.style.borderLeftWidth = '4px';
        }
        
        document.body.appendChild(notification);
        
        // 顯示動畫
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 關閉按鈕事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // 自動關閉
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }
    
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // 初始化貼文管理頁面
    initPostsManage() {
        const form = document.getElementById('postForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost();
            });
        }
        
        // 平台切換功能
        const platformTabs = document.querySelectorAll('.platform-tabs button');
        const contentArea = document.querySelector('.platform-content-area');
        
        platformTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有active類別
                platformTabs.forEach(t => t.classList.remove('active'));
                // 添加active到當前標籤
                tab.classList.add('active');
                
                // 切換內容區域
                const platform = tab.getAttribute('data-platform');
                const placeholders = {
                    'fb': 'Facebook 專用內容（選填）',
                    'ig': 'Instagram 專用內容（選填）',
                    'tiktok': 'TikTok 專用內容（選填）',
                    'threads': 'Threads 專用內容（選填）',
                    'x': 'X (Twitter) 專用內容（選填）'
                };
                
                contentArea.innerHTML = `<textarea name="${platform}_content" class="form-input form-textarea" rows="3" placeholder="${placeholders[platform]}"></textarea>`;
            });
        });
    }
    
    // 初始化貼文列表頁面
    initPostsList() {
        this.loadPostsList();
    }
    
    // 初始化貼文日曆頁面
    initPostsCalendar() {
        this.loadPostsCalendar();
    }
    
    // 初始化行銷項目管理頁面
    initMarketingItems() {
        const form = document.getElementById('marketingForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMarketingSubmit(form);
            });
        }
    }
    
    // 初始化營運項目管理頁面
    initOperationItems() {
        const form = document.getElementById('operationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOperationSubmit(form);
            });
        }
    }
    
    // 載入貼文列表
    async loadPostsList() {
        try {
            const response = await API.getPosts();
            const tbody = document.querySelector('#postsTable tbody');
            
            if (response.success && response.data.length > 0) {
                tbody.innerHTML = response.data.map(post => `
                    <tr>
                        <td>${post.title}</td>
                        <td>${post.author}</td>
                        <td>${new Date(post.scheduled_time).toLocaleString('zh-TW')}</td>
                        <td><span class="badge badge-${post.status === '已發佈' ? 'success' : 'warning'}">${post.status}</span></td>
                        <td><span class="badge badge-info">${post.tag}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="app.editPost(${post.id})">編輯</button>
                            <button class="btn btn-sm btn-danger" onclick="app.deletePost(${post.id})">刪除</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4">暫無貼文資料</td></tr>';
            }
        } catch (error) {
            console.error('載入貼文列表失敗:', error);
            const tbody = document.querySelector('#postsTable tbody');
            tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-error">載入失敗</td></tr>';
        }
    }
    
    // 載入貼文日曆
    async loadPostsCalendar() {
        try {
            const response = await API.get('/posts/calendar');
            // 實作日曆視圖邏輯
            console.log('日曆資料:', response);
        } catch (error) {
            console.error('載入日曆失敗:', error);
        }
    }
    
    // 處理行銷項目提交
    async handleMarketingSubmit(form) {
        const formData = new FormData(form);
        
        const marketingData = {
            title: formData.get('title'),
            content: formData.get('content'),
            start_time: formData.get('start_time'),
            end_time: formData.get('end_time'),
            tag: formData.get('tag'),
            author: '當前使用者'
        };
        
        try {
            this.showLoading();
            await API.post('/marketing', marketingData);
            this.hideLoading();
            this.showNotification('行銷項目儲存成功', 'success');
            form.reset();
        } catch (error) {
            this.hideLoading();
            this.showNotification('行銷項目儲存失敗', 'error');
            console.error('儲存行銷項目失敗:', error);
        }
    }
    
    // 處理營運項目提交
    async handleOperationSubmit(form) {
        const formData = new FormData(form);
        
        const operationData = {
            title: formData.get('title'),
            content: formData.get('content'),
            start_time: formData.get('start_time'),
            end_time: formData.get('end_time'),
            tag: formData.get('tag'),
            author: '當前使用者'
        };
        
        try {
            this.showLoading();
            await API.post('/operation', operationData);
            this.hideLoading();
            this.showNotification('營運項目儲存成功', 'success');
            form.reset();
        } catch (error) {
            this.hideLoading();
            this.showNotification('營運項目儲存失敗', 'error');
            console.error('儲存營運項目失敗:', error);
        }
    }
    
    // 編輯貼文
    editPost(id) {
        // 實作編輯功能
        console.log('編輯貼文:', id);
    }
    
    // 刪除貼文
    async deletePost(id) {
        if (confirm('確定要刪除這篇貼文嗎？')) {
            try {
                await API.deletePost(id);
                this.showNotification('貼文已刪除', 'success');
                this.loadPostsList();
            } catch (error) {
                this.showNotification('刪除失敗', 'error');
                console.error('刪除貼文失敗:', error);
            }
        }
    }
    
    handleGlobalSearch(query) {
        // 實作全域搜尋功能
        console.log('搜尋:', query);
    }
}

// 初始化應用程式
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});


    // 初始化AI設定頁面
    initAISettings() {
        this.loadAISettings();
        this.loadChatSessions();
        
        const form = document.getElementById('aiSettingsForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAISettings();
            });
        }
    }
    
    async loadAISettings() {
        try {
            const response = await fetch('/api/ai/settings');
            const result = await response.json();
            
            if (result.success) {
                result.data.forEach(setting => {
                    const input = document.querySelector(`[name="${setting.setting_key}"]`);
                    if (input && !setting.is_encrypted) {
                        input.value = setting.setting_value || '';
                    }
                });
            }
        } catch (error) {
            console.error('載入AI設定失敗:', error);
        }
    }
    
    async saveAISettings() {
        const form = document.getElementById('aiSettingsForm');
        const formData = new FormData(form);
        const settings = {};
        
        for (let [key, value] of formData.entries()) {
            if (value.trim()) {
                settings[key] = value.trim();
            }
        }
        
        try {
            this.showLoading();
            const response = await fetch('/api/ai/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            
            const result = await response.json();
            this.hideLoading();
            
            if (result.success) {
                this.showNotification('AI設定已儲存', 'success');
            } else {
                this.showNotification('儲存失敗: ' + result.error, 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showNotification('儲存失敗', 'error');
            console.error('儲存AI設定失敗:', error);
        }
    }
    
    async testAIConnection() {
        try {
            this.showLoading();
            
            // 測試OpenAI連接
            const response = await fetch('/api/chat/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'post',
                    prompt: '測試連接',
                    platform: 'test'
                })
            });
            
            const result = await response.json();
            this.hideLoading();
            
            if (result.success) {
                this.showNotification('AI連接測試成功！', 'success');
            } else {
                this.showNotification('AI連接測試失敗: ' + result.error, 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showNotification('連接測試失敗', 'error');
            console.error('AI連接測試失敗:', error);
        }
    }
    
    async loadChatSessions() {
        try {
            const response = await fetch('/api/chat/sessions?user_id=current_user');
            const result = await response.json();
            
            if (result.success) {
                this.renderChatSessions(result.data);
            }
        } catch (error) {
            console.error('載入對話會話失敗:', error);
        }
    }
    
    renderChatSessions(sessions) {
        const container = document.getElementById('chatSessionsList');
        if (!container) return;
        
        if (sessions.length === 0) {
            container.innerHTML = '<div class="empty-state">尚無對話記錄</div>';
            return;
        }
        
        container.innerHTML = sessions.map(session => `
            <div class="chat-session-item">
                <div class="session-info">
                    <div class="session-title">${session.title}</div>
                    <div class="session-meta">
                        ${new Date(session.updated_at).toLocaleString()} · ${session.message_count} 則訊息
                    </div>
                </div>
                <div class="session-actions">
                    <button class="btn btn-sm btn-outline" onclick="app.viewChatSession('${session.session_id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async viewChatSession(sessionId) {
        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
            const result = await response.json();
            
            if (result.success) {
                this.showChatSessionModal(result.data);
            }
        } catch (error) {
            console.error('載入對話記錄失敗:', error);
        }
    }
    
    showChatSessionModal(messages) {
        const modalContent = `
            <div class="chat-history">
                ${messages.map(msg => `
                    <div class="chat-message ${msg.role}">
                        <div class="message-meta">
                            <strong>${msg.role === 'user' ? '用戶' : 'AI助手'}</strong>
                            <span class="timestamp">${new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="message-content">${msg.content}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.showModal('對話記錄', modalContent);
    }


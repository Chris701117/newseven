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
        
        // 自動關閉
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.addEventListener('transitionend', () => {
                notification.remove();
            }, { once: true });
        }, 5000);
        
        // 點擊關閉按鈕
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            notification.addEventListener('transitionend', () => {
                notification.remove();
            }, { once: true });
        });
    }

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

        const newSessionBtn = document.getElementById('newSessionBtn');
        if (newSessionBtn) {
            newSessionBtn.addEventListener('click', () => {
                this.createNewChatSession();
            });
        }

        const chatSessionList = document.getElementById('chatSessionList');
        if (chatSessionList) {
            chatSessionList.addEventListener('click', (e) => {
                const sessionItem = e.target.closest('.chat-session-item');
                if (sessionItem) {
                    const sessionId = sessionItem.dataset.sessionId;
                    this.loadChatSession(sessionId);
                }
            });
        }

        const exportChatBtn = document.getElementById('exportChatBtn');
        if (exportChatBtn) {
            exportChatBtn.addEventListener('click', () => {
                this.exportChatHistory();
            });
        }

        const importChatBtn = document.getElementById('importChatBtn');
        if (importChatBtn) {
            importChatBtn.addEventListener('click', () => {
                document.getElementById('importChatFile').click();
            });
        }

        const importChatFile = document.getElementById('importChatFile');
        if (importChatFile) {
            importChatFile.addEventListener('change', (e) => {
                this.importChatHistory(e.target.files[0]);
            });
        }

        const clearChatBtn = document.getElementById('clearChatBtn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => {
                this.clearChatHistory();
            });
        }

        const deleteSessionBtn = document.getElementById('deleteSessionBtn');
        if (deleteSessionBtn) {
            deleteSessionBtn.addEventListener('click', () => {
                this.deleteChatSession();
            });
        }

        const editSessionBtn = document.getElementById('editSessionBtn');
        if (editSessionBtn) {
            editSessionBtn.addEventListener('click', () => {
                this.enableEditMode();
            });
        }

        const saveSessionNameBtn = document.getElementById('saveSessionNameBtn');
        if (saveSessionNameBtn) {
            saveSessionNameBtn.addEventListener('click', () => {
                this.saveSessionName();
            });
        }

        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.cancelEditMode();
            });
        }
    }

        const newSessionBtn = document.getElementById('newSessionBtn');
        if (newSessionBtn) {
            newSessionBtn.addEventListener('click', () => {
                this.createNewChatSession();
            });
        }

        const chatSessionList = document.getElementById('chatSessionList');
        if (chatSessionList) {
            chatSessionList.addEventListener('click', (e) => {
                const sessionItem = e.target.closest('.chat-session-item');
                if (sessionItem) {
                    const sessionId = sessionItem.dataset.sessionId;
                    this.loadChatSession(sessionId);
                }
            });
        }

        const exportChatBtn = document.getElementById('exportChatBtn');
        if (exportChatBtn) {
            exportChatBtn.addEventListener('click', () => {
                this.exportChatHistory();
            });
        }

        const importChatBtn = document.getElementById('importChatBtn');
        if (importChatBtn) {
            importChatBtn.addEventListener('click', () => {
                document.getElementById('importChatFile').click();
            });
        }

        const importChatFile = document.getElementById('importChatFile');
        if (importChatFile) {
            importChatFile.addEventListener('change', (e) => {
                this.importChatHistory(e.target.files[0]);
            });
        }

        const clearChatBtn = document.getElementById('clearChatBtn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => {
                this.clearChatHistory();
            });
        }

        const deleteSessionBtn = document.getElementById('deleteSessionBtn');
        if (deleteSessionBtn) {
            deleteSessionBtn.addEventListener('click', () => {
                this.deleteChatSession();
            });
        }

        const editSessionBtn = document.getElementById('editSessionBtn');
        if (editSessionBtn) {
            editSessionBtn.addEventListener('click', () => {
                this.enableEditMode();
            });
        }

        const saveSessionNameBtn = document.getElementById('saveSessionNameBtn');
        if (saveSessionNameBtn) {
            saveSessionNameBtn.addEventListener('click', () => {
                this.saveSessionName();
            });
        }

        const cancelEditBtn = document.getElementById('cancelEditBtn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.cancelEditMode();
            });
        }
    }

    async loadAISettings() {
        try {
            const settings = await API.getAISettings();
            document.getElementById('openaiApiKey').value = settings.openai_api_key || '';
            document.getElementById('openaiAssistantId').value = settings.openai_assistant_id || '';
            document.getElementById('cloudinaryCloudName').value = settings.cloudinary_cloud_name || '';
            document.getElementById('cloudinaryApiKey').value = settings.cloudinary_api_key || '';
            document.getElementById('cloudinaryApiSecret').value = settings.cloudinary_api_secret || '';
        } catch (error) {
            console.error('載入AI設定失敗:', error);
            this.showNotification('載入AI設定失敗', 'error');
        }
    }

    async saveAISettings() {
        const openaiApiKey = document.getElementById('openaiApiKey').value;
        const openaiAssistantId = document.getElementById('openaiAssistantId').value;
        const cloudinaryCloudName = document.getElementById('cloudinaryCloudName').value;
        const cloudinaryApiKey = document.getElementById('cloudinaryApiKey').value;
        const cloudinaryApiSecret = document.getElementById('cloudinaryApiSecret').value;

        try {
            await API.saveAISettings({
                openai_api_key: openaiApiKey,
                openai_assistant_id: openaiAssistantId,
                cloudinary_cloud_name: cloudinaryCloudName,
                cloudinary_api_key: cloudinaryApiKey,
                cloudinary_api_secret: cloudinaryApiSecret
            });
            this.showNotification('AI設定儲存成功', 'success');
        } catch (error) {
            console.error('儲存AI設定失敗:', error);
            this.showNotification('儲存AI設定失敗', 'error');
        }
    }

    async loadChatSessions() {
        try {
            const sessions = await API.getChatSessions();
            const chatSessionList = document.getElementById('chatSessionList');
            if (chatSessionList) {
                chatSessionList.innerHTML = sessions.map(session => `
                    <div class="chat-session-item" data-session-id="${session.id}">
                        <span class="session-name">${session.name}</span>
                        <div class="session-actions">
                            <button class="edit-session-btn" data-session-id="${session.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-session-btn" data-session-id="${session.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('載入聊天會話失敗:', error);
            this.showNotification('載入聊天會話失敗', 'error');
        }
    }

    async createNewChatSession() {
        try {
            const newSession = await API.createChatSession();
            this.showNotification('新聊天會話已建立', 'success');
            this.loadChatSessions();
            this.loadChatSession(newSession.id);
        } catch (error) {
            console.error('建立新聊天會話失敗:', error);
            this.showNotification('建立新聊天會話失敗', 'error');
        }
    }

    async loadChatSession(sessionId) {
        try {
            const session = await API.getChatSession(sessionId);
            this.currentChatSessionId = sessionId;
            document.getElementById('aiChatMessages').innerHTML = ''; // 清空現有訊息
            session.messages.forEach(msg => {
                this.addMessageToChat(msg.content, msg.role);
            });
            this.showNotification(`載入會話: ${session.name}`, 'info');
        } catch (error) {
            console.error('載入聊天會話失敗:', error);
            this.showNotification('載入聊天會話失敗', 'error');
        }
    }

    async deleteChatSession() {
        if (!this.currentChatSessionId) {
            this.showNotification('請選擇一個會話來刪除', 'warning');
            return;
        }
        if (!confirm('確定要刪除此聊天會話嗎？')) {
            return;
        }
        try {
            await API.deleteChatSession(this.currentChatSessionId);
            this.showNotification('聊天會話已刪除', 'success');
            this.currentChatSessionId = null;
            document.getElementById('aiChatMessages').innerHTML = '';
            this.loadChatSessions();
        } catch (error) {
            console.error('刪除聊天會話失敗:', error);
            this.showNotification('刪除聊天會話失敗', 'error');
        }
    }

    async exportChatHistory() {
        if (!this.currentChatSessionId) {
            this.showNotification('請選擇一個會話來匯出', 'warning');
            return;
        }
        try {
            const history = await API.exportChatHistory(this.currentChatSessionId);
            const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat_session_${this.currentChatSessionId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('聊天記錄匯出成功', 'success');
        } catch (error) {
            console.error('匯出聊天記錄失敗:', error);
            this.showNotification('匯出聊天記錄失敗', 'error');
        }
    }

    async importChatHistory(file) {
        if (!file) {
            this.showNotification('請選擇一個文件來匯入', 'warning');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const history = JSON.parse(e.target.result);
                await API.importChatHistory(history);
                this.showNotification('聊天記錄匯入成功', 'success');
                this.loadChatSessions();
            } catch (error) {
                console.error('匯入聊天記錄失敗:', error);
                this.showNotification('匯入聊天記錄失敗', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearChatHistory() {
        if (!this.currentChatSessionId) {
            this.showNotification('請選擇一個會話來清空', 'warning');
            return;
        }
        if (!confirm('確定要清空此聊天會話的所有訊息嗎？')) {
            return;
        }
        try {
            document.getElementById('aiChatMessages').innerHTML = '';
            this.showNotification('聊天記錄已清空', 'success');
        } catch (error) {
            console.error('清空聊天記錄失敗:', error);
            this.showNotification('清空聊天記錄失敗', 'error');
        }
    }

    enableEditMode() {
        const currentSessionName = document.querySelector(`.chat-session-item[data-session-id="${this.currentChatSessionId}"] .session-name`);
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = currentSessionName.textContent;
        editInput.classList.add('edit-session-input');

        currentSessionName.replaceWith(editInput);
        editInput.focus();

        document.getElementById('editSessionBtn').style.display = 'none';
        document.getElementById('saveSessionNameBtn').style.display = 'inline-block';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
    }

    saveSessionName() {
        const editInput = document.querySelector('.edit-session-input');
        const newName = editInput.value;
        if (!newName) {
            this.showNotification('會話名稱不能為空', 'warning');
            return;
        }
        try {
            // 這裡需要呼叫後端API來更新會話名稱
            // await API.updateChatSessionName(this.currentChatSessionId, newName);
            const sessionNameSpan = document.createElement('span');
            sessionNameSpan.classList.add('session-name');
            sessionNameSpan.textContent = newName;
            editInput.replaceWith(sessionNameSpan);
            this.showNotification('會話名稱已更新', 'success');
            this.cancelEditMode();
        } catch (error) {
            console.error('更新會話名稱失敗:', error);
            this.showNotification('更新會話名稱失敗', 'error');
        }
    }

    cancelEditMode() {
        const editInput = document.querySelector('.edit-session-input');
        const sessionNameSpan = document.createElement('span');
        sessionNameSpan.classList.add('session-name');
        sessionNameSpan.textContent = editInput.value; // 或者從原始數據中恢復
        editInput.replaceWith(sessionNameSpan);

        document.getElementById('editSessionBtn').style.display = 'inline-block';
        document.getElementById('saveSessionNameBtn').style.display = 'none';
        document.getElementById('cancelEditBtn').style.display = 'none';
    }

    handleGlobalSearch(query) {
        // 實作全域搜尋邏輯
        console.log('搜尋:', query);
    }
}

// 初始化應用程式
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});




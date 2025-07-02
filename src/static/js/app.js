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
            });
        }, 3000);
        
        // 關閉按鈕事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            notification.addEventListener('transitionend', () => {
                notification.remove();
            });
        });
    }

    handleGlobalSearch(query) {
        console.log('執行全域搜尋:', query);
        // 這裡可以加入搜尋邏輯，例如過濾列表或向後端發送請求
    }

    // AI 助手設定相關功能
    initAISettings() {
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveAISettings();
            });
        }

        const newSessionBtn = document.getElementById('newSessionBtn');
        if (newSessionBtn) {
            newSessionBtn.addEventListener('click', () => {
                this.startNewSession();
            });
        }

        const enableEditBtn = document.getElementById('enableEditBtn');
        if (enableEditBtn) {
            enableEditBtn.addEventListener('click', () => {
                this.enableEditMode();
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
            this.showLoading();
            await API.saveAISettings({
                openai_api_key: openaiApiKey,
                openai_assistant_id: openaiAssistantId,
                cloudinary_cloud_name: cloudinaryCloudName,
                cloudinary_api_key: cloudinaryApiKey,
                cloudinary_api_secret: cloudinaryApiSecret
            });
            this.hideLoading();
            this.showNotification('AI設定儲存成功', 'success');
        } catch (error) {
            this.hideLoading();
            this.showNotification('AI設定儲存失敗', 'error');
            console.error('儲存AI設定失敗:', error);
        }
    }

    startNewSession() {
        console.log('開始新會話');
        // 這裡可以加入開始新會話的邏輯，例如清空聊天記錄或重置AI助手狀態
    }

    enableEditMode() {
        console.log('啟用編輯模式');
        // 這裡可以加入啟用編輯模式的邏輯，例如啟用輸入框或顯示儲存按鈕
    }

    cancelEditMode() {
        console.log('取消編輯模式');
        // 這裡可以加入取消編輯模式的邏輯，例如禁用輸入框或隱藏儲存按鈕
    }
}

// 初始化應用程式
const app = new App();



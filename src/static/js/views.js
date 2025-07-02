// 視圖內容類別
class Views {
    // 儀表板頁面
    static getDashboard() {
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1>七七七科技後台管理系統</h1>
                    <p>歡迎使用智能化的數位營運管理平台</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-content">
                            <h3>待發布貼文</h3>
                            <div class="stat-number">12</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <h3>進行中項目</h3>
                            <div class="stat-number">8</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-content">
                            <h3>本月完成</h3>
                            <div class="stat-number">24</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🤖</div>
                        <div class="stat-content">
                            <h3>AI助手狀態</h3>
                            <div class="stat-number">在線</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <div class="recent-activity">
                        <h2>最近活動</h2>
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon">📝</div>
                                <div class="activity-content">
                                    <h4>新增社群貼文</h4>
                                    <p>AI技術趨勢分析 - 2小時前</p>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">📊</div>
                                <div class="activity-content">
                                    <h4>更新行銷項目</h4>
                                    <p>Q4數位行銷策略 - 4小時前</p>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">✅</div>
                                <div class="activity-content">
                                    <h4>完成營運任務</h4>
                                    <p>系統效能優化 - 1天前</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <h2>快速操作</h2>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="app.loadView('posts-manage')">
                                <span class="btn-icon">📝</span>
                                新增貼文
                            </button>
                            <button class="action-btn" onclick="app.loadView('marketing-manage')">
                                <span class="btn-icon">📊</span>
                                新增行銷項目
                            </button>
                            <button class="action-btn" onclick="app.loadView('operation-manage')">
                                <span class="btn-icon">⚙️</span>
                                新增營運任務
                            </button>
                            <button class="action-btn" onclick="window.aiAssistant && window.aiAssistant.openChat()">
                                <span class="btn-icon">🤖</span>
                                AI助手
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 貼文管理頁面
    static getPostsManage() {
        return `
            <div class="page-header">
                <h1>貼文管理</h1>
                <p>建立和管理多平台社群貼文</p>
            </div>
            
            <div class="form-container">
                <form id="postForm" class="post-form">
                    <div class="form-group">
                        <label for="postTitle">貼文標題 *</label>
                        <input type="text" id="postTitle" name="title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="postTag">標籤 *</label>
                        <select id="postTag" name="tag" required>
                            <option value="">請選擇標籤</option>
                            <option value="資訊">資訊</option>
                            <option value="活動">活動</option>
                            <option value="公告">公告</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="postContent">主要內容 *</label>
                        <textarea id="postContent" name="content" rows="4" required></textarea>
                    </div>
                    
                    <div class="platform-tabs">
                        <div class="tab-buttons">
                            <button type="button" class="tab-btn active" data-platform="facebook">Facebook</button>
                            <button type="button" class="tab-btn" data-platform="instagram">Instagram</button>
                            <button type="button" class="tab-btn" data-platform="tiktok">TikTok</button>
                            <button type="button" class="tab-btn" data-platform="threads">Threads</button>
                            <button type="button" class="tab-btn" data-platform="x">X (Twitter)</button>
                        </div>
                        
                        <div class="tab-content">
                            <div class="tab-pane active" id="facebook-content">
                                <div class="form-group">
                                    <label for="facebookContent">Facebook 專用內容</label>
                                    <textarea id="facebookContent" name="facebook_content" rows="3" placeholder="針對Facebook調整的內容..."></textarea>
                                </div>
                            </div>
                            <div class="tab-pane" id="instagram-content">
                                <div class="form-group">
                                    <label for="instagramContent">Instagram 專用內容</label>
                                    <textarea id="instagramContent" name="instagram_content" rows="3" placeholder="針對Instagram調整的內容..."></textarea>
                                </div>
                            </div>
                            <div class="tab-pane" id="tiktok-content">
                                <div class="form-group">
                                    <label for="tiktokContent">TikTok 專用內容</label>
                                    <textarea id="tiktokContent" name="tiktok_content" rows="3" placeholder="針對TikTok調整的內容..."></textarea>
                                </div>
                            </div>
                            <div class="tab-pane" id="threads-content">
                                <div class="form-group">
                                    <label for="threadsContent">Threads 專用內容</label>
                                    <textarea id="threadsContent" name="threads_content" rows="3" placeholder="針對Threads調整的內容..."></textarea>
                                </div>
                            </div>
                            <div class="tab-pane" id="x-content">
                                <div class="form-group">
                                    <label for="xContent">X (Twitter) 專用內容</label>
                                    <textarea id="xContent" name="x_content" rows="3" placeholder="針對X調整的內容..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="scheduleTime">排程時間 *</label>
                            <input type="datetime-local" id="scheduleTime" name="schedule_time" required>
                        </div>
                        <div class="form-group">
                            <label for="startTime">開始時間</label>
                            <input type="datetime-local" id="startTime" name="start_time">
                        </div>
                        <div class="form-group">
                            <label for="endTime">結束時間</label>
                            <input type="datetime-local" id="endTime" name="end_time">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="app.previewPost()">預覽貼文</button>
                        <button type="submit" class="btn btn-primary">儲存貼文</button>
                    </div>
                </form>
            </div>
        `;
    }
    
    // 貼文列表頁面
    static getPostsList() {
        return `
            <div class="page-header">
                <h1>貼文列表</h1>
                <p>管理所有社群貼文</p>
            </div>
            
            <div class="filters">
                <div class="filter-group">
                    <select id="statusFilter">
                        <option value="">所有狀態</option>
                        <option value="draft">尚未發佈</option>
                        <option value="published">已發佈</option>
                    </select>
                    <select id="tagFilter">
                        <option value="">所有標籤</option>
                        <option value="資訊">資訊</option>
                        <option value="活動">活動</option>
                        <option value="公告">公告</option>
                    </select>
                    <input type="text" id="searchInput" placeholder="搜尋貼文...">
                </div>
            </div>
            
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>標題</th>
                            <th>作者</th>
                            <th>排程時間</th>
                            <th>狀態</th>
                            <th>標籤</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="postsTableBody">
                        <tr>
                            <td colspan="6" class="loading">載入中...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // 貼文總覽頁面
    static getPostsOverview() {
        return `
            <div class="page-header">
                <h1>貼文總覽</h1>
                <p>視覺化管理貼文排程</p>
            </div>
            
            <div class="view-controls">
                <div class="view-tabs">
                    <button class="tab-btn active" data-view="calendar">日曆視圖</button>
                    <button class="tab-btn" data-view="gantt">甘特圖</button>
                </div>
            </div>
            
            <div class="overview-container">
                <div id="calendarView" class="view-content active">
                    <div class="calendar-header">
                        <button class="nav-btn" id="prevMonth">&lt;</button>
                        <h2 id="currentMonth">2024年7月</h2>
                        <button class="nav-btn" id="nextMonth">&gt;</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-weekdays">
                            <div class="weekday">日</div>
                            <div class="weekday">一</div>
                            <div class="weekday">二</div>
                            <div class="weekday">三</div>
                            <div class="weekday">四</div>
                            <div class="weekday">五</div>
                            <div class="weekday">六</div>
                        </div>
                        <div class="calendar-days" id="calendarDays">
                            <!-- 日曆日期將由JavaScript動態生成 -->
                        </div>
                    </div>
                </div>
                
                <div id="ganttView" class="view-content">
                    <div class="gantt-container">
                        <div class="gantt-header">
                            <div class="gantt-timeline">
                                <!-- 甘特圖時間軸 -->
                            </div>
                        </div>
                        <div class="gantt-body">
                            <!-- 甘特圖內容 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // AI助手設定頁面
    static getAISettings() {
        return `
            <div class="page-header">
                <h1>AI助手設定</h1>
                <p>配置AI服務的API密鑰和相關設定</p>
            </div>
            
            <div class="ai-settings-container">
                <div class="settings-tabs">
                    <button class="tab-btn active" data-tab="openai">OpenAI</button>
                    <button class="tab-btn" data-tab="cloudinary">Cloudinary</button>
                    <button class="tab-btn" data-tab="github">GitHub</button>
                    <button class="tab-btn" data-tab="turso">Turso</button>
                    <button class="tab-btn" data-tab="general">一般設定</button>
                </div>
                
                <form id="aiSettingsForm" class="settings-form">
                    <!-- OpenAI 設定 -->
                    <div class="tab-content active" id="openai-tab">
                        <div class="settings-section">
                            <h3>OpenAI 配置</h3>
                            <div class="form-group">
                                <label for="openaiApiKey">OpenAI API Key *</label>
                                <div class="input-with-status">
                                    <input type="password" id="openaiApiKey" name="openai_api_key" placeholder="sk-...">
                                    <span class="status-indicator" id="openaiStatus"></span>
                                </div>
                                <small class="form-help">請輸入您的OpenAI API密鑰，格式：sk-...</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="openaiAssistantId">OpenAI Assistant ID</label>
                                <div class="input-with-status">
                                    <input type="text" id="openaiAssistantId" name="openai_assistant_id" placeholder="asst-...">
                                    <span class="status-indicator" id="assistantStatus"></span>
                                </div>
                                <small class="form-help">您的OpenAI Assistant ID，格式：asst-...</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="openaiModel">預設模型</label>
                                <select id="openaiModel" name="openai_model">
                                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                </select>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="app.testOpenAI()">測試連接</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Cloudinary 設定 -->
                    <div class="tab-content" id="cloudinary-tab">
                        <div class="settings-section">
                            <h3>Cloudinary 配置</h3>
                            <div class="form-group">
                                <label for="cloudinaryCloudName">Cloud Name *</label>
                                <input type="text" id="cloudinaryCloudName" name="cloudinary_cloud_name" placeholder="your-cloud-name">
                                <small class="form-help">您的Cloudinary雲端名稱</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="cloudinaryApiKey">API Key *</label>
                                <input type="text" id="cloudinaryApiKey" name="cloudinary_api_key" placeholder="123456789012345">
                                <small class="form-help">您的Cloudinary API Key</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="cloudinaryApiSecret">API Secret *</label>
                                <div class="input-with-status">
                                    <input type="password" id="cloudinaryApiSecret" name="cloudinary_api_secret" placeholder="your-api-secret">
                                    <span class="status-indicator" id="cloudinaryStatus"></span>
                                </div>
                                <small class="form-help">您的Cloudinary API Secret</small>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="app.testCloudinary()">測試連接</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- GitHub 設定 -->
                    <div class="tab-content" id="github-tab">
                        <div class="settings-section">
                            <h3>GitHub 配置</h3>
                            <div class="form-group">
                                <label for="githubToken">GitHub Token *</label>
                                <div class="input-with-status">
                                    <input type="password" id="githubToken" name="github_token" placeholder="ghp_...">
                                    <span class="status-indicator" id="githubStatus"></span>
                                </div>
                                <small class="form-help">您的GitHub Personal Access Token，格式：ghp_...</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="githubUsername">GitHub 用戶名</label>
                                <input type="text" id="githubUsername" name="github_username" placeholder="your-username">
                                <small class="form-help">您的GitHub用戶名</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="githubRepo">預設Repository</label>
                                <input type="text" id="githubRepo" name="github_repo" placeholder="repository-name">
                                <small class="form-help">預設的Repository名稱</small>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="app.testGitHub()">測試連接</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Turso 設定 -->
                    <div class="tab-content" id="turso-tab">
                        <div class="settings-section">
                            <h3>Turso 資料庫配置</h3>
                            <div class="form-group">
                                <label for="tursoDatabaseUrl">Database URL *</label>
                                <input type="text" id="tursoDatabaseUrl" name="turso_database_url" placeholder="libsql://...">
                                <small class="form-help">您的Turso資料庫URL</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="tursoAuthToken">Auth Token *</label>
                                <div class="input-with-status">
                                    <input type="password" id="tursoAuthToken" name="turso_auth_token" placeholder="your-auth-token">
                                    <span class="status-indicator" id="tursoStatus"></span>
                                </div>
                                <small class="form-help">您的Turso認證Token</small>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="app.testTurso()">測試連接</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 一般設定 -->
                    <div class="tab-content" id="general-tab">
                        <div class="settings-section">
                            <h3>功能開關</h3>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="aiEnabled" name="ai_enabled">
                                    <span class="checkmark"></span>
                                    啟用AI助手功能
                                </label>
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="contentEditingEnabled" name="content_editing_enabled">
                                    <span class="checkmark"></span>
                                    啟用AI內容編輯功能
                                </label>
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="imageGenerationEnabled" name="image_generation_enabled">
                                    <span class="checkmark"></span>
                                    啟用AI圖片生成功能
                                </label>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3>系統操作</h3>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="app.testAllConnections()">測試所有連接</button>
                                <button type="button" class="btn btn-warning" onclick="app.exportAISettings()">匯出設定</button>
                                <button type="button" class="btn btn-danger" onclick="app.resetAISettings()">重置設定</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions main-actions">
                        <button type="button" class="btn btn-secondary" onclick="app.loadAISettings()">重新載入</button>
                        <button type="submit" class="btn btn-primary">儲存設定</button>
                    </div>
                </form>
            </div>
        `;
    }
    
    // 行銷項目管理頁面
    static getMarketingManage() {
        return `
            <div class="page-header">
                <h1>行銷項目管理</h1>
                <p>建立和管理行銷活動項目</p>
            </div>
            
            <div class="form-container">
                <form id="marketingForm" class="marketing-form">
                    <div class="form-group">
                        <label for="marketingTitle">項目標題 *</label>
                        <input type="text" id="marketingTitle" name="title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="marketingTag">分類標籤 *</label>
                        <select id="marketingTag" name="tag" required>
                            <option value="">請選擇標籤</option>
                            <option value="數位廣告">數位廣告</option>
                            <option value="內容行銷">內容行銷</option>
                            <option value="社群經營">社群經營</option>
                            <option value="活動企劃">活動企劃</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="marketingContent">項目內容 *</label>
                        <textarea id="marketingContent" name="content" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="marketingStartTime">開始時間 *</label>
                            <input type="datetime-local" id="marketingStartTime" name="start_time" required>
                        </div>
                        <div class="form-group">
                            <label for="marketingEndTime">結束時間</label>
                            <input type="datetime-local" id="marketingEndTime" name="end_time">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">儲存項目</button>
                    </div>
                </form>
            </div>
        `;
    }
    
    // 營運項目管理頁面
    static getOperationManage() {
        return `
            <div class="page-header">
                <h1>營運項目管理</h1>
                <p>建立和管理營運任務</p>
            </div>
            
            <div class="form-container">
                <form id="operationForm" class="operation-form">
                    <div class="form-group">
                        <label for="operationTitle">任務標題 *</label>
                        <input type="text" id="operationTitle" name="title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="operationTag">標籤 *</label>
                        <select id="operationTag" name="tag" required>
                            <option value="">請選擇標籤</option>
                            <option value="一般">一般</option>
                            <option value="活動">活動</option>
                            <option value="測試">測試</option>
                            <option value="會議">會議</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="operationContent">任務內容 *</label>
                        <textarea id="operationContent" name="content" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="operationStartTime">開始時間 *</label>
                            <input type="datetime-local" id="operationStartTime" name="start_time" required>
                        </div>
                        <div class="form-group">
                            <label for="operationEndTime">結束時間</label>
                            <input type="datetime-local" id="operationEndTime" name="end_time">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="operationCompleted" name="completed">
                            <span class="checkmark"></span>
                            標記為已完成
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">儲存任務</button>
                    </div>
                </form>
            </div>
        `;
    }
}


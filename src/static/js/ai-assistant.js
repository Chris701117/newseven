// AI助手類別
class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.currentSessionId = null;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.createSession();
    }
    
    bindEvents() {
        // 浮動按鈕點擊事件
        const fab = document.getElementById('aiAssistantFab');
        fab.addEventListener('click', () => this.toggleChat());
        
        // 聊天視窗控制按鈕
        const minimizeBtn = document.getElementById('aiChatMinimize');
        const closeBtn = document.getElementById('aiChatClose');
        
        minimizeBtn.addEventListener('click', () => this.minimizeChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        
        // 發送訊息
        const sendBtn = document.getElementById('aiChatSend');
        const input = document.getElementById('aiChatInput');
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 文件上傳事件
        this.bindFileUploadEvents();
        
        // 拖放事件
        this.bindDragDropEvents();
        
        // 快速操作按鈕
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }
    
    toggleChat() {
        const chatWindow = document.getElementById('aiChatWindow');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        const chatWindow = document.getElementById('aiChatWindow');
        chatWindow.classList.add('active');
        chatWindow.classList.remove('minimized');
        this.isOpen = true;
        this.isMinimized = false;
        
        // 聚焦到輸入框
        setTimeout(() => {
            document.getElementById('aiChatInput').focus();
        }, 100);
    }
    
    closeChat() {
        const chatWindow = document.getElementById('aiChatWindow');
        chatWindow.classList.remove('active');
        this.isOpen = false;
        this.isMinimized = false;
    }
    
    minimizeChat() {
        const chatWindow = document.getElementById('aiChatWindow');
        chatWindow.classList.toggle('minimized');
        this.isMinimized = !this.isMinimized;
    }
    
    async createSession() {
        try {
            const response = await fetch('/api/chat/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: 'current_user',
                    title: `AI助手會話 ${new Date().toLocaleString()}`
                })
            });
            
            const result = await response.json();
            if (result.success) {
                this.currentSessionId = result.data.session_id;
            }
        } catch (error) {
            console.error('建立聊天會話失敗:', error);
        }
    }
    
    async sendMessage() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        
        if (!message && this.getUploadedFiles().length === 0) return;
        if (!this.currentSessionId) return;
        
        // 獲取上傳的文件
        const uploadedFiles = this.getUploadedFiles();
        
        // 檢測Google Drive連結
        const gdriveLinks = this.detectGoogleDriveLinks(message);
        
        // 清空輸入框和上傳文件
        input.value = '';
        this.clearUploadedFiles();
        
        // 顯示用戶訊息
        this.addUserMessage(message, uploadedFiles, gdriveLinks);
        
        // 檢查是否為編輯指令
        if (this.editMode || await this.handleEditCommand(message)) {
            return;
        }
        
        // 顯示載入指示器
        this.showTypingIndicator();
        
        // 禁用發送按鈕
        const sendBtn = document.getElementById('aiChatSend');
        sendBtn.disabled = true;
        
        try {
            // 準備發送的數據
            const messageData = {
                message: message,
                files: uploadedFiles,
                gdrive_links: gdriveLinks
            };
            
            const response = await fetch(`/api/chat/sessions/${this.currentSessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });
            
            const result = await response.json();
            
            // 移除載入指示器
            this.hideTypingIndicator();
            
            if (result.success) {
                // 顯示AI回應
                this.addAIMessage(result.data.ai_response.content);
            } else {
                this.addAIMessage('抱歉，我暫時無法回應您的問題，請稍後再試。');
            }
        } catch (error) {
            console.error('發送訊息失敗:', error);
            this.hideTypingIndicator();
            this.addAIMessage('網路連接出現問題，請檢查您的網路連接後重試。');
        } finally {
            // 重新啟用發送按鈕
            sendBtn.disabled = false;
        }
    }
    
    addUserMessage(message, files = [], gdriveLinks = []) {
        const messagesContainer = document.getElementById('aiChatMessages');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'user-message';
        
        let messageContent = '';
        
        // 添加文字訊息
        if (message) {
            messageContent += `<div class="message-text">${this.formatMessage(message)}</div>`;
        }
        
        // 添加上傳的文件
        if (files.length > 0) {
            messageContent += '<div class="message-files">';
            files.forEach(file => {
                if (file.type && file.type.startsWith('image/')) {
                    messageContent += `
                        <div class="message-file image">
                            <img src="${file.url}" alt="${file.name}" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
                            <div class="file-name">${file.name}</div>
                        </div>
                    `;
                } else {
                    messageContent += `
                        <div class="message-file">
                            <i class="fas fa-file"></i>
                            <span>${file.name}</span>
                        </div>
                    `;
                }
            });
            messageContent += '</div>';
        }
        
        // 添加Google Drive連結
        if (gdriveLinks.length > 0) {
            messageContent += '<div class="message-gdrive-links">';
            gdriveLinks.forEach(link => {
                messageContent += `
                    <div class="gdrive-link-preview">
                        <i class="fab fa-google-drive gdrive-icon"></i>
                        <div class="gdrive-info">
                            <div class="gdrive-name">Google Drive 檔案</div>
                            <div class="gdrive-url">${link}</div>
                        </div>
                    </div>
                `;
            });
            messageContent += '</div>';
        }
        
        messageElement.innerHTML = `
            <div class="user-message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-message-content">
                ${messageContent}
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    addAIMessage(message) {
        const messagesContainer = document.getElementById('aiChatMessages');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'ai-message';
        messageElement.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                ${this.formatMessage(message)}
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('aiChatMessages');
        
        const typingElement = document.createElement('div');
        typingElement.className = 'ai-message typing-indicator';
        typingElement.innerHTML = `
            <div class="ai-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-typing-indicator">
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            </div>
        `;
        
        messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    formatMessage(message) {
        // 簡單的訊息格式化
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('aiChatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    async handleQuickAction(action) {
        const prompts = {
            'generate-post': '請幫我生成一篇適合Facebook的社群貼文，主題可以是科技趨勢或產品介紹。',
            'marketing-idea': '請提供一些創新的數位行銷策略建議，適合科技公司使用。',
            'operation-help': '請說明如何有效管理營運項目，包括時程規劃和團隊協作。'
        };
        
        const prompt = prompts[action];
        if (prompt) {
            // 將提示詞填入輸入框
            const input = document.getElementById('aiChatInput');
            input.value = prompt;
            
            // 自動發送
            this.sendMessage();
        }
    }
    
    // 內容生成功能
    async generateContent(type, prompt, platform = 'facebook') {
        try {
            const response = await fetch('/api/chat/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    prompt: prompt,
                    platform: platform
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                return result.data.content;
            } else {
                throw new Error(result.error || '內容生成失敗');
            }
        } catch (error) {
            console.error('內容生成錯誤:', error);
            throw error;
        }
    }
    
    // 將生成的內容填入表單
    fillGeneratedContent(content, targetForm = 'postForm') {
        const form = document.getElementById(targetForm);
        if (!form) return;
        
        // 嘗試填入主要內容欄位
        const contentField = form.querySelector('textarea[name="content"]') || 
                           form.querySelector('#content') ||
                           form.querySelector('textarea');
        
        if (contentField) {
            contentField.value = content;
            
            // 觸發變更事件
            contentField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
}

// 全域AI助手實例
let aiAssistant;

// 當頁面載入完成時初始化AI助手
document.addEventListener('DOMContentLoaded', () => {
    aiAssistant = new AIAssistant();
});


    // AI內容編輯功能
    async enableEditMode() {
        this.editMode = true;
        this.addMessage('🔧 已啟用編輯模式！我現在可以幫您修改網站內容。\n\n可用指令：\n• "編輯貼文 [ID]" - 修改指定貼文\n• "新增貼文" - 建立新貼文\n• "編輯任務 [ID]" - 修改任務\n• "查看可編輯內容" - 顯示所有可編輯項目', 'assistant');
    }
    
    async disableEditMode() {
        this.editMode = false;
        this.addMessage('✅ 已關閉編輯模式。', 'assistant');
    }
    
    async handleEditCommand(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('編輯模式') || lowerMessage.includes('編輯功能')) {
            await this.enableEditMode();
            return true;
        }
        
        if (lowerMessage.includes('關閉編輯') || lowerMessage.includes('退出編輯')) {
            await this.disableEditMode();
            return true;
        }
        
        if (lowerMessage.includes('查看可編輯') || lowerMessage.includes('可編輯內容')) {
            await this.showEditableContent();
            return true;
        }
        
        if (lowerMessage.includes('編輯貼文')) {
            const postId = this.extractId(message);
            await this.editPost(postId);
            return true;
        }
        
        if (lowerMessage.includes('新增貼文') || lowerMessage.includes('建立貼文')) {
            await this.createNewPost(message);
            return true;
        }
        
        if (lowerMessage.includes('編輯任務')) {
            const taskId = this.extractId(message);
            await this.editTask(taskId);
            return true;
        }
        
        return false;
    }
    
    extractId(message) {
        // 簡單的ID提取邏輯
        const matches = message.match(/\b\w+_\d+\b/);
        return matches ? matches[0] : null;
    }
    
    async showEditableContent() {
        try {
            const response = await fetch('/api/ai-editor/get-editable-content');
            const data = await response.json();
            
            if (data.success) {
                let contentList = '📋 **可編輯內容列表：**\n\n';
                
                if (data.data.posts && data.data.posts.length > 0) {
                    contentList += '**📝 貼文：**\n';
                    data.data.posts.forEach(post => {
                        contentList += `• ${post.id}: ${post.title} (${post.status})\n`;
                    });
                    contentList += '\n';
                }
                
                if (data.data.marketing_tasks && data.data.marketing_tasks.length > 0) {
                    contentList += '**📊 行銷任務：**\n';
                    data.data.marketing_tasks.forEach(task => {
                        contentList += `• ${task.id}: ${task.title} (${task.status})\n`;
                    });
                    contentList += '\n';
                }
                
                if (data.data.operation_tasks && data.data.operation_tasks.length > 0) {
                    contentList += '**⚙️ 營運任務：**\n';
                    data.data.operation_tasks.forEach(task => {
                        contentList += `• ${task.id}: ${task.title} (${task.status})\n`;
                    });
                }
                
                contentList += '\n💡 使用 "編輯 [ID]" 來修改特定項目';
                
                this.addMessage(contentList, 'assistant');
            }
        } catch (error) {
            console.error('獲取可編輯內容失敗:', error);
            this.addMessage('❌ 無法獲取可編輯內容列表', 'assistant');
        }
    }
    
    async editPost(postId) {
        if (!postId) {
            this.addMessage('❌ 請指定要編輯的貼文ID，例如：編輯貼文 post_1', 'assistant');
            return;
        }
        
        // 顯示編輯表單
        const editForm = `
            <div class="ai-edit-form">
                <h4>🔧 編輯貼文: ${postId}</h4>
                <div class="form-group">
                    <label>標題：</label>
                    <input type="text" id="edit-title-${postId}" placeholder="輸入新標題">
                </div>
                <div class="form-group">
                    <label>內容：</label>
                    <textarea id="edit-content-${postId}" placeholder="輸入新內容"></textarea>
                </div>
                <div class="form-actions">
                    <button onclick="aiAssistant.applyPostEdit('${postId}')" class="btn-primary">應用修改</button>
                    <button onclick="aiAssistant.cancelEdit()" class="btn-secondary">取消</button>
                </div>
            </div>
        `;
        
        this.addMessage(editForm, 'assistant', true);
    }
    
    async applyPostEdit(postId) {
        const title = document.getElementById(`edit-title-${postId}`).value;
        const content = document.getElementById(`edit-content-${postId}`).value;
        
        if (!title && !content) {
            this.addMessage('❌ 請至少填寫標題或內容', 'assistant');
            return;
        }
        
        try {
            const response = await fetch('/api/ai-editor/edit-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    post_id: postId,
                    changes: {
                        title: title,
                        content: content
                    }
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage(`✅ ${data.message}\n\n更新內容：\n• 標題：${data.data.title}\n• 內容：${data.data.content.substring(0, 100)}...`, 'assistant');
            } else {
                this.addMessage(`❌ 編輯失敗：${data.error}`, 'assistant');
            }
        } catch (error) {
            console.error('編輯貼文失敗:', error);
            this.addMessage('❌ 編輯貼文時發生錯誤', 'assistant');
        }
    }
    
    async createNewPost(message) {
        // 從訊息中提取貼文內容
        const content = message.replace(/新增貼文|建立貼文/gi, '').trim();
        
        if (!content) {
            this.addMessage('❌ 請提供貼文內容，例如：新增貼文 關於AI技術的最新趨勢', 'assistant');
            return;
        }
        
        try {
            const response = await fetch('/api/ai-editor/create-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: content.substring(0, 50) + '...',
                    content: content,
                    tags: ['AI生成']
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage(`✅ ${data.message}\n\n新貼文詳情：\n• ID：${data.data.id}\n• 標題：${data.data.title}\n• 狀態：${data.data.status}`, 'assistant');
            } else {
                this.addMessage(`❌ 建立失敗：${data.error}`, 'assistant');
            }
        } catch (error) {
            console.error('建立貼文失敗:', error);
            this.addMessage('❌ 建立貼文時發生錯誤', 'assistant');
        }
    }
    
    cancelEdit() {
        this.addMessage('✅ 已取消編輯操作', 'assistant');
    }
    
    addMessage(content, sender, isHTML = false) {
        const messagesContainer = document.getElementById('aiChatMessages');
        
        const messageElement = document.createElement('div');
        messageElement.className = sender === 'user' ? 'user-message' : 'ai-message';
        
        const avatar = sender === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';
        
        const messageContent = isHTML ? content : this.formatMessage(content);
        
        messageElement.innerHTML = `
            <div class="${sender}-message-avatar">
                ${avatar}
            </div>
            <div class="${sender}-message-content">
                ${messageContent}
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    // 文件上傳相關方法
    bindFileUploadEvents() {
        const uploadBtn = document.getElementById('aiChatUploadBtn');
        const imageBtn = document.getElementById('aiChatImageBtn');
        const fileInput = document.getElementById('aiChatFileInput');
        
        // 上傳按鈕點擊事件
        uploadBtn.addEventListener('click', () => {
            fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt';
            fileInput.click();
        });
        
        // 圖片按鈕點擊事件
        imageBtn.addEventListener('click', () => {
            fileInput.accept = 'image/*';
            fileInput.click();
        });
        
        // 文件選擇事件
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
    }
    
    bindDragDropEvents() {
        const inputContainer = document.querySelector('.ai-chat-input-container');
        
        inputContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            inputContainer.classList.add('drag-over');
        });
        
        inputContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            inputContainer.classList.remove('drag-over');
        });
        
        inputContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            inputContainer.classList.remove('drag-over');
            this.handleFileSelection(e.dataTransfer.files);
        });
    }
    
    async handleFileSelection(files) {
        const previewContainer = document.getElementById('uploadedFilesPreview');
        
        for (let file of files) {
            // 檢查文件大小（限制10MB）
            if (file.size > 10 * 1024 * 1024) {
                this.addMessage(`❌ 檔案 "${file.name}" 太大，請選擇小於10MB的檔案`, 'assistant');
                continue;
            }
            
            // 創建預覽元素
            const previewItem = this.createFilePreview(file);
            previewContainer.appendChild(previewItem);
            
            // 上傳文件
            await this.uploadFile(file, previewItem);
        }
    }
    
    createFilePreview(file) {
        const previewItem = document.createElement('div');
        previewItem.className = 'file-preview-item';
        
        if (file.type.startsWith('image/')) {
            previewItem.classList.add('image');
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            previewItem.appendChild(img);
        }
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-size">${this.formatFileSize(file.size)}</div>
        `;
        previewItem.appendChild(fileInfo);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', () => {
            previewItem.remove();
        });
        previewItem.appendChild(removeBtn);
        
        return previewItem;
    }
    
    async uploadFile(file, previewItem) {
        try {
            previewItem.classList.add('file-uploading');
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('session_id', this.currentSessionId);
            
            const response = await fetch('/api/upload-file', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 儲存文件資訊到預覽元素
                previewItem.dataset.fileUrl = result.data.url;
                previewItem.dataset.fileType = result.data.type;
                previewItem.dataset.fileName = file.name;
                
                previewItem.classList.remove('file-uploading');
                this.addMessage(`✅ 檔案 "${file.name}" 上傳成功`, 'assistant');
            } else {
                previewItem.remove();
                this.addMessage(`❌ 檔案 "${file.name}" 上傳失敗：${result.error}`, 'assistant');
            }
        } catch (error) {
            console.error('文件上傳失敗:', error);
            previewItem.remove();
            this.addMessage(`❌ 檔案 "${file.name}" 上傳失敗`, 'assistant');
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    detectGoogleDriveLinks(text) {
        const gdriveRegex = /https:\/\/drive\.google\.com\/[^\s]+/g;
        return text.match(gdriveRegex) || [];
    }
    
    async processGoogleDriveLink(url) {
        try {
            const response = await fetch('/api/process-gdrive-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    session_id: this.currentSessionId
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('處理Google Drive連結失敗:', error);
            return { success: false, error: '處理連結時發生錯誤' };
        }
    }
    
    getUploadedFiles() {
        const previewItems = document.querySelectorAll('.file-preview-item');
        const files = [];
        
        previewItems.forEach(item => {
            if (item.dataset.fileUrl) {
                files.push({
                    url: item.dataset.fileUrl,
                    type: item.dataset.fileType,
                    name: item.dataset.fileName
                });
            }
        });
        
        return files;
    }
    
    clearUploadedFiles() {
        const previewContainer = document.getElementById('uploadedFilesPreview');
        previewContainer.innerHTML = '';
    }
}


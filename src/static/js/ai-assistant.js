// 主應用程式類別
class AIAssistant {
    constructor() {
        this.chatWindow = document.getElementById("aiChatWindow");
        this.chatMessages = document.getElementById("aiChatMessages");
        this.chatInput = document.getElementById("aiChatInput");
        this.chatSendBtn = document.getElementById("aiChatSend");
        this.aiAssistantFab = document.getElementById("aiAssistantFab");
        this.aiChatMinimize = document.getElementById("aiChatMinimize");
        this.aiChatClose = document.getElementById("aiChatClose");
        this.uploadedFilesPreview = document.getElementById("uploadedFilesPreview");
        this.aiChatFileInput = document.getElementById("aiChatFileInput");
        this.aiChatUploadBtn = document.getElementById("aiChatUploadBtn");
        this.aiChatImageBtn = document.getElementById("aiChatImageBtn");
        this.quickActionBtns = document.querySelectorAll(".quick-action-btn");

        this.currentChatSessionId = null;
        this.uploadedFiles = [];
        this.editMode = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialMessage();
    }

    bindEvents() {
        if (this.aiAssistantFab) {
            this.aiAssistantFab.addEventListener("click", () => this.toggleChatWindow());
        }
        if (this.aiChatMinimize) {
            this.aiChatMinimize.addEventListener("click", () => this.minimizeChatWindow());
        }
        if (this.aiChatClose) {
            this.aiChatClose.addEventListener("click", () => this.closeChatWindow());
        }
        if (this.chatSendBtn) {
            this.chatSendBtn.addEventListener("click", () => this.sendMessage());
        }
        if (this.chatInput) {
            this.chatInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            this.chatInput.addEventListener("paste", (e) => this.handlePaste(e));
            this.chatInput.addEventListener("drop", (e) => this.handleDrop(e));
        }
        if (this.aiChatUploadBtn) {
            this.aiChatUploadBtn.addEventListener("click", () => this.aiChatFileInput.click());
        }
        if (this.aiChatImageBtn) {
            this.aiChatImageBtn.addEventListener("click", () => {
                this.aiChatFileInput.setAttribute("accept", "image/*");
                this.aiChatFileInput.click();
            });
        }
        if (this.aiChatFileInput) {
            this.aiChatFileInput.addEventListener("change", (e) => this.handleFileSelect(e));
        }

        this.quickActionBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    toggleChatWindow() {
        this.chatWindow.classList.toggle("active");
        if (this.chatWindow.classList.contains("active")) {
            this.chatInput.focus();
        }
    }

    minimizeChatWindow() {
        this.chatWindow.classList.add("minimized");
        this.chatWindow.classList.remove("active");
    }

    closeChatWindow() {
        this.chatWindow.classList.remove("active");
        this.chatWindow.classList.remove("minimized");
    }

    loadInitialMessage() {
        if (this.chatMessages.children.length === 0) {
            this.addMessage(
                `您好！我是七七七科技的AI助手，可以幫助您：\n\n• 📝 撰寫社群貼文內容\n• 📊 規劃行銷活動\n• ⚙️ 協助營運管理\n• ❓ 回答系統使用問題\n\n有什麼可以幫助您的嗎？`,
                "assistant"
            );
        }
    }

    addMessage(text, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);

        const avatarElement = document.createElement("div");
        avatarElement.classList.add("avatar");
        avatarElement.innerHTML = sender === "user" ? 
            `<i class="fas fa-user"></i>` : 
            `<i class="fas fa-robot"></i>`;

        const contentElement = document.createElement("div");
        contentElement.classList.add("content");
        // 檢查 marked 是否存在，如果不存在則直接使用 text
        contentElement.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;

        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message && this.uploadedFiles.length === 0) return;

        this.addMessage(message, "user");
        this.chatInput.value = "";
        this.clearUploadedFiles();

        try {
            this.addMessage("思考中...", "assistant");
            const response = await API.sendAIChatMessage(this.currentChatSessionId, message, this.uploadedFiles);
            this.chatMessages.lastChild.remove(); // 移除“思考中...”
            this.addMessage(response.reply, "assistant");
            this.currentChatSessionId = response.session_id; // 更新會話ID
        } catch (error) {
            console.error("發送訊息失敗:", error);
            this.chatMessages.lastChild.remove();
            this.addMessage("抱歉，AI助手暫時無法回應。請稍後再試。", "assistant");
        }
    }

    handlePaste(e) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.kind === "file") {
                const file = item.getAsFile();
                this.addFileToUpload(file);
                e.preventDefault();
            }
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        for (const file of files) {
            this.addFileToUpload(file);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        for (const file of files) {
            this.addFileToUpload(file);
        }
        e.target.value = null; // 清空input，以便再次選擇相同文件
    }

    addFileToUpload(file) {
        if (this.uploadedFiles.length >= 5) {
            alert("最多只能上傳5個文件。");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const filePreview = document.createElement("div");
            filePreview.classList.add("file-preview");
            filePreview.dataset.name = file.name;

            let previewContent = "";
            if (file.type.startsWith("image/")) {
                previewContent = `<img src="${e.target.result}" alt="${file.name}">`;
            } else {
                previewContent = `<i class="fas fa-file"></i><span>${file.name}</span>`;
            }

            filePreview.innerHTML = `
                ${previewContent}
                <button class="remove-file-btn"><i class="fas fa-times"></i></button>
            `;
            this.uploadedFilesPreview.appendChild(filePreview);

            filePreview.querySelector(".remove-file-btn").addEventListener("click", () => {
                this.removeFileFromUpload(file.name);
                filePreview.remove();
            });
        };
        reader.readAsDataURL(file);

        this.uploadedFiles.push(file);
        this.updateUploadAreaVisibility();
    }

    removeFileFromUpload(fileName) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== fileName);
        this.updateUploadAreaVisibility();
    }

    clearUploadedFiles() {
        this.uploadedFiles = [];
        this.uploadedFilesPreview.innerHTML = "";
        this.updateUploadAreaVisibility();
    }

    updateUploadAreaVisibility() {
        if (this.uploadedFiles.length > 0) {
            this.uploadedFilesPreview.style.display = "flex";
        } else {
            this.uploadedFilesPreview.style.display = "none";
        }
    }

    handleQuickAction(action) {
        let message = "";
        switch (action) {
            case "generate-post":
                message = "請幫我撰寫一篇關於 [主題] 的社群貼文，風格為 [風格]，包含 [關鍵字]";
                break;
            case "marketing-idea":
                message = "請為 [產品/服務] 提供一些行銷建議，目標客群是 [客群]";
                break;
            case "operation-help":
                message = "我需要關於 [營運問題] 的協助";
                break;
        }
        if (message) {
            this.chatInput.value = message;
            this.chatInput.focus();
        }
    }

    // AI內容編輯功能
    async enableEditMode() {
        this.editMode = true;
        this.addMessage("🔧 已啟用編輯模式！我現在可以幫您修改網站內容。\n\n可用指令：\n• \"編輯貼文 [ID]\" - 修改指定貼文\n• \"新增貼文\" - 建立新貼文\n• \"編輯任務 [ID]\" - 修改任務\n• \"查看可編輯內容\" - 顯示所有可編輯項目", "assistant");
    }
    
    async disableEditMode() {
        this.editMode = false;
        this.addMessage("✅ 已關閉編輯模式。", "assistant");
    }
    
    async handleEditCommand(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes("編輯模式") || lowerMessage.includes("編輯功能")) {
            await this.enableEditMode();
            return true;
        }
        
        if (lowerMessage.includes("關閉編輯") || lowerMessage.includes("退出編輯")) {
            await this.disableEditMode();
            return true;
        }

        // 這裡可以添加更多編輯模式下的指令處理邏輯
        // 例如：解析 \"編輯貼文 [ID]\"，然後呼叫後端API
        this.addMessage("在編輯模式下，請使用具體指令，例如：\"編輯貼文 [ID]\" 或 \"新增貼文\"。", "assistant");
        return true;
    }
}

// 全域AI助手實例
let aiAssistant;

// 當頁面載入完成時初始化AI助手
document.addEventListener("DOMContentLoaded", () => {
    aiAssistant = new AIAssistant();
});




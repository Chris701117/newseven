# 七七七科技後台系統 GitHub + Render 部署指南

## 1. 引言

本部署指南旨在為「七七七科技後台系統」提供一套詳細且全面的部署流程，使其能夠從開發環境順利遷移至生產環境。我們將利用 GitHub 進行版本控制，並透過 Render 平台實現自動化部署與託管。

**作者：** Manus AI
**日期：** 2025年7月2日

## 2. 前置準備

### 📋 必要帳戶
- [ ] GitHub 帳戶
- [ ] Render 帳戶（免費方案即可開始）
- [ ] OpenAI 帳戶（API Key 和 Assistant ID）
- [ ] Cloudinary 帳戶
- [ ] Turso 帳戶（可選，用於生產資料庫）

### ✅ 必要資訊
- [ ] GitHub Repository URL: `https://github.com/您的用戶名/您的專案名`
- [ ] GitHub Personal Access Token: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- [ ] OpenAI API Key (sk-...)
- [ ] OpenAI Assistant ID (asst-...)
- [ ] Cloudinary 配置（Cloud Name, API Key, API Secret）
- [ ] Turso 配置（Database URL, Auth Token）

## 3. GitHub 倉庫設置

### 3.1 確認程式碼結構
確保您的專案結構如下：
```
/your-repository-root
├── backend_777tech/
│   ├── src/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   └── static/
│   ├── requirements.txt
│   ├── Procfile
│   └── .env.example
├── .gitignore
└── README.md
```

### 3.2 推送程式碼到 GitHub
```bash
git add .
git commit -m "準備部署到Render"
git push origin master
```

## 4. Render 服務配置

### 4.1 創建 Web Service
1. 登入 [Render](https://render.com/)
2. 點擊 **New +** → **Web Service**
3. 選擇 **Build and deploy from a Git repository**
4. 連接您的 GitHub 倉庫

### 4.2 服務設定
- **Name**: `777tech-backend`
- **Region**: 選擇適合的地理區域
- **Branch**: `master`
- **Root Directory**: `backend_777tech`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn src.main:app`

## 5. 環境變數配置

在 Render 的 Environment 部分添加以下變數：

### 🔐 Flask 核心配置
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///777tech.db
ENCRYPTION_KEY=your-32-byte-encryption-key
```

### 🤖 OpenAI 配置
```
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ASSISTANT_ID=asst-your-assistant-id
```

### 📸 Cloudinary 配置
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 🔧 GitHub 整合
```
GITHUB_TOKEN=ghp_your-github-token
```

### 🗄️ Turso 資料庫（可選）
```
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

## 6. 部署與驗證

### 6.1 開始部署
點擊 **Create Web Service** 開始部署過程。

### 6.2 驗證部署
1. 等待部署完成
2. 訪問提供的 URL
3. 測試登入功能（admin / 777tech2024!）
4. 驗證 Google Authenticator 設置
5. 測試 AI 助手功能

## 7. 故障排除

### 常見問題
| 問題 | 解決方案 |
|------|----------|
| 部署失敗 | 檢查 requirements.txt 和 Procfile |
| 應用程式無法啟動 | 驗證環境變數配置 |
| 502 錯誤 | 確保應用程式監聽 0.0.0.0 |

### 檢查日誌
在 Render 儀表板中查看應用程式日誌以診斷問題。

## 8. 安全建議

- 定期更新 API 密鑰
- 監控應用程式使用量
- 設置適當的訪問控制
- 定期備份重要資料

## 9. 後續維護

- 監控應用程式性能
- 定期更新依賴項
- 檢查安全漏洞
- 備份環境變數配置

**參考資料：**
[1] Render 官方文檔：[https://render.com/docs](https://render.com/docs)
[2] Flask 部署指南：[https://flask.palletsprojects.com/en/2.3.x/deploying/](https://flask.palletsprojects.com/en/2.3.x/deploying/)


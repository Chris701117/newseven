// API 處理類別
class API {
    static baseURL = '/api';
    
    // 通用請求方法
    static async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // GET 請求
    static async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }
    
    // POST 請求
    static async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    // PUT 請求
    static async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // DELETE 請求
    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
    
    // 儀表板 API
    static async getDashboardStats() {
        // 模擬儀表板統計資料
        return {
            totalPosts: 156,
            scheduledPosts: 23,
            marketingItems: 45,
            operationItems: 67,
            recentActivity: [
                { type: 'post', message: '新增貼文：夏季促銷活動', time: '2小時前' },
                { type: 'marketing', message: '行銷活動已開始', time: '4小時前' },
                { type: 'operation', message: '系統維護完成', time: '1天前' }
            ]
        };
    }
    
    // 貼文 API
    static async getPosts(params = {}) {
        return this.get('/posts', params);
    }
    
    static async getPost(id) {
        return this.get(`/posts/${id}`);
    }
    
    static async createPost(data) {
        return this.post('/posts', data);
    }
    
    static async updatePost(id, data) {
        return this.put(`/posts/${id}`, data);
    }
    
    static async deletePost(id) {
        return this.delete(`/posts/${id}`);
    }
    
    static async getPostsCalendar(year, month) {
        return this.get('/posts/calendar', { year, month });
    }
    
    static async publishPost(id, platforms) {
        return this.post(`/posts/publish/${id}`, { platforms });
    }
    
    // 行銷 API
    static async getMarketingItems(params = {}) {
        return this.get('/marketing/items', params);
    }
    
    static async createMarketingItem(data) {
        return this.post('/marketing/items', data);
    }
    
    static async updateMarketingItem(id, data) {
        return this.put(`/marketing/items/${id}`, data);
    }
    
    static async deleteMarketingItem(id) {
        return this.delete(`/marketing/items/${id}`);
    }
    
    static async getMarketingCalendar(year, month) {
        return this.get('/marketing/calendar', { year, month });
    }
    
    static async getOnelinkMappings() {
        return this.get('/marketing/onelink');
    }
    
    static async createOnelinkMapping(data) {
        return this.post('/marketing/onelink', data);
    }
    
    static async getVendors() {
        return this.get('/marketing/vendors');
    }
    
    static async createVendor(data) {
        return this.post('/marketing/vendors', data);
    }
    
    static async updateVendor(id, data) {
        return this.put(`/marketing/vendors/${id}`, data);
    }
    
    // 營運 API
    static async getOperationItems(params = {}) {
        return this.get('/operation/items', params);
    }
    
    static async createOperationItem(data) {
        return this.post('/operation/items', data);
    }
    
    static async updateOperationItem(id, data) {
        return this.put(`/operation/items/${id}`, data);
    }
    
    static async deleteOperationItem(id) {
        return this.delete(`/operation/items/${id}`);
    }
    
    static async getOperationCalendar(year, month) {
        return this.get('/operation/calendar', { year, month });
    }
    
    static async getOperationGantt(year, month) {
        return this.get('/operation/gantt', { year, month });
    }
    
    // 設定 API
    static async getUserProfile(userId = 1) {
        return this.get('/settings/profile', { user_id: userId });
    }
    
    static async updateUserProfile(data) {
        return this.put('/settings/profile', data);
    }
    
    static async getUserGroups() {
        return this.get('/settings/groups');
    }
    
    static async createUserGroup(data) {
        return this.post('/settings/groups', data);
    }
    
    static async updateUserGroup(id, data) {
        return this.put(`/settings/groups/${id}`, data);
    }
    
    static async getFacebookSettings() {
        return this.get('/settings/facebook');
    }
    
    static async createFacebookSetting(data) {
        return this.post('/settings/facebook', data);
    }
    
    static async updateFacebookSetting(id, data) {
        return this.put(`/settings/facebook/${id}`, data);
    }
    
    static async testFacebookConnection(data) {
        return this.post('/settings/facebook/test', data);
    }
    
    static async getNotifications(userId = 1) {
        return this.get('/settings/notifications', { user_id: userId });
    }
    
    static async createNotification(data) {
        return this.post('/settings/notifications', data);
    }
    
    static async markNotificationRead(id) {
        return this.put(`/settings/notifications/${id}/read`);
    }
}

// 資料快取類別
class DataCache {
    constructor() {
        this.cache = new Map();
        this.expiry = new Map();
    }
    
    set(key, data, ttl = 300000) { // 預設5分鐘過期
        this.cache.set(key, data);
        this.expiry.set(key, Date.now() + ttl);
    }
    
    get(key) {
        if (this.expiry.get(key) < Date.now()) {
            this.cache.delete(key);
            this.expiry.delete(key);
            return null;
        }
        return this.cache.get(key);
    }
    
    clear() {
        this.cache.clear();
        this.expiry.clear();
    }
}

// 建立全域快取實例
const dataCache = new DataCache();


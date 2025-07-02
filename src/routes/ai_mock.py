from flask import Blueprint, request, jsonify
import time
import random

ai_mock_bp = Blueprint('ai_mock', __name__, url_prefix='/api/chat')

# 模擬AI回應的範本
MOCK_RESPONSES = {
    'post_generation': [
        "🚀 **科技趨勢分享**\n\n人工智慧正在改變我們的工作方式！從自動化流程到智能決策支援，AI技術讓企業營運更加高效。\n\n✨ 重點特色：\n• 提升工作效率 50%\n• 減少人為錯誤\n• 24/7 智能服務\n\n#科技創新 #人工智慧 #數位轉型",
        
        "📱 **產品介紹**\n\n七七七科技後台管理系統全新上線！\n\n🎯 核心功能：\n• 社群媒體統一管理\n• 智能排程發布\n• 數據分析報表\n• AI助手協作\n\n讓您的社群營運更輕鬆、更專業！\n\n#後台管理 #社群營運 #效率工具",
        
        "💡 **創新思維**\n\n在數位時代，創新不只是技術突破，更是思維模式的轉變。\n\n🌟 成功關鍵：\n• 用戶體驗至上\n• 數據驅動決策\n• 持續學習改進\n• 團隊協作創新\n\n讓我們一起擁抱變化，創造更美好的未來！\n\n#創新思維 #數位轉型 #團隊合作"
    ],
    
    'marketing_advice': [
        "📊 **數位行銷策略建議**\n\n1. **內容行銷**\n   • 建立品牌故事\n   • 定期發布有價值的內容\n   • 與受眾互動交流\n\n2. **社群媒體**\n   • 多平台佈局\n   • 一致的品牌形象\n   • 即時回應客戶\n\n3. **數據分析**\n   • 追蹤關鍵指標\n   • A/B測試優化\n   • 調整策略方向",
        
        "🎯 **行銷活動規劃**\n\n**第一階段：品牌認知**\n• 社群媒體曝光\n• 影響者合作\n• 內容行銷\n\n**第二階段：互動參與**\n• 線上活動\n• 用戶生成內容\n• 社群互動\n\n**第三階段：轉換成交**\n• 限時優惠\n• 個人化推薦\n• 客戶見證",
        
        "💰 **預算分配建議**\n\n**數位廣告 (40%)**\n• Facebook/Instagram 廣告\n• Google Ads\n• YouTube 廣告\n\n**內容製作 (30%)**\n• 圖片設計\n• 影片製作\n• 文案撰寫\n\n**工具與平台 (20%)**\n• 管理工具\n• 分析軟體\n• 自動化系統\n\n**其他行銷 (10%)**\n• 活動贊助\n• 公關合作"
    ],
    
    'operation_help': [
        "⚙️ **營運管理最佳實踐**\n\n**項目管理**\n• 使用看板方法（Kanban）\n• 設定明確的里程碑\n• 定期檢視進度\n\n**團隊協作**\n• 建立清楚的溝通流程\n• 定期團隊會議\n• 文件化重要決策\n\n**效率提升**\n• 自動化重複性工作\n• 標準化作業流程\n• 持續改進機制",
        
        "📋 **任務優先級管理**\n\n**緊急且重要**\n• 立即處理\n• 分配最佳資源\n• 密切監控進度\n\n**重要但不緊急**\n• 規劃執行時間\n• 預防性措施\n• 長期策略規劃\n\n**緊急但不重要**\n• 委派他人處理\n• 建立標準流程\n• 減少此類事件\n\n**不緊急不重要**\n• 考慮是否必要\n• 安排空閒時間\n• 或直接取消",
        
        "📈 **績效監控指標**\n\n**效率指標**\n• 任務完成率\n• 平均處理時間\n• 錯誤率\n\n**品質指標**\n• 客戶滿意度\n• 重工率\n• 合規性\n\n**成本指標**\n• 預算執行率\n• 成本效益比\n• 資源利用率"
    ],
    
    'general': [
        "您好！我是七七七科技的AI助手。我可以幫助您：\n\n📝 撰寫社群貼文內容\n📊 提供行銷策略建議\n⚙️ 協助營運管理\n❓ 回答系統使用問題\n\n請告訴我您需要什麼協助？",
        
        "感謝您使用七七七科技後台管理系統！\n\n我注意到您可能需要協助。以下是一些常見的使用場景：\n\n• 建立新的社群貼文\n• 規劃行銷活動\n• 管理營運項目\n• 分析數據報表\n\n有什麼特定的問題我可以幫您解決嗎？",
        
        "很高興為您服務！\n\n作為您的AI助手，我具備以下能力：\n\n🎨 **創意內容**：協助撰寫吸引人的貼文\n📈 **策略規劃**：提供專業的行銷建議\n🔧 **營運支援**：優化工作流程和效率\n📊 **數據洞察**：解讀分析報表\n\n請隨時告訴我您的需求！"
    ]
}

@ai_mock_bp.route('/sessions', methods=['POST'])
def create_session():
    """建立新的聊天會話"""
    data = request.get_json()
    
    # 模擬會話ID
    session_id = f"mock_session_{int(time.time())}"
    
    return jsonify({
        'success': True,
        'data': {
            'session_id': session_id,
            'title': data.get('title', 'AI助手會話'),
            'created_at': time.time()
        }
    })

@ai_mock_bp.route('/sessions/<session_id>/messages', methods=['POST'])
def send_message(session_id):
    """發送訊息並獲得AI回應"""
    data = request.get_json()
    user_message = data.get('message', '').lower()
    
    # 模擬處理時間
    time.sleep(1)
    
    # 根據用戶訊息選擇適當的回應類型
    if any(keyword in user_message for keyword in ['貼文', '內容', '文案', '發布', '社群']):
        response_type = 'post_generation'
    elif any(keyword in user_message for keyword in ['行銷', '廣告', '推廣', '策略', '活動']):
        response_type = 'marketing_advice'
    elif any(keyword in user_message for keyword in ['營運', '管理', '流程', '效率', '團隊']):
        response_type = 'operation_help'
    else:
        response_type = 'general'
    
    # 隨機選擇一個回應
    responses = MOCK_RESPONSES.get(response_type, MOCK_RESPONSES['general'])
    ai_response = random.choice(responses)
    
    return jsonify({
        'success': True,
        'data': {
            'user_message': {
                'content': data.get('message'),
                'timestamp': time.time(),
                'role': 'user'
            },
            'ai_response': {
                'content': ai_response,
                'timestamp': time.time(),
                'role': 'assistant'
            }
        }
    })

@ai_mock_bp.route('/generate-content', methods=['POST'])
def generate_content():
    """生成特定類型的內容"""
    data = request.get_json()
    content_type = data.get('type', 'post')
    prompt = data.get('prompt', '')
    platform = data.get('platform', 'facebook')
    
    # 模擬處理時間
    time.sleep(1.5)
    
    # 根據內容類型生成回應
    if content_type == 'post':
        content = random.choice(MOCK_RESPONSES['post_generation'])
    elif content_type == 'marketing':
        content = random.choice(MOCK_RESPONSES['marketing_advice'])
    elif content_type == 'operation':
        content = random.choice(MOCK_RESPONSES['operation_help'])
    else:
        content = "這是一個模擬的AI生成內容，展示系統功能正常運作。"
    
    return jsonify({
        'success': True,
        'data': {
            'content': content,
            'type': content_type,
            'platform': platform,
            'generated_at': time.time()
        }
    })

@ai_mock_bp.route('/sessions', methods=['GET'])
def get_sessions():
    """獲取聊天會話列表"""
    user_id = request.args.get('user_id', 'current_user')
    
    # 模擬會話數據
    mock_sessions = [
        {
            'session_id': 'mock_session_1',
            'title': 'AI助手會話 - 貼文生成',
            'message_count': 5,
            'updated_at': time.time() - 3600,
            'created_at': time.time() - 7200
        },
        {
            'session_id': 'mock_session_2',
            'title': 'AI助手會話 - 行銷策略',
            'message_count': 8,
            'updated_at': time.time() - 1800,
            'created_at': time.time() - 5400
        }
    ]
    
    return jsonify({
        'success': True,
        'data': mock_sessions
    })

@ai_mock_bp.route('/sessions/<session_id>/messages', methods=['GET'])
def get_session_messages(session_id):
    """獲取會話的訊息歷史"""
    
    # 模擬訊息歷史
    mock_messages = [
        {
            'content': '請幫我生成一篇關於科技趨勢的貼文',
            'role': 'user',
            'timestamp': time.time() - 3600
        },
        {
            'content': random.choice(MOCK_RESPONSES['post_generation']),
            'role': 'assistant',
            'timestamp': time.time() - 3580
        },
        {
            'content': '可以再調整一下語調嗎？',
            'role': 'user',
            'timestamp': time.time() - 3000
        },
        {
            'content': '當然可以！讓我為您調整語調，使其更加親切和易懂...',
            'role': 'assistant',
            'timestamp': time.time() - 2980
        }
    ]
    
    return jsonify({
        'success': True,
        'data': mock_messages
    })


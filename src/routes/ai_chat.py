from flask import Blueprint, request, jsonify, current_app
import openai
import uuid
from datetime import datetime
import json
import os
import requests
from models.ai_chat import ChatSession, ChatMessage, AISettings, db

ai_chat_bp = Blueprint('ai_chat', __name__)

# 初始化OpenAI客戶端
def get_openai_client():
    api_key = get_ai_setting('openai_api_key')
    if not api_key:
        raise ValueError("OpenAI API key not configured")
    return openai.OpenAI(api_key=api_key)

def get_ai_setting(key):
    setting = AISettings.query.filter_by(setting_key=key).first()
    return setting.setting_value if setting else None

@ai_chat_bp.route('/chat/sessions', methods=['GET'])
def get_chat_sessions():
    """獲取聊天會話列表"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        sessions = ChatSession.query.filter_by(user_id=user_id, is_active=True).order_by(ChatSession.updated_at.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [session.to_dict() for session in sessions]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_chat_bp.route('/chat/sessions', methods=['POST'])
def create_chat_session():
    """建立新的聊天會話"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'anonymous')
        title = data.get('title', f'聊天會話 {datetime.now().strftime("%Y-%m-%d %H:%M")}')
        
        session_id = str(uuid.uuid4())
        
        new_session = ChatSession(
            session_id=session_id,
            user_id=user_id,
            title=title
        )
        
        db.session.add(new_session)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': new_session.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_chat_bp.route('/chat/sessions/<session_id>/messages', methods=['GET'])
def get_chat_messages(session_id):
    """獲取聊天訊息"""
    try:
        messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp.asc()).all()
        
        return jsonify({
            'success': True,
            'data': [message.to_dict() for message in messages]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_chat_bp.route('/chat/sessions/<session_id>/messages', methods=['POST'])
def send_chat_message(session_id):
    """發送聊天訊息並獲取AI回應（支援多模態輸入）"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        files = data.get('files', [])  # 上傳的文件
        gdrive_links = data.get('gdrive_links', [])  # Google Drive連結
        
        # 檢查是否有任何內容
        if not user_message and not files and not gdrive_links:
            return jsonify({'success': False, 'error': '請提供訊息、文件或連結'}), 400
        
        # 檢查會話是否存在
        session = ChatSession.query.filter_by(session_id=session_id).first()
        if not session:
            return jsonify({'success': False, 'error': '會話不存在'}), 404
        
        # 處理上傳的文件
        processed_files = []
        for file_info in files:
            try:
                # 上傳文件到Cloudinary並提取內容
                upload_response = requests.post(
                    f"{request.host_url}api/upload-file",
                    files={'file': file_info},
                    data={'session_id': session_id}
                )
                if upload_response.status_code == 200:
                    upload_data = upload_response.json()
                    if upload_data['success']:
                        processed_files.append(upload_data['data'])
            except Exception as e:
                current_app.logger.error(f"文件處理錯誤: {str(e)}")
        
        # 處理Google Drive連結
        processed_gdrive = []
        for link in gdrive_links:
            try:
                gdrive_response = requests.post(
                    f"{request.host_url}api/process-gdrive-link",
                    json={'url': link, 'session_id': session_id}
                )
                if gdrive_response.status_code == 200:
                    gdrive_data = gdrive_response.json()
                    if gdrive_data['success']:
                        processed_gdrive.append(gdrive_data['data'])
            except Exception as e:
                current_app.logger.error(f"Google Drive連結處理錯誤: {str(e)}")
        
        # 構建完整的用戶訊息內容
        full_user_content = []
        
        # 添加文字訊息
        if user_message:
            full_user_content.append({
                "type": "text",
                "text": user_message
            })
        
        # 添加圖片
        for file_data in processed_files:
            if file_data['resource_type'] == 'image':
                full_user_content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": file_data['url']
                    }
                })
            elif file_data.get('content'):  # 文檔內容
                full_user_content.append({
                    "type": "text",
                    "text": f"[文件內容: {file_data.get('type', '未知類型')}]\n{file_data['content']}"
                })
        
        # 添加Google Drive內容
        for gdrive_data in processed_gdrive:
            if gdrive_data['type'] == 'image':
                full_user_content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": gdrive_data['url']
                    }
                })
            elif gdrive_data.get('content'):
                full_user_content.append({
                    "type": "text",
                    "text": f"[Google Drive文件內容]\n{gdrive_data['content']}"
                })
        
        # 儲存用戶訊息（包含文件和連結資訊）
        user_content_json = {
            'message': user_message,
            'files': processed_files,
            'gdrive_links': processed_gdrive
        }
        
        user_msg = ChatMessage(
            session_id=session_id,
            role='user',
            content=json.dumps(user_content_json, ensure_ascii=False)
        )
        db.session.add(user_msg)
        
        # 獲取歷史訊息
        history_messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp.asc()).all()
        
        # 準備OpenAI API請求
        messages = [
            {
                "role": "system",
                "content": "你是七七七科技後台管理系統的AI助手。你可以幫助用戶管理社群貼文、行銷活動、營運項目等。你能夠理解和分析圖片、文檔內容，並提供專業且有用的建議。請用繁體中文回答。"
            }
        ]
        
        # 添加歷史對話（限制最近10條，避免token過多）
        for msg in history_messages[-10:]:
            try:
                # 嘗試解析JSON格式的訊息
                msg_data = json.loads(msg.content)
                if msg.role == 'user' and isinstance(msg_data, dict):
                    # 用戶訊息，簡化顯示
                    text_content = msg_data.get('message', '')
                    if msg_data.get('files'):
                        text_content += f" [包含{len(msg_data['files'])}個文件]"
                    if msg_data.get('gdrive_links'):
                        text_content += f" [包含{len(msg_data['gdrive_links'])}個Google Drive連結]"
                    messages.append({
                        "role": msg.role,
                        "content": text_content
                    })
                else:
                    messages.append({
                        "role": msg.role,
                        "content": msg.content
                    })
            except (json.JSONDecodeError, TypeError):
                # 舊格式訊息，直接使用
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # 添加當前用戶訊息
        if len(full_user_content) == 1 and full_user_content[0]["type"] == "text":
            # 純文字訊息
            messages.append({
                "role": "user",
                "content": full_user_content[0]["text"]
            })
        else:
            # 多模態訊息
            messages.append({
                "role": "user",
                "content": full_user_content
            })
        
        # 調用OpenAI API
        try:
            client = get_openai_client()
            
            # 檢查是否有圖片內容，決定使用的模型
            has_images = any(
                content.get("type") == "image_url" 
                for content in (full_user_content if isinstance(full_user_content, list) else [])
            )
            
            if has_images:
                # 使用GPT-4V處理圖片
                model = "gpt-4-vision-preview"
                max_tokens = 1000
            else:
                # 使用標準模型
                model = "gpt-3.5-turbo"
                max_tokens = 1000
            
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7
            )
            ai_response = response.choices[0].message.content
                
        except Exception as openai_error:
            current_app.logger.error(f"OpenAI API error: {str(openai_error)}")
            ai_response = "抱歉，AI服務暫時不可用，請稍後再試。"
        
        # 儲存AI回應
        ai_msg = ChatMessage(
            session_id=session_id,
            role='assistant',
            content=ai_response
        )
        db.session.add(ai_msg)
        
        # 更新會話時間
        session.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'user_message': {
                    'id': user_msg.id,
                    'content': user_message,
                    'files': processed_files,
                    'gdrive_links': processed_gdrive,
                    'timestamp': user_msg.timestamp.isoformat()
                },
                'ai_response': ai_msg.to_dict()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Chat error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_chat_bp.route('/chat/generate-content', methods=['POST'])
def generate_content():
    """AI內容生成功能"""
    try:
        data = request.get_json()
        content_type = data.get('type', 'post')  # post, marketing, operation
        prompt = data.get('prompt', '')
        platform = data.get('platform', 'facebook')
        
        if not prompt:
            return jsonify({'success': False, 'error': '請提供內容提示'}), 400
        
        # 根據內容類型和平台調整提示詞
        system_prompts = {
            'post': f"你是一個專業的社群媒體內容創作者。請為{platform}平台創作一篇貼文，要求：1.吸引人的標題 2.有趣且有價值的內容 3.適當的hashtag 4.符合平台特色。請用繁體中文回答。",
            'marketing': "你是一個行銷專家。請創作行銷活動內容，包含：1.活動主題 2.目標受眾 3.活動內容 4.預期效果。請用繁體中文回答。",
            'operation': "你是一個營運專家。請創作營運計畫內容，包含：1.項目目標 2.執行步驟 3.時程安排 4.成功指標。請用繁體中文回答。"
        }
        
        try:
            client = get_openai_client()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompts.get(content_type, system_prompts['post'])},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.8
            )
            
            generated_content = response.choices[0].message.content
            
            return jsonify({
                'success': True,
                'data': {
                    'content': generated_content,
                    'type': content_type,
                    'platform': platform
                }
            })
            
        except Exception as openai_error:
            current_app.logger.error(f"OpenAI API error: {str(openai_error)}")
            return jsonify({'success': False, 'error': 'AI服務暫時不可用'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_chat_bp.route('/ai/settings', methods=['GET'])
def get_ai_settings():
    """獲取AI設定"""
    try:
        settings = AISettings.query.all()
        return jsonify({
            'success': True,
            'data': [setting.to_dict() for setting in settings]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@ai_chat_bp.route('/ai/settings', methods=['POST'])
def update_ai_settings():
    """更新AI設定"""
    try:
        data = request.get_json()
        
        for key, value in data.items():
            setting = AISettings.query.filter_by(setting_key=key).first()
            if setting:
                setting.setting_value = value
                setting.updated_at = datetime.utcnow()
            else:
                setting = AISettings(
                    setting_key=key,
                    setting_value=value,
                    is_encrypted=key.endswith('_key') or key.endswith('_secret')
                )
                db.session.add(setting)
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'AI設定已更新'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


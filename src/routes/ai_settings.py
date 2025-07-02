from flask import Blueprint, request, jsonify
from src.models.ai_config import AIConfig, db
from src.utils.encryption import encryption_manager
from datetime import datetime
import requests

ai_settings_bp = Blueprint('ai_settings', __name__)

@ai_settings_bp.route('/ai-settings', methods=['GET'])
def get_ai_settings():
    """獲取AI設定（不包含敏感資訊）"""
    try:
        user_id = request.args.get('user_id', 'default_user')
        config = AIConfig.get_user_config(user_id)
        
        return jsonify({
            'success': True,
            'data': config.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'獲取設定失敗: {str(e)}'
        }), 500

@ai_settings_bp.route('/ai-settings', methods=['POST'])
def update_ai_settings():
    """更新AI設定"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default_user')
        config = AIConfig.get_user_config(user_id)
        
        # 更新OpenAI設定
        if 'openai_api_key' in data:
            api_key = data['openai_api_key'].strip()
            if api_key:
                # 驗證密鑰格式
                is_valid, message = encryption_manager.validate_openai_key(api_key)
                if not is_valid:
                    return jsonify({
                        'success': False,
                        'error': message
                    }), 400
                
                # 加密並存儲
                encrypted_key = encryption_manager.encrypt_api_key(api_key)
                if encrypted_key:
                    config.openai_api_key_encrypted = encrypted_key
                else:
                    return jsonify({
                        'success': False,
                        'error': '密鑰加密失敗'
                    }), 500
        
        if 'openai_assistant_id' in data:
            assistant_id = data['openai_assistant_id'].strip()
            is_valid, message = encryption_manager.validate_assistant_id(assistant_id)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': message
                }), 400
            config.openai_assistant_id = assistant_id if assistant_id else None
        
        if 'openai_model' in data:
            config.openai_model = data['openai_model']
        
        # 更新Cloudinary設定
        if 'cloudinary_cloud_name' in data:
            config.cloudinary_cloud_name = data['cloudinary_cloud_name'].strip() or None
        
        if 'cloudinary_api_key' in data:
            config.cloudinary_api_key = data['cloudinary_api_key'].strip() or None
        
        if 'cloudinary_api_secret' in data:
            secret = data['cloudinary_api_secret'].strip()
            if secret:
                encrypted_secret = encryption_manager.encrypt_api_key(secret)
                config.cloudinary_api_secret_encrypted = encrypted_secret
        
        # 更新Turso設定
        if 'turso_database_url' in data:
            config.turso_database_url = data['turso_database_url'].strip() or None
        
        if 'turso_auth_token' in data:
            token = data['turso_auth_token'].strip()
            if token:
                encrypted_token = encryption_manager.encrypt_api_key(token)
                config.turso_auth_token_encrypted = encrypted_token
        
        # 更新GitHub設定
        if 'github_token' in data:
            token = data['github_token'].strip()
            if token:
                encrypted_token = encryption_manager.encrypt_api_key(token)
                config.github_token_encrypted = encrypted_token
        
        if 'github_repo' in data:
            config.github_repo = data['github_repo'].strip() or None
        
        # 更新功能開關
        if 'ai_enabled' in data:
            config.ai_enabled = bool(data['ai_enabled'])
        
        if 'content_editing_enabled' in data:
            config.content_editing_enabled = bool(data['content_editing_enabled'])
        
        if 'image_generation_enabled' in data:
            config.image_generation_enabled = bool(data['image_generation_enabled'])
        
        # 更新時間戳記
        config.updated_at = datetime.utcnow()
        
        # 保存到資料庫
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'AI設定更新成功',
            'data': config.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'更新設定失敗: {str(e)}'
        }), 500

@ai_settings_bp.route('/ai-settings/test-openai', methods=['POST'])
def test_openai_connection():
    """測試OpenAI API連接"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default_user')
        config = AIConfig.get_user_config(user_id)
        
        if not config.openai_api_key_encrypted:
            return jsonify({
                'success': False,
                'error': '尚未設定OpenAI API密鑰'
            }), 400
        
        # 解密API密鑰
        api_key = encryption_manager.decrypt_api_key(config.openai_api_key_encrypted)
        if not api_key:
            return jsonify({
                'success': False,
                'error': '無法解密API密鑰'
            }), 500
        
        # 測試API連接（使用簡單的模型列表請求）
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            'https://api.openai.com/v1/models',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            # 更新測試時間
            config.last_tested_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'OpenAI API連接測試成功',
                'data': {
                    'status': 'connected',
                    'tested_at': config.last_tested_at.isoformat()
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': f'API連接失敗: {response.status_code} - {response.text}'
            }), 400
            
    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'error': 'API請求超時，請檢查網路連接'
        }), 408
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'網路請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'測試失敗: {str(e)}'
        }), 500

@ai_settings_bp.route('/ai-settings/reset', methods=['POST'])
def reset_ai_settings():
    """重置AI設定"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'default_user')
        config = AIConfig.get_user_config(user_id)
        
        # 清除所有敏感資訊
        config.openai_api_key_encrypted = None
        config.openai_assistant_id = None
        config.cloudinary_api_secret_encrypted = None
        config.turso_auth_token_encrypted = None
        config.github_token_encrypted = None
        
        # 重置為預設值
        config.openai_model = 'gpt-4o-mini'
        config.ai_enabled = False
        config.content_editing_enabled = False
        config.image_generation_enabled = False
        config.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'AI設定已重置',
            'data': config.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'重置設定失敗: {str(e)}'
        }), 500


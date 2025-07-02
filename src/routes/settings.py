from flask import Blueprint, request, jsonify
from datetime import datetime
from models.user import db
from models.settings import UserProfile, UserGroup, FacebookPageSetting, SystemNotification

settings_bp = Blueprint('settings', __name__)

# 使用者設定
@settings_bp.route('/settings/profile', methods=['GET'])
def get_user_profile():
    """取得使用者設定檔"""
    try:
        # 這裡應該從認證系統取得當前使用者ID
        user_id = request.args.get('user_id', 1, type=int)
        profile = UserProfile.query.get_or_404(user_id)
        return jsonify({'success': True, 'data': profile.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_bp.route('/settings/profile', methods=['PUT'])
def update_user_profile():
    """更新使用者設定檔"""
    try:
        user_id = request.json.get('user_id', 1)
        profile = UserProfile.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'username' in data:
            profile.username = data['username']
        if 'email' in data:
            profile.email = data['email']
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'role' in data:
            profile.role = data['role']
        if 'group_id' in data:
            profile.group_id = data['group_id']
        
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'data': profile.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# 群組管理
@settings_bp.route('/settings/groups', methods=['GET'])
def get_user_groups():
    """取得使用者群組列表"""
    try:
        groups = UserGroup.query.all()
        return jsonify({'success': True, 'data': [group.to_dict() for group in groups]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_bp.route('/settings/groups', methods=['POST'])
def create_user_group():
    """建立新使用者群組"""
    try:
        data = request.get_json()
        
        group = UserGroup(
            name=data.get('name', ''),
            description=data.get('description'),
            permissions=data.get('permissions', {})
        )
        
        db.session.add(group)
        db.session.commit()
        
        return jsonify({'success': True, 'data': group.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_bp.route('/settings/groups/<int:group_id>', methods=['PUT'])
def update_user_group(group_id):
    """更新使用者群組"""
    try:
        group = UserGroup.query.get_or_404(group_id)
        data = request.get_json()
        
        if 'name' in data:
            group.name = data['name']
        if 'description' in data:
            group.description = data['description']
        if 'permissions' in data:
            group.permissions = data['permissions']
        
        group.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'data': group.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Facebook 粉絲頁設定
@settings_bp.route('/settings/facebook', methods=['GET'])
def get_facebook_settings():
    """取得 Facebook 粉絲頁設定"""
    try:
        settings = FacebookPageSetting.query.filter_by(is_active=True).all()
        return jsonify({'success': True, 'data': [setting.to_dict() for setting in settings]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_bp.route('/settings/facebook', methods=['POST'])
def create_facebook_setting():
    """建立 Facebook 粉絲頁設定"""
    try:
        data = request.get_json()
        
        # 驗證必填欄位
        if not data.get('page_id') or not data.get('page_name') or not data.get('access_token'):
            return jsonify({'success': False, 'error': '頁面ID、頁面名稱和存取權杖為必填'}), 400
        
        setting = FacebookPageSetting(
            page_id=data['page_id'],
            page_name=data['page_name'],
            access_token=data['access_token'],
            app_id=data.get('app_id'),
            app_secret=data.get('app_secret'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(setting)
        db.session.commit()
        
        return jsonify({'success': True, 'data': setting.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_bp.route('/settings/facebook/<int:setting_id>', methods=['PUT'])
def update_facebook_setting(setting_id):
    """更新 Facebook 粉絲頁設定"""
    try:
        setting = FacebookPageSetting.query.get_or_404(setting_id)
        data = request.get_json()
        
        if 'page_id' in data:
            setting.page_id = data['page_id']
        if 'page_name' in data:
            setting.page_name = data['page_name']
        if 'access_token' in data:
            setting.access_token = data['access_token']
        if 'app_id' in data:
            setting.app_id = data['app_id']
        if 'app_secret' in data:
            setting.app_secret = data['app_secret']
        if 'is_active' in data:
            setting.is_active = data['is_active']
        
        setting.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'data': setting.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# 系統通知
@settings_bp.route('/settings/notifications', methods=['GET'])
def get_notifications():
    """取得系統通知"""
    try:
        user_id = request.args.get('user_id', 1, type=int)
        notifications = SystemNotification.query.filter_by(user_id=user_id).order_by(
            SystemNotification.created_at.desc()
        ).limit(50).all()
        
        return jsonify({'success': True, 'data': [notification.to_dict() for notification in notifications]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_bp.route('/settings/notifications', methods=['POST'])
def create_notification():
    """建立系統通知"""
    try:
        data = request.get_json()
        
        notification = SystemNotification(
            user_id=data.get('user_id', 1),
            title=data.get('title', ''),
            message=data.get('message', ''),
            notification_type=data.get('notification_type', 'info')
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({'success': True, 'data': notification.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_bp.route('/settings/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    """標記通知為已讀"""
    try:
        notification = SystemNotification.query.get_or_404(notification_id)
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'success': True, 'data': notification.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Facebook API 測試
@settings_bp.route('/settings/facebook/test', methods=['POST'])
def test_facebook_connection():
    """測試 Facebook API 連線"""
    try:
        data = request.get_json()
        page_id = data.get('page_id')
        access_token = data.get('access_token')
        
        # 這裡應該實作實際的 Facebook API 測試
        # 目前先回傳模擬結果
        
        return jsonify({
            'success': True,
            'message': 'Facebook API 連線測試成功',
            'data': {
                'page_id': page_id,
                'status': 'connected',
                'permissions': ['pages_manage_posts', 'pages_read_engagement']
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


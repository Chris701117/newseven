from flask import Blueprint, request, jsonify, session
from models.user import User, db
from datetime import datetime
import json

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """用戶登入（第一步：密碼驗證）"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'error': '請輸入用戶名和密碼'
            }), 400
        
        # 驗證用戶名和密碼
        user = User.authenticate(username, password)
        if not user:
            return jsonify({
                'success': False,
                'error': '用戶名或密碼錯誤'
            }), 401
        
        # 生成會話令牌
        session_token = user.generate_session_token()
        db.session.commit()
        
        response_data = {
            'success': True,
            'message': '密碼驗證成功',
            'user': user.to_dict(),
            'session_token': session_token,
            'requires_2fa': user.is_2fa_enabled
        }
        
        if user.is_2fa_enabled:
            response_data['message'] = '請輸入Google Authenticator驗證碼'
        else:
            response_data['message'] = '登入成功'
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'登入失敗: {str(e)}'
        }), 500

@auth_bp.route('/auth/verify-2fa', methods=['POST'])
def verify_2fa():
    """驗證2FA令牌"""
    try:
        data = request.get_json()
        session_token = data.get('session_token', '')
        totp_code = data.get('totp_code', '').strip()
        backup_code = data.get('backup_code', '').strip()
        
        if not session_token:
            return jsonify({
                'success': False,
                'error': '無效的會話令牌'
            }), 401
        
        # 獲取用戶
        user = User.get_by_session_token(session_token)
        if not user:
            return jsonify({
                'success': False,
                'error': '會話已過期，請重新登入'
            }), 401
        
        if not user.is_2fa_enabled:
            return jsonify({
                'success': False,
                'error': '用戶未啟用2FA'
            }), 400
        
        # 驗證TOTP碼或備用碼
        is_valid = False
        if totp_code:
            is_valid = user.verify_totp(totp_code)
        elif backup_code:
            is_valid = user.verify_backup_code(backup_code)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'error': '驗證碼錯誤'
            }), 401
        
        # 標記2FA已驗證
        user.is_2fa_verified = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '2FA驗證成功，登入完成',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'2FA驗證失敗: {str(e)}'
        }), 500

@auth_bp.route('/auth/setup-2fa', methods=['POST'])
def setup_2fa():
    """設定2FA"""
    try:
        data = request.get_json()
        session_token = data.get('session_token', '')
        
        if not session_token:
            return jsonify({
                'success': False,
                'error': '請先登入'
            }), 401
        
        user = User.get_by_session_token(session_token)
        if not user or not user.is_fully_authenticated():
            return jsonify({
                'success': False,
                'error': '請先完成登入驗證'
            }), 401
        
        # 生成TOTP密鑰和QR碼
        secret = user.generate_totp_secret()
        qr_code = user.generate_qr_code()
        
        return jsonify({
            'success': True,
            'data': {
                'secret': secret,
                'qr_code': qr_code,
                'manual_entry_key': secret
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'設定2FA失敗: {str(e)}'
        }), 500

@auth_bp.route('/auth/enable-2fa', methods=['POST'])
def enable_2fa():
    """啟用2FA"""
    try:
        data = request.get_json()
        session_token = data.get('session_token', '')
        totp_code = data.get('totp_code', '').strip()
        
        if not session_token or not totp_code:
            return jsonify({
                'success': False,
                'error': '請提供會話令牌和驗證碼'
            }), 400
        
        user = User.get_by_session_token(session_token)
        if not user or not user.is_fully_authenticated():
            return jsonify({
                'success': False,
                'error': '請先完成登入驗證'
            }), 401
        
        # 驗證TOTP碼
        if not user.verify_totp(totp_code):
            return jsonify({
                'success': False,
                'error': '驗證碼錯誤，請重試'
            }), 401
        
        # 啟用2FA並生成備用碼
        user.enable_2fa()
        backup_codes = user.generate_backup_codes()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '2FA已成功啟用',
            'backup_codes': backup_codes
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'啟用2FA失敗: {str(e)}'
        }), 500

@auth_bp.route('/auth/disable-2fa', methods=['POST'])
def disable_2fa():
    """停用2FA"""
    try:
        data = request.get_json()
        session_token = data.get('session_token', '')
        password = data.get('password', '')
        
        if not session_token or not password:
            return jsonify({
                'success': False,
                'error': '請提供會話令牌和密碼'
            }), 400
        
        user = User.get_by_session_token(session_token)
        if not user or not user.is_fully_authenticated():
            return jsonify({
                'success': False,
                'error': '請先完成登入驗證'
            }), 401
        
        # 驗證密碼
        if not user.check_password(password):
            return jsonify({
                'success': False,
                'error': '密碼錯誤'
            }), 401
        
        # 停用2FA
        user.disable_2fa()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '2FA已停用'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'停用2FA失敗: {str(e)}'
        }), 500

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """用戶登出"""
    try:
        data = request.get_json()
        session_token = data.get('session_token', '')
        
        if session_token:
            user = User.get_by_session_token(session_token)
            if user:
                user.clear_session()
                db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '已成功登出'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'登出失敗: {str(e)}'
        }), 500

@auth_bp.route('/auth/check-session', methods=['POST'])
def check_session():
    """檢查會話狀態"""
    try:
        data = request.get_json()
        session_token = data.get('session_token', '')
        
        if not session_token:
            return jsonify({
                'success': False,
                'authenticated': False,
                'error': '無會話令牌'
            }), 401
        
        user = User.get_by_session_token(session_token)
        if not user:
            return jsonify({
                'success': False,
                'authenticated': False,
                'error': '會話已過期'
            }), 401
        
        return jsonify({
            'success': True,
            'authenticated': True,
            'fully_authenticated': user.is_fully_authenticated(),
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'authenticated': False,
            'error': f'檢查會話失敗: {str(e)}'
        }), 500

@auth_bp.route('/auth/init-admin', methods=['POST'])
def init_admin():
    """初始化管理員帳號"""
    try:
        # 檢查是否已有管理員
        existing_admin = User.query.filter_by(role='admin').first()
        if existing_admin:
            return jsonify({
                'success': False,
                'error': '管理員帳號已存在'
            }), 400
        
        # 建立管理員帳號
        admin_user = User.create_admin_user()
        
        return jsonify({
            'success': True,
            'message': '管理員帳號建立成功',
            'admin_info': {
                'username': admin_user.username,
                'email': admin_user.email,
                'default_password': '777tech2024!'
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'建立管理員失敗: {str(e)}'
        }), 500


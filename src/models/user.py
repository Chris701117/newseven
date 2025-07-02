from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import secrets
import pyotp
import qrcode
import io
import base64

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # 用戶資訊
    full_name = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), nullable=False, default='user')  # admin, user
    is_active = db.Column(db.Boolean, default=True)
    
    # Google Authenticator 2FA
    totp_secret = db.Column(db.String(32), nullable=True)
    is_2fa_enabled = db.Column(db.Boolean, default=False)
    backup_codes = db.Column(db.Text, nullable=True)  # JSON格式存儲備用碼
    
    # 會話管理
    session_token = db.Column(db.String(255), nullable=True)
    session_expires_at = db.Column(db.DateTime, nullable=True)
    is_2fa_verified = db.Column(db.Boolean, default=False)  # 當前會話是否已通過2FA
    
    # 時間戳記
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = db.Column(db.DateTime, nullable=True)
    
    def set_password(self, password):
        """設定密碼（加密存儲）"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """驗證密碼"""
        return check_password_hash(self.password_hash, password)
    
    def generate_totp_secret(self):
        """生成TOTP密鑰"""
        if not self.totp_secret:
            self.totp_secret = pyotp.random_base32()
        return self.totp_secret
    
    def get_totp_uri(self):
        """獲取TOTP URI用於生成QR碼"""
        if not self.totp_secret:
            self.generate_totp_secret()
        
        return pyotp.totp.TOTP(self.totp_secret).provisioning_uri(
            name=self.email,
            issuer_name="七七七科技後台系統"
        )
    
    def generate_qr_code(self):
        """生成QR碼圖片（Base64格式）"""
        uri = self.get_totp_uri()
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_base64}"
    
    def verify_totp(self, token):
        """驗證TOTP令牌"""
        if not self.totp_secret:
            return False
        
        totp = pyotp.TOTP(self.totp_secret)
        return totp.verify(token, valid_window=1)  # 允許前後30秒的時間窗口
    
    def generate_backup_codes(self):
        """生成備用碼"""
        import json
        codes = [secrets.token_hex(4).upper() for _ in range(10)]
        self.backup_codes = json.dumps(codes)
        return codes
    
    def verify_backup_code(self, code):
        """驗證並使用備用碼"""
        if not self.backup_codes:
            return False
        
        import json
        codes = json.loads(self.backup_codes)
        code = code.upper().strip()
        
        if code in codes:
            codes.remove(code)
            self.backup_codes = json.dumps(codes)
            db.session.commit()
            return True
        return False
    
    def enable_2fa(self):
        """啟用2FA"""
        self.is_2fa_enabled = True
        if not self.backup_codes:
            self.generate_backup_codes()
    
    def disable_2fa(self):
        """停用2FA"""
        self.is_2fa_enabled = False
        self.totp_secret = None
        self.backup_codes = None
        self.is_2fa_verified = False
    
    def generate_session_token(self):
        """生成會話令牌"""
        self.session_token = secrets.token_urlsafe(32)
        # 會話有效期24小時
        from datetime import timedelta
        self.session_expires_at = datetime.utcnow() + timedelta(hours=24)
        # 如果啟用2FA，需要重新驗證
        self.is_2fa_verified = not self.is_2fa_enabled
        return self.session_token
    
    def is_session_valid(self):
        """檢查會話是否有效"""
        if not self.session_token or not self.session_expires_at:
            return False
        return datetime.utcnow() < self.session_expires_at
    
    def is_fully_authenticated(self):
        """檢查是否完全認證（包含2FA）"""
        return self.is_session_valid() and (not self.is_2fa_enabled or self.is_2fa_verified)
    
    def clear_session(self):
        """清除會話"""
        self.session_token = None
        self.session_expires_at = None
        self.is_2fa_verified = False
    
    def to_dict(self):
        """轉換為字典格式（不包含敏感資訊）"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'is_2fa_enabled': self.is_2fa_enabled,
            'is_2fa_verified': self.is_2fa_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
        }
    
    @classmethod
    def create_admin_user(cls, username='admin', password='777tech2024!', email='admin@777tech.com'):
        """建立管理員用戶"""
        # 檢查是否已存在
        existing_user = cls.query.filter_by(username=username).first()
        if existing_user:
            return existing_user
        
        admin_user = cls(
            username=username,
            email=email,
            full_name='系統管理員',
            role='admin'
        )
        admin_user.set_password(password)
        
        db.session.add(admin_user)
        db.session.commit()
        return admin_user
    
    @classmethod
    def authenticate(cls, username, password):
        """用戶認證（第一步：密碼驗證）"""
        user = cls.query.filter_by(username=username, is_active=True).first()
        if user and user.check_password(password):
            user.last_login_at = datetime.utcnow()
            db.session.commit()
            return user
        return None
    
    @classmethod
    def get_by_session_token(cls, token):
        """通過會話令牌獲取用戶"""
        user = cls.query.filter_by(session_token=token).first()
        if user and user.is_session_valid():
            return user
        return None


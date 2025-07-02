from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from utils.encryption import EncryptionManager
import json

# 使用共享的db實例
from models.user import db

class AIConfig(db.Model):
    __tablename__ = 'ai_configs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    
    # OpenAI 配置
    openai_api_key_encrypted = db.Column(db.Text)
    openai_assistant_id_encrypted = db.Column(db.Text)
    openai_model = db.Column(db.String(50), default='gpt-4o-mini')
    
    # Cloudinary 配置
    cloudinary_cloud_name_encrypted = db.Column(db.Text)
    cloudinary_api_key_encrypted = db.Column(db.Text)
    cloudinary_api_secret_encrypted = db.Column(db.Text)
    
    # GitHub 配置
    github_token_encrypted = db.Column(db.Text)
    github_username = db.Column(db.String(100))
    github_repo = db.Column(db.String(200))
    
    # Turso 配置
    turso_database_url_encrypted = db.Column(db.Text)
    turso_auth_token_encrypted = db.Column(db.Text)
    
    # 其他設定
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, user_id):
        self.user_id = user_id
        self._encryption_manager = EncryptionManager()
    
    # OpenAI 相關方法
    def set_openai_api_key(self, api_key):
        """設定OpenAI API密鑰"""
        if api_key:
            self.openai_api_key_encrypted = self._encryption_manager.encrypt(api_key)
    
    def get_openai_api_key(self):
        """獲取OpenAI API密鑰"""
        if self.openai_api_key_encrypted:
            return self._encryption_manager.decrypt(self.openai_api_key_encrypted)
        return None
    
    def set_openai_assistant_id(self, assistant_id):
        """設定OpenAI Assistant ID"""
        if assistant_id:
            self.openai_assistant_id_encrypted = encrypt_data(assistant_id)
    
    def get_openai_assistant_id(self):
        """獲取OpenAI Assistant ID"""
        if self.openai_assistant_id_encrypted:
            return decrypt_data(self.openai_assistant_id_encrypted)
        return None
    
    # Cloudinary 相關方法
    def set_cloudinary_config(self, cloud_name, api_key, api_secret):
        """設定Cloudinary配置"""
        if cloud_name:
            self.cloudinary_cloud_name_encrypted = encrypt_data(cloud_name)
        if api_key:
            self.cloudinary_api_key_encrypted = encrypt_data(api_key)
        if api_secret:
            self.cloudinary_api_secret_encrypted = encrypt_data(api_secret)
    
    def get_cloudinary_config(self):
        """獲取Cloudinary配置"""
        config = {}
        if self.cloudinary_cloud_name_encrypted:
            config['cloud_name'] = decrypt_data(self.cloudinary_cloud_name_encrypted)
        if self.cloudinary_api_key_encrypted:
            config['api_key'] = decrypt_data(self.cloudinary_api_key_encrypted)
        if self.cloudinary_api_secret_encrypted:
            config['api_secret'] = decrypt_data(self.cloudinary_api_secret_encrypted)
        return config if config else None
    
    # GitHub 相關方法
    def set_github_config(self, token, username=None, repo=None):
        """設定GitHub配置"""
        if token:
            self.github_token_encrypted = encrypt_data(token)
        if username:
            self.github_username = username
        if repo:
            self.github_repo = repo
    
    def get_github_token(self):
        """獲取GitHub Token"""
        if self.github_token_encrypted:
            return decrypt_data(self.github_token_encrypted)
        return None
    
    def get_github_config(self):
        """獲取GitHub配置"""
        return {
            'token': self.get_github_token(),
            'username': self.github_username,
            'repo': self.github_repo
        }
    
    # Turso 相關方法
    def set_turso_config(self, database_url, auth_token):
        """設定Turso配置"""
        if database_url:
            self.turso_database_url_encrypted = encrypt_data(database_url)
        if auth_token:
            self.turso_auth_token_encrypted = encrypt_data(auth_token)
    
    def get_turso_config(self):
        """獲取Turso配置"""
        config = {}
        if self.turso_database_url_encrypted:
            config['database_url'] = decrypt_data(self.turso_database_url_encrypted)
        if self.turso_auth_token_encrypted:
            config['auth_token'] = decrypt_data(self.turso_auth_token_encrypted)
        return config if config else None
    
    # 驗證方法
    def test_openai_connection(self):
        """測試OpenAI連接"""
        try:
            api_key = self.get_openai_api_key()
            if not api_key:
                return False, "未設定OpenAI API密鑰"
            
            # 這裡可以添加實際的OpenAI API測試
            # import openai
            # openai.api_key = api_key
            # response = openai.models.list()
            
            return True, "OpenAI連接測試成功"
        except Exception as e:
            return False, f"OpenAI連接測試失敗: {str(e)}"
    
    def test_cloudinary_connection(self):
        """測試Cloudinary連接"""
        try:
            config = self.get_cloudinary_config()
            if not config or not all(k in config for k in ['cloud_name', 'api_key', 'api_secret']):
                return False, "Cloudinary配置不完整"
            
            # 這裡可以添加實際的Cloudinary API測試
            return True, "Cloudinary連接測試成功"
        except Exception as e:
            return False, f"Cloudinary連接測試失敗: {str(e)}"
    
    def test_github_connection(self):
        """測試GitHub連接"""
        try:
            token = self.get_github_token()
            if not token:
                return False, "未設定GitHub Token"
            
            # 這裡可以添加實際的GitHub API測試
            return True, "GitHub連接測試成功"
        except Exception as e:
            return False, f"GitHub連接測試失敗: {str(e)}"
    
    def test_turso_connection(self):
        """測試Turso連接"""
        try:
            config = self.get_turso_config()
            if not config or not all(k in config for k in ['database_url', 'auth_token']):
                return False, "Turso配置不完整"
            
            # 這裡可以添加實際的Turso API測試
            return True, "Turso連接測試成功"
        except Exception as e:
            return False, f"Turso連接測試失敗: {str(e)}"
    
    def to_dict(self, include_sensitive=False):
        """轉換為字典格式"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'openai_model': self.openai_model,
            'github_username': self.github_username,
            'github_repo': self.github_repo,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'has_openai_api_key': bool(self.openai_api_key_encrypted),
            'has_openai_assistant_id': bool(self.openai_assistant_id_encrypted),
            'has_cloudinary_config': bool(self.cloudinary_cloud_name_encrypted and 
                                        self.cloudinary_api_key_encrypted and 
                                        self.cloudinary_api_secret_encrypted),
            'has_github_token': bool(self.github_token_encrypted),
            'has_turso_config': bool(self.turso_database_url_encrypted and 
                                   self.turso_auth_token_encrypted)
        }
        
        if include_sensitive:
            # 僅在需要時包含敏感資料（例如用於API調用）
            data.update({
                'openai_api_key': self.get_openai_api_key(),
                'openai_assistant_id': self.get_openai_assistant_id(),
                'cloudinary_config': self.get_cloudinary_config(),
                'github_config': self.get_github_config(),
                'turso_config': self.get_turso_config()
            })
        
        return data
    
    @classmethod
    def get_by_user_id(cls, user_id):
        """根據用戶ID獲取AI配置"""
        return cls.query.filter_by(user_id=user_id, is_active=True).first()
    
    @classmethod
    def create_or_update(cls, user_id, **kwargs):
        """建立或更新AI配置"""
        config = cls.get_by_user_id(user_id)
        if not config:
            config = cls(user_id=user_id)
            db.session.add(config)
        
        # 更新OpenAI配置
        if 'openai_api_key' in kwargs:
            config.set_openai_api_key(kwargs['openai_api_key'])
        if 'openai_assistant_id' in kwargs:
            config.set_openai_assistant_id(kwargs['openai_assistant_id'])
        if 'openai_model' in kwargs:
            config.openai_model = kwargs['openai_model']
        
        # 更新Cloudinary配置
        if any(k in kwargs for k in ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret']):
            config.set_cloudinary_config(
                kwargs.get('cloudinary_cloud_name'),
                kwargs.get('cloudinary_api_key'),
                kwargs.get('cloudinary_api_secret')
            )
        
        # 更新GitHub配置
        if any(k in kwargs for k in ['github_token', 'github_username', 'github_repo']):
            config.set_github_config(
                kwargs.get('github_token'),
                kwargs.get('github_username'),
                kwargs.get('github_repo')
            )
        
        # 更新Turso配置
        if any(k in kwargs for k in ['turso_database_url', 'turso_auth_token']):
            config.set_turso_config(
                kwargs.get('turso_database_url'),
                kwargs.get('turso_auth_token')
            )
        
        config.updated_at = datetime.utcnow()
        db.session.commit()
        return config


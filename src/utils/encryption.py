import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class EncryptionManager:
    def __init__(self):
        # 使用環境變數或預設密鑰
        self.master_key = os.environ.get('MASTER_KEY', 'default_master_key_777tech_2024')
        self.salt = b'777tech_salt_2024'  # 在生產環境中應該使用隨機鹽值
        
    def _get_fernet_key(self):
        """生成Fernet加密密鑰"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.master_key.encode()))
        return Fernet(key)
    
    def encrypt_api_key(self, api_key):
        """加密API密鑰"""
        try:
            f = self._get_fernet_key()
            encrypted_key = f.encrypt(api_key.encode())
            return base64.urlsafe_b64encode(encrypted_key).decode()
        except Exception as e:
            print(f"加密失敗: {e}")
            return None
    
    def decrypt_api_key(self, encrypted_key):
        """解密API密鑰"""
        try:
            f = self._get_fernet_key()
            encrypted_data = base64.urlsafe_b64decode(encrypted_key.encode())
            decrypted_key = f.decrypt(encrypted_data)
            return decrypted_key.decode()
        except Exception as e:
            print(f"解密失敗: {e}")
            return None
    
    def validate_openai_key(self, api_key):
        """驗證OpenAI API密鑰格式"""
        if not api_key:
            return False, "API密鑰不能為空"
        
        if not api_key.startswith('sk-'):
            return False, "OpenAI API密鑰必須以'sk-'開頭"
        
        if len(api_key) < 20:
            return False, "API密鑰長度不足"
        
        return True, "密鑰格式正確"
    
    def validate_assistant_id(self, assistant_id):
        """驗證OpenAI Assistant ID格式"""
        if not assistant_id:
            return True, "Assistant ID為選填項目"  # 允許為空
        
        if not assistant_id.startswith('asst_'):
            return False, "Assistant ID必須以'asst_'開頭"
        
        return True, "Assistant ID格式正確"
    
    def encrypt(self, data):
        """通用加密方法"""
        return self.encrypt_api_key(data)
    
    def decrypt(self, encrypted_data):
        """通用解密方法"""
        return self.decrypt_api_key(encrypted_data)

# 全域加密管理器實例
encryption_manager = EncryptionManager()


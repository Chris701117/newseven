from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class OperationItem(db.Model):
    __tablename__ = 'operation_items'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    # 進行區間設定
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    
    # 分類與狀態
    tag = db.Column(db.String(20), nullable=False, default='一般')  # 一般、活動、測試、會議
    status = db.Column(db.String(20), nullable=False, default='未完成')  # 未完成、已完成
    
    # 作者
    author = db.Column(db.String(100), nullable=False)
    
    # 時間戳記
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'tag': self.tag,
            'status': self.status,
            'author': self.author,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


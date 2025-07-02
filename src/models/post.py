from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

# 使用共享的db實例
from models.user import db

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    # 平台特定內容
    fb_content = db.Column(db.Text)
    ig_content = db.Column(db.Text)
    tiktok_content = db.Column(db.Text)
    threads_content = db.Column(db.Text)
    x_content = db.Column(db.Text)
    
    # 排程設定
    scheduled_time = db.Column(db.DateTime, nullable=False)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    
    # 分類與狀態
    tag = db.Column(db.String(20), nullable=False, default='資訊')  # 資訊、活動、公告
    status = db.Column(db.String(20), nullable=False, default='尚未發佈')  # 尚未發佈、已發佈
    
    # 作者與發布者
    author = db.Column(db.String(100), nullable=False)
    publisher = db.Column(db.String(100))
    
    # 時間戳記
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'fb_content': self.fb_content,
            'ig_content': self.ig_content,
            'tiktok_content': self.tiktok_content,
            'threads_content': self.threads_content,
            'x_content': self.x_content,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'tag': self.tag,
            'status': self.status,
            'author': self.author,
            'publisher': self.publisher,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None
        }


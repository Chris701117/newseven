from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class MarketingItem(db.Model):
    __tablename__ = 'marketing_items'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    # 進行區間設定
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    
    # 分類與狀態
    tag = db.Column(db.String(20), nullable=False, default='一般')  # 一般、線上、線下、會議
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

class OnelinkMapping(db.Model):
    __tablename__ = 'onelink_mappings'
    
    id = db.Column(db.Integer, primary_key=True)
    platform = db.Column(db.String(50), nullable=False)  # Media Source (pid)
    campaign_code = db.Column(db.String(100), nullable=False)  # Campaign (c)
    material_id = db.Column(db.String(100))  # af_sub1
    ad_group = db.Column(db.String(100))  # af_adset
    ad_name = db.Column(db.String(100))  # af_ad
    audience_tag = db.Column(db.String(100))  # af_sub2
    creative_size = db.Column(db.String(50))  # af_sub3
    ad_placement = db.Column(db.String(50))  # af_channel
    
    # 時間戳記
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'platform': self.platform,
            'campaign_code': self.campaign_code,
            'material_id': self.material_id,
            'ad_group': self.ad_group,
            'ad_name': self.ad_name,
            'audience_tag': self.audience_tag,
            'creative_size': self.creative_size,
            'ad_placement': self.ad_placement,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Vendor(db.Model):
    __tablename__ = 'vendors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    business_contact = db.Column(db.String(100))
    contact_person = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    chat_app = db.Column(db.String(50))
    address = db.Column(db.Text)
    
    # 時間戳記
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'business_contact': self.business_contact,
            'contact_person': self.contact_person,
            'phone': self.phone,
            'chat_app': self.chat_app,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


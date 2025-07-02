from flask import Blueprint, request, jsonify
from datetime import datetime
from models.user import db
from models.marketing import MarketingItem, OnelinkMapping, Vendor

marketing_bp = Blueprint('marketing', __name__)

# 行銷項目管理
@marketing_bp.route('/marketing/items', methods=['GET'])
def get_marketing_items():
    """取得行銷項目列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        tag = request.args.get('tag', '')
        status = request.args.get('status', '')
        
        query = MarketingItem.query
        
        if search:
            query = query.filter(MarketingItem.title.contains(search) | MarketingItem.content.contains(search))
        if tag:
            query = query.filter(MarketingItem.tag == tag)
        if status:
            query = query.filter(MarketingItem.status == status)
        
        items = query.order_by(MarketingItem.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': [item.to_dict() for item in items.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': items.total,
                'pages': items.pages
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@marketing_bp.route('/marketing/items', methods=['POST'])
def create_marketing_item():
    """建立新行銷項目"""
    try:
        data = request.get_json()
        
        if not data.get('title') or not data.get('content') or not data.get('start_time') or not data.get('end_time'):
            return jsonify({'success': False, 'error': '標題、內容、開始時間和結束時間為必填'}), 400
        
        item = MarketingItem(
            title=data['title'],
            content=data['content'],
            start_time=datetime.fromisoformat(data['start_time']),
            end_time=datetime.fromisoformat(data['end_time']),
            tag=data.get('tag', '一般'),
            status=data.get('status', '未完成'),
            author=data.get('author', 'Unknown')
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify({'success': True, 'data': item.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@marketing_bp.route('/marketing/items/<int:item_id>', methods=['PUT'])
def update_marketing_item(item_id):
    """更新行銷項目"""
    try:
        item = MarketingItem.query.get_or_404(item_id)
        data = request.get_json()
        
        if 'title' in data:
            item.title = data['title']
        if 'content' in data:
            item.content = data['content']
        if 'start_time' in data:
            item.start_time = datetime.fromisoformat(data['start_time'])
        if 'end_time' in data:
            item.end_time = datetime.fromisoformat(data['end_time'])
        if 'tag' in data:
            item.tag = data['tag']
        if 'status' in data:
            item.status = data['status']
        
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'data': item.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@marketing_bp.route('/marketing/items/<int:item_id>', methods=['DELETE'])
def delete_marketing_item(item_id):
    """刪除行銷項目"""
    try:
        item = MarketingItem.query.get_or_404(item_id)
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'success': True, 'message': '行銷項目已刪除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Onelink 管理
@marketing_bp.route('/marketing/onelink', methods=['GET'])
def get_onelink_mappings():
    """取得 Onelink 對應列表"""
    try:
        mappings = OnelinkMapping.query.all()
        return jsonify({'success': True, 'data': [mapping.to_dict() for mapping in mappings]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@marketing_bp.route('/marketing/onelink', methods=['POST'])
def create_onelink_mapping():
    """建立新 Onelink 對應"""
    try:
        data = request.get_json()
        
        mapping = OnelinkMapping(
            platform=data.get('platform', '').lower(),
            campaign_code=data.get('campaign_code', ''),
            material_id=data.get('material_id'),
            ad_group=data.get('ad_group'),
            ad_name=data.get('ad_name'),
            audience_tag=data.get('audience_tag'),
            creative_size=data.get('creative_size'),
            ad_placement=data.get('ad_placement')
        )
        
        db.session.add(mapping)
        db.session.commit()
        
        return jsonify({'success': True, 'data': mapping.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# 廠商管理
@marketing_bp.route('/marketing/vendors', methods=['GET'])
def get_vendors():
    """取得廠商列表"""
    try:
        vendors = Vendor.query.all()
        return jsonify({'success': True, 'data': [vendor.to_dict() for vendor in vendors]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@marketing_bp.route('/marketing/vendors', methods=['POST'])
def create_vendor():
    """建立新廠商"""
    try:
        data = request.get_json()
        
        vendor = Vendor(
            name=data.get('name', ''),
            business_contact=data.get('business_contact'),
            contact_person=data.get('contact_person'),
            phone=data.get('phone'),
            chat_app=data.get('chat_app'),
            address=data.get('address')
        )
        
        db.session.add(vendor)
        db.session.commit()
        
        return jsonify({'success': True, 'data': vendor.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@marketing_bp.route('/marketing/vendors/<int:vendor_id>', methods=['PUT'])
def update_vendor(vendor_id):
    """更新廠商資訊"""
    try:
        vendor = Vendor.query.get_or_404(vendor_id)
        data = request.get_json()
        
        if 'name' in data:
            vendor.name = data['name']
        if 'business_contact' in data:
            vendor.business_contact = data['business_contact']
        if 'contact_person' in data:
            vendor.contact_person = data['contact_person']
        if 'phone' in data:
            vendor.phone = data['phone']
        if 'chat_app' in data:
            vendor.chat_app = data['chat_app']
        if 'address' in data:
            vendor.address = data['address']
        
        vendor.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'data': vendor.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@marketing_bp.route('/marketing/calendar', methods=['GET'])
def get_marketing_calendar():
    """取得行銷項目日曆視圖"""
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        items = MarketingItem.query.filter(
            db.or_(
                db.and_(
                    db.extract('year', MarketingItem.start_time) == year,
                    db.extract('month', MarketingItem.start_time) == month
                ),
                db.and_(
                    db.extract('year', MarketingItem.end_time) == year,
                    db.extract('month', MarketingItem.end_time) == month
                )
            )
        ).all()
        
        calendar_data = {}
        for item in items:
            # 處理跨日期的項目
            start_date = item.start_time.date()
            end_date = item.end_time.date()
            
            current_date = start_date
            while current_date <= end_date:
                date_key = current_date.strftime('%Y-%m-%d')
                if date_key not in calendar_data:
                    calendar_data[date_key] = []
                calendar_data[date_key].append(item.to_dict())
                current_date = current_date.replace(day=current_date.day + 1) if current_date.day < 31 else current_date.replace(month=current_date.month + 1, day=1)
        
        return jsonify({'success': True, 'data': calendar_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


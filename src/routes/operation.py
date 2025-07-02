from flask import Blueprint, request, jsonify
from datetime import datetime
from models.user import db
from models.operation import OperationItem

operation_bp = Blueprint('operation', __name__)

@operation_bp.route('/operation/items', methods=['GET'])
def get_operation_items():
    """取得營運項目列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        tag = request.args.get('tag', '')
        status = request.args.get('status', '')
        
        query = OperationItem.query
        
        if search:
            query = query.filter(OperationItem.title.contains(search) | OperationItem.content.contains(search))
        if tag:
            query = query.filter(OperationItem.tag == tag)
        if status:
            query = query.filter(OperationItem.status == status)
        
        items = query.order_by(OperationItem.created_at.desc()).paginate(
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

@operation_bp.route('/operation/items', methods=['POST'])
def create_operation_item():
    """建立新營運項目"""
    try:
        data = request.get_json()
        
        if not data.get('title') or not data.get('content') or not data.get('start_time') or not data.get('end_time'):
            return jsonify({'success': False, 'error': '標題、內容、開始時間和結束時間為必填'}), 400
        
        item = OperationItem(
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

@operation_bp.route('/operation/items/<int:item_id>', methods=['GET'])
def get_operation_item(item_id):
    """取得單一營運項目"""
    try:
        item = OperationItem.query.get_or_404(item_id)
        return jsonify({'success': True, 'data': item.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@operation_bp.route('/operation/items/<int:item_id>', methods=['PUT'])
def update_operation_item(item_id):
    """更新營運項目"""
    try:
        item = OperationItem.query.get_or_404(item_id)
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

@operation_bp.route('/operation/items/<int:item_id>', methods=['DELETE'])
def delete_operation_item(item_id):
    """刪除營運項目"""
    try:
        item = OperationItem.query.get_or_404(item_id)
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'success': True, 'message': '營運項目已刪除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@operation_bp.route('/operation/calendar', methods=['GET'])
def get_operation_calendar():
    """取得營運項目日曆視圖"""
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        items = OperationItem.query.filter(
            db.or_(
                db.and_(
                    db.extract('year', OperationItem.start_time) == year,
                    db.extract('month', OperationItem.start_time) == month
                ),
                db.and_(
                    db.extract('year', OperationItem.end_time) == year,
                    db.extract('month', OperationItem.end_time) == month
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
                # 安全地增加日期
                try:
                    if current_date.day < 28:  # 安全範圍
                        current_date = current_date.replace(day=current_date.day + 1)
                    else:
                        # 處理月末情況
                        if current_date.month < 12:
                            current_date = current_date.replace(month=current_date.month + 1, day=1)
                        else:
                            current_date = current_date.replace(year=current_date.year + 1, month=1, day=1)
                        break  # 避免無限循環
                except ValueError:
                    break
        
        return jsonify({'success': True, 'data': calendar_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@operation_bp.route('/operation/gantt', methods=['GET'])
def get_operation_gantt():
    """取得營運項目甘特圖資料"""
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        items = OperationItem.query.filter(
            db.or_(
                db.and_(
                    db.extract('year', OperationItem.start_time) == year,
                    db.extract('month', OperationItem.start_time) == month
                ),
                db.and_(
                    db.extract('year', OperationItem.end_time) == year,
                    db.extract('month', OperationItem.end_time) == month
                )
            )
        ).order_by(OperationItem.start_time).all()
        
        gantt_data = []
        for item in items:
            gantt_data.append({
                'id': item.id,
                'title': item.title,
                'tag': item.tag,
                'status': item.status,
                'start_time': item.start_time.isoformat(),
                'end_time': item.end_time.isoformat(),
                'duration': (item.end_time - item.start_time).days + 1
            })
        
        return jsonify({'success': True, 'data': gantt_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


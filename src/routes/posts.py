from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models.user import db
from src.models.post import Post

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    """取得貼文列表"""
    try:
        # 查詢參數
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        tag = request.args.get('tag', '')
        status = request.args.get('status', '')
        
        # 建立查詢
        query = Post.query
        
        if search:
            query = query.filter(Post.title.contains(search) | Post.content.contains(search))
        if tag:
            query = query.filter(Post.tag == tag)
        if status:
            query = query.filter(Post.status == status)
        
        # 分頁
        posts = query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'data': [post.to_dict() for post in posts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': posts.total,
                'pages': posts.pages
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_bp.route('/posts', methods=['POST'])
def create_post():
    """建立新貼文"""
    try:
        data = request.get_json()
        
        # 驗證必填欄位
        if not data.get('title') or not data.get('content') or not data.get('scheduled_time'):
            return jsonify({'success': False, 'error': '標題、內容和排程時間為必填'}), 400
        
        post = Post(
            title=data['title'],
            content=data['content'],
            fb_content=data.get('fb_content'),
            ig_content=data.get('ig_content'),
            tiktok_content=data.get('tiktok_content'),
            threads_content=data.get('threads_content'),
            x_content=data.get('x_content'),
            scheduled_time=datetime.fromisoformat(data['scheduled_time']),
            start_time=datetime.fromisoformat(data['start_time']) if data.get('start_time') else None,
            end_time=datetime.fromisoformat(data['end_time']) if data.get('end_time') else None,
            tag=data.get('tag', '資訊'),
            status=data.get('status', '尚未發佈'),
            author=data.get('author', 'Unknown')
        )
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({'success': True, 'data': post.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """取得單一貼文"""
    try:
        post = Post.query.get_or_404(post_id)
        return jsonify({'success': True, 'data': post.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_bp.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """更新貼文"""
    try:
        post = Post.query.get_or_404(post_id)
        data = request.get_json()
        
        # 更新欄位
        if 'title' in data:
            post.title = data['title']
        if 'content' in data:
            post.content = data['content']
        if 'fb_content' in data:
            post.fb_content = data['fb_content']
        if 'ig_content' in data:
            post.ig_content = data['ig_content']
        if 'tiktok_content' in data:
            post.tiktok_content = data['tiktok_content']
        if 'threads_content' in data:
            post.threads_content = data['threads_content']
        if 'x_content' in data:
            post.x_content = data['x_content']
        if 'scheduled_time' in data:
            post.scheduled_time = datetime.fromisoformat(data['scheduled_time'])
        if 'start_time' in data:
            post.start_time = datetime.fromisoformat(data['start_time']) if data['start_time'] else None
        if 'end_time' in data:
            post.end_time = datetime.fromisoformat(data['end_time']) if data['end_time'] else None
        if 'tag' in data:
            post.tag = data['tag']
        if 'status' in data:
            post.status = data['status']
            if data['status'] == '已發佈' and not post.published_at:
                post.published_at = datetime.utcnow()
        if 'publisher' in data:
            post.publisher = data['publisher']
        
        post.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'success': True, 'data': post.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """刪除貼文"""
    try:
        post = Post.query.get_or_404(post_id)
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({'success': True, 'message': '貼文已刪除'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_bp.route('/posts/calendar', methods=['GET'])
def get_posts_calendar():
    """取得日曆視圖資料"""
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        # 取得指定月份的貼文
        posts = Post.query.filter(
            db.extract('year', Post.scheduled_time) == year,
            db.extract('month', Post.scheduled_time) == month
        ).all()
        
        # 按日期分組
        calendar_data = {}
        for post in posts:
            date_key = post.scheduled_time.strftime('%Y-%m-%d')
            if date_key not in calendar_data:
                calendar_data[date_key] = []
            calendar_data[date_key].append(post.to_dict())
        
        return jsonify({'success': True, 'data': calendar_data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@posts_bp.route('/posts/publish/<int:post_id>', methods=['POST'])
def publish_post(post_id):
    """發布貼文到社群平台"""
    try:
        post = Post.query.get_or_404(post_id)
        data = request.get_json()
        platforms = data.get('platforms', [])
        
        # 這裡應該實作實際的社群平台發布邏輯
        # 目前先模擬發布成功
        
        post.status = '已發佈'
        post.published_at = datetime.utcnow()
        post.publisher = data.get('publisher', 'System')
        
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': f'貼文已發布到 {", ".join(platforms)}',
            'data': post.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


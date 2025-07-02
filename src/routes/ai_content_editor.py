from flask import Blueprint, request, jsonify
import json
import time
from datetime import datetime

ai_editor_bp = Blueprint('ai_editor', __name__, url_prefix='/api/ai-editor')

@ai_editor_bp.route('/edit-post', methods=['POST'])
def edit_post():
    """AI助手編輯貼文內容"""
    data = request.get_json()
    
    # 模擬編輯操作
    post_id = data.get('post_id')
    changes = data.get('changes', {})
    
    # 驗證權限（實際應用中需要檢查用戶權限）
    if not post_id:
        return jsonify({
            'success': False,
            'error': '缺少貼文ID'
        }), 400
    
    # 模擬更新貼文
    updated_post = {
        'id': post_id,
        'title': changes.get('title', '原始標題'),
        'content': changes.get('content', '原始內容'),
        'platform_content': changes.get('platform_content', {}),
        'scheduled_time': changes.get('scheduled_time'),
        'tags': changes.get('tags', []),
        'status': changes.get('status', 'draft'),
        'updated_at': datetime.now().isoformat(),
        'updated_by': 'AI助手'
    }
    
    return jsonify({
        'success': True,
        'message': 'AI助手已成功更新貼文內容',
        'data': updated_post
    })

@ai_editor_bp.route('/create-post', methods=['POST'])
def create_post():
    """AI助手建立新貼文"""
    data = request.get_json()
    
    # 生成新的貼文ID
    post_id = f"ai_post_{int(time.time())}"
    
    new_post = {
        'id': post_id,
        'title': data.get('title', 'AI生成貼文'),
        'content': data.get('content', ''),
        'platform_content': data.get('platform_content', {}),
        'scheduled_time': data.get('scheduled_time'),
        'tags': data.get('tags', ['AI生成']),
        'status': 'draft',
        'created_at': datetime.now().isoformat(),
        'created_by': 'AI助手'
    }
    
    return jsonify({
        'success': True,
        'message': 'AI助手已成功建立新貼文',
        'data': new_post
    })

@ai_editor_bp.route('/edit-marketing-task', methods=['POST'])
def edit_marketing_task():
    """AI助手編輯行銷任務"""
    data = request.get_json()
    
    task_id = data.get('task_id')
    changes = data.get('changes', {})
    
    if not task_id:
        return jsonify({
            'success': False,
            'error': '缺少任務ID'
        }), 400
    
    updated_task = {
        'id': task_id,
        'title': changes.get('title', '原始任務標題'),
        'description': changes.get('description', '原始任務描述'),
        'priority': changes.get('priority', 'medium'),
        'status': changes.get('status', 'pending'),
        'start_date': changes.get('start_date'),
        'end_date': changes.get('end_date'),
        'assigned_to': changes.get('assigned_to', []),
        'tags': changes.get('tags', []),
        'updated_at': datetime.now().isoformat(),
        'updated_by': 'AI助手'
    }
    
    return jsonify({
        'success': True,
        'message': 'AI助手已成功更新行銷任務',
        'data': updated_task
    })

@ai_editor_bp.route('/create-marketing-task', methods=['POST'])
def create_marketing_task():
    """AI助手建立新行銷任務"""
    data = request.get_json()
    
    task_id = f"ai_marketing_{int(time.time())}"
    
    new_task = {
        'id': task_id,
        'title': data.get('title', 'AI建立的行銷任務'),
        'description': data.get('description', ''),
        'priority': data.get('priority', 'medium'),
        'status': 'pending',
        'start_date': data.get('start_date'),
        'end_date': data.get('end_date'),
        'assigned_to': data.get('assigned_to', []),
        'tags': data.get('tags', ['AI建立']),
        'created_at': datetime.now().isoformat(),
        'created_by': 'AI助手'
    }
    
    return jsonify({
        'success': True,
        'message': 'AI助手已成功建立新行銷任務',
        'data': new_task
    })

@ai_editor_bp.route('/edit-operation-task', methods=['POST'])
def edit_operation_task():
    """AI助手編輯營運任務"""
    data = request.get_json()
    
    task_id = data.get('task_id')
    changes = data.get('changes', {})
    
    if not task_id:
        return jsonify({
            'success': False,
            'error': '缺少任務ID'
        }), 400
    
    updated_task = {
        'id': task_id,
        'title': changes.get('title', '原始營運任務'),
        'description': changes.get('description', '原始任務描述'),
        'priority': changes.get('priority', 'medium'),
        'status': changes.get('status', 'pending'),
        'start_date': changes.get('start_date'),
        'end_date': changes.get('end_date'),
        'progress': changes.get('progress', 0),
        'tags': changes.get('tags', []),
        'updated_at': datetime.now().isoformat(),
        'updated_by': 'AI助手'
    }
    
    return jsonify({
        'success': True,
        'message': 'AI助手已成功更新營運任務',
        'data': updated_task
    })

@ai_editor_bp.route('/get-editable-content', methods=['GET'])
def get_editable_content():
    """獲取可編輯的內容列表"""
    content_type = request.args.get('type', 'all')
    
    # 模擬可編輯內容
    editable_content = {
        'posts': [
            {
                'id': 'post_1',
                'title': '科技趨勢分享',
                'type': 'social_post',
                'status': 'draft',
                'last_modified': '2024-07-01T10:00:00'
            },
            {
                'id': 'post_2',
                'title': '產品發布公告',
                'type': 'social_post',
                'status': 'scheduled',
                'last_modified': '2024-07-01T09:30:00'
            }
        ],
        'marketing_tasks': [
            {
                'id': 'marketing_1',
                'title': 'Q3行銷活動規劃',
                'type': 'marketing_task',
                'status': 'in_progress',
                'last_modified': '2024-07-01T08:00:00'
            }
        ],
        'operation_tasks': [
            {
                'id': 'operation_1',
                'title': '系統維護檢查',
                'type': 'operation_task',
                'status': 'pending',
                'last_modified': '2024-07-01T07:00:00'
            }
        ]
    }
    
    if content_type != 'all':
        return jsonify({
            'success': True,
            'data': editable_content.get(content_type, [])
        })
    
    return jsonify({
        'success': True,
        'data': editable_content
    })

@ai_editor_bp.route('/preview-changes', methods=['POST'])
def preview_changes():
    """預覽AI建議的修改"""
    data = request.get_json()
    
    content_id = data.get('content_id')
    content_type = data.get('content_type')
    suggested_changes = data.get('suggested_changes', {})
    
    # 模擬預覽
    preview = {
        'content_id': content_id,
        'content_type': content_type,
        'original': {
            'title': '原始標題',
            'content': '原始內容...'
        },
        'suggested': suggested_changes,
        'preview_url': f'/preview/{content_id}',
        'ai_explanation': '我建議這些修改是因為...',
        'confidence_score': 0.85
    }
    
    return jsonify({
        'success': True,
        'data': preview
    })

@ai_editor_bp.route('/apply-changes', methods=['POST'])
def apply_changes():
    """應用AI建議的修改"""
    data = request.get_json()
    
    content_id = data.get('content_id')
    approved_changes = data.get('approved_changes', {})
    user_confirmation = data.get('user_confirmation', False)
    
    if not user_confirmation:
        return jsonify({
            'success': False,
            'error': '需要用戶確認才能應用修改'
        }), 400
    
    # 模擬應用修改
    result = {
        'content_id': content_id,
        'applied_changes': approved_changes,
        'applied_at': datetime.now().isoformat(),
        'applied_by': 'AI助手',
        'backup_created': True,
        'backup_id': f"backup_{content_id}_{int(time.time())}"
    }
    
    return jsonify({
        'success': True,
        'message': 'AI助手已成功應用修改',
        'data': result
    })

@ai_editor_bp.route('/undo-changes', methods=['POST'])
def undo_changes():
    """撤銷AI的修改"""
    data = request.get_json()
    
    backup_id = data.get('backup_id')
    
    if not backup_id:
        return jsonify({
            'success': False,
            'error': '缺少備份ID'
        }), 400
    
    # 模擬撤銷操作
    result = {
        'backup_id': backup_id,
        'restored_at': datetime.now().isoformat(),
        'restored_by': 'AI助手'
    }
    
    return jsonify({
        'success': True,
        'message': 'AI助手已成功撤銷修改',
        'data': result
    })


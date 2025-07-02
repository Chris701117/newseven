from flask import Blueprint, request, jsonify
import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from datetime import datetime
import mimetypes
import tempfile
import requests
from urllib.parse import urlparse
import PyPDF2
import docx
from io import BytesIO

# 建立藍圖
file_upload_bp = Blueprint('file_upload', __name__)

# 配置Cloudinary
def configure_cloudinary():
    """配置Cloudinary設定"""
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET'),
        secure=True
    )

@file_upload_bp.route('/api/upload-file', methods=['POST'])
def upload_file():
    """處理文件上傳到Cloudinary"""
    try:
        # 配置Cloudinary
        configure_cloudinary()
        
        # 檢查是否有文件
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': '沒有選擇文件'
            }), 400
        
        file = request.files['file']
        session_id = request.form.get('session_id')
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '沒有選擇文件'
            }), 400
        
        # 檢查文件大小（限制10MB）
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            return jsonify({
                'success': False,
                'error': '文件大小超過10MB限制'
            }), 400
        
        # 獲取文件類型
        file_type = file.content_type or mimetypes.guess_type(file.filename)[0]
        
        # 決定資源類型
        if file_type and file_type.startswith('image/'):
            resource_type = 'image'
        elif file_type and file_type.startswith('video/'):
            resource_type = 'video'
        else:
            resource_type = 'raw'
        
        # 生成唯一的public_id
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        public_id = f"ai_chat/{session_id}/{timestamp}_{file.filename}"
        
        # 上傳到Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            resource_type=resource_type,
            public_id=public_id,
            unique_filename=False,
            overwrite=True,
            folder="ai_chat"
        )
        
        # 提取文件內容（如果是文檔）
        file_content = None
        if resource_type == 'raw' and file_type:
            file.seek(0)
            file_content = extract_file_content(file, file_type)
        
        return jsonify({
            'success': True,
            'data': {
                'url': upload_result['secure_url'],
                'public_id': upload_result['public_id'],
                'type': file_type,
                'size': file_size,
                'resource_type': resource_type,
                'content': file_content  # 提取的文字內容
            }
        })
        
    except Exception as e:
        print(f"文件上傳錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'上傳失敗: {str(e)}'
        }), 500

def extract_file_content(file, file_type):
    """提取文件的文字內容"""
    try:
        if file_type == 'application/pdf':
            return extract_pdf_content(file)
        elif file_type in ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            return extract_docx_content(file)
        elif file_type == 'text/plain':
            return file.read().decode('utf-8')
        else:
            return None
    except Exception as e:
        print(f"提取文件內容錯誤: {str(e)}")
        return None

def extract_pdf_content(file):
    """提取PDF文件的文字內容"""
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF提取錯誤: {str(e)}")
        return None

def extract_docx_content(file):
    """提取Word文檔的文字內容"""
    try:
        doc = docx.Document(file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"DOCX提取錯誤: {str(e)}")
        return None

@file_upload_bp.route('/api/process-gdrive-link', methods=['POST'])
def process_gdrive_link():
    """處理Google Drive公開連結"""
    try:
        data = request.get_json()
        url = data.get('url')
        session_id = data.get('session_id')
        
        if not url:
            return jsonify({
                'success': False,
                'error': '沒有提供連結'
            }), 400
        
        # 解析Google Drive連結
        parsed_url = urlparse(url)
        if 'drive.google.com' not in parsed_url.netloc:
            return jsonify({
                'success': False,
                'error': '不是有效的Google Drive連結'
            }), 400
        
        # 嘗試轉換為直接下載連結
        file_id = extract_file_id_from_gdrive_url(url)
        if not file_id:
            return jsonify({
                'success': False,
                'error': '無法解析Google Drive文件ID'
            }), 400
        
        # 構建直接下載連結
        download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        
        # 嘗試下載文件內容
        try:
            response = requests.get(download_url, timeout=30)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                
                # 如果是圖片，上傳到Cloudinary
                if content_type.startswith('image/'):
                    # 配置Cloudinary
                    configure_cloudinary()
                    
                    # 上傳圖片到Cloudinary
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    public_id = f"ai_chat/{session_id}/gdrive_{timestamp}"
                    
                    upload_result = cloudinary.uploader.upload(
                        BytesIO(response.content),
                        resource_type='image',
                        public_id=public_id,
                        folder="ai_chat"
                    )
                    
                    return jsonify({
                        'success': True,
                        'data': {
                            'type': 'image',
                            'url': upload_result['secure_url'],
                            'original_url': url,
                            'content_type': content_type
                        }
                    })
                
                # 如果是文檔，提取文字內容
                elif content_type in ['application/pdf', 'text/plain']:
                    file_content = None
                    if content_type == 'application/pdf':
                        file_content = extract_pdf_content(BytesIO(response.content))
                    elif content_type == 'text/plain':
                        file_content = response.text
                    
                    return jsonify({
                        'success': True,
                        'data': {
                            'type': 'document',
                            'content': file_content,
                            'original_url': url,
                            'content_type': content_type
                        }
                    })
                
                else:
                    return jsonify({
                        'success': True,
                        'data': {
                            'type': 'unknown',
                            'original_url': url,
                            'content_type': content_type,
                            'message': '文件類型不支援內容提取，但連結已記錄'
                        }
                    })
            
            else:
                return jsonify({
                    'success': False,
                    'error': '無法訪問Google Drive文件，請確認連結是公開的'
                }), 400
                
        except requests.RequestException as e:
            return jsonify({
                'success': False,
                'error': f'下載文件失敗: {str(e)}'
            }), 500
        
    except Exception as e:
        print(f"處理Google Drive連結錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'處理連結失敗: {str(e)}'
        }), 500

def extract_file_id_from_gdrive_url(url):
    """從Google Drive URL中提取文件ID"""
    try:
        # 處理不同格式的Google Drive URL
        if '/file/d/' in url:
            # https://drive.google.com/file/d/FILE_ID/view?usp=sharing
            file_id = url.split('/file/d/')[1].split('/')[0]
        elif 'id=' in url:
            # https://drive.google.com/open?id=FILE_ID
            file_id = url.split('id=')[1].split('&')[0]
        else:
            return None
        
        return file_id
    except Exception:
        return None


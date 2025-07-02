import os
import sys
# DON'T CHANGE THE ABOVE LINES

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from src.routes.posts import posts_bp
from src.routes.marketing import marketing_bp
from src.routes.operation import operation_bp
from src.routes.settings import settings_bp
from src.routes.ai_mock import ai_mock_bp
from src.routes.ai_content_editor import ai_editor_bp
from src.routes.ai_settings import ai_settings_bp
from src.routes.auth import auth_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# 資料庫配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///777tech.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化資料庫
from src.models.user import db as user_db
from src.models.ai_config import db as ai_config_db
from src.models.post import db as post_db

user_db.init_app(app)
ai_config_db.init_app(app)
post_db.init_app(app)

# 建立資料表
with app.app_context():
    user_db.create_all()
    ai_config_db.create_all()
    post_db.create_all()
    
    # 建立預設管理員帳號
    from src.models.user import User
    User.create_admin_user()

# 啟用CORS
CORS(app)

# 註冊所有藍圖
app.register_blueprint(posts_bp, url_prefix='/api')
app.register_blueprint(marketing_bp, url_prefix='/api')
app.register_blueprint(operation_bp, url_prefix='/api')
app.register_blueprint(settings_bp, url_prefix='/api')
app.register_blueprint(ai_mock_bp, url_prefix='/api')
app.register_blueprint(ai_editor_bp, url_prefix='/api')
app.register_blueprint(ai_settings_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

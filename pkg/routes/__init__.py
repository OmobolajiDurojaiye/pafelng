from pkg.routes.index import index_bp
from pkg.routes.user.routes import user_bp
from pkg.routes.user.routes import auth_bp
from pkg.routes.admin.routes import admin_bp
from pkg.routes.air_freight.routes import air_freight_bp
from pkg.routes.sea_freight.routes import sea_freight_bp
from pkg.routes.car_custom_doc.routes import car_doc_bp
from pkg.routes.global_courier.routes import global_route_bp
from pkg.routes.admin.air_sea_freight import admin_air_sea_bp
from pkg.routes.blog.blog_admin import blog_admin_bp
from pkg.routes.blog.routes import blog_bp
from pkg.routes.user.paystack import paystack_bp
from pkg.routes.user.unsigned import unsigned_bp

def register_blueprints(app):
    app.register_blueprint(index_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(air_freight_bp)
    app.register_blueprint(sea_freight_bp)
    app.register_blueprint(car_doc_bp)
    app.register_blueprint(global_route_bp)
    app.register_blueprint(admin_air_sea_bp)
    app.register_blueprint(blog_admin_bp)
    app.register_blueprint(blog_bp)
    app.register_blueprint(paystack_bp)
    app.register_blueprint(unsigned_bp)
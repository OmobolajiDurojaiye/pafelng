from pkg.routes.index import index_bp
from pkg.routes.user.routes import user_bp
from pkg.routes.user.routes import auth_bp
from pkg.routes.admin.routes import admin_bp
from pkg.routes.air_freight.routes import air_freight_bp
from pkg.routes.ship_freight.routes import ship_freight_bp
from pkg.routes.car_custom_doc.routes import car_doc_bp
from pkg.routes.global_courier.routes import global_route_bp

def register_blueprints(app):
    app.register_blueprint(index_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(air_freight_bp)
    app.register_blueprint(ship_freight_bp)
    app.register_blueprint(car_doc_bp)
    app.register_blueprint(global_route_bp)

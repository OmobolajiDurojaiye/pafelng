from flask import Blueprint

air_freight_bp = Blueprint('air_freight', __name__, url_prefix='/air-freight')

@air_freight_bp.route('/')
def air_dashboard():
    return "Air freight"

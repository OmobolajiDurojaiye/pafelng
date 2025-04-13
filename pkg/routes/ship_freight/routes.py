from flask import Blueprint

ship_freight_bp = Blueprint('ship_freight', __name__, url_prefix='/ship-freight')

@ship_freight_bp.route('/')
def dashboard():
    return "Ship freight"

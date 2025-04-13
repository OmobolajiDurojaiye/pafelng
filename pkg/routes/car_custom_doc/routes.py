from flask import Blueprint

car_doc_bp = Blueprint('car_custom_doc', __name__, url_prefix='/car')

@car_doc_bp.route('/')
def car_dashboard():
    return "Car Dashboard"

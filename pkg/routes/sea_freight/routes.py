from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, SeaFreight, SeaFreightMessage, db
import os
import datetime

sea_freight_bp = Blueprint('sea_freight', __name__, url_prefix='/sea-freight')

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@sea_freight_bp.route('/')
@login_required
def sea_freight():
    return render_template('user/sea_freight.html')

@sea_freight_bp.route('/submit', methods=['POST'])
@login_required
def submit_sea_freight():
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user:
        flash('User not found', 'error')
        return redirect(url_for('auth.login'))
    
    try:
        # Get form data
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        freight_type = request.form.get('freight_type')  # Import or Export
        
        # Create new sea freight object
        sea_freight = SeaFreight(
            user_id=user_id,
            name=name,
            email=email,
            phone=phone,
            freight_type=freight_type
        )
        
        # Conditional fields based on freight type
        if freight_type == 'import':
            import_type = request.form.get('import_type')
            
            if import_type == 'tracking':
                sea_freight.tracking_number = request.form.get('tracking_number')
                sea_freight.has_invoice = True if request.form.get('has_invoice') == 'yes' else False
            else:  # Pick up and delivery
                sea_freight.pickup_address = request.form.get('pickup_address')
                sea_freight.delivery_address = request.form.get('delivery_address')
                sea_freight.weight = request.form.get('weight')
                sea_freight.volumetric_dimension = request.form.get('volumetric_dimension')
                sea_freight.description = request.form.get('description')
                sea_freight.invoice_value = request.form.get('invoice_value')
                sea_freight.num_boxes = int(request.form.get('num_boxes', 1))
                
                if sea_freight.num_boxes > 1:
                    sea_freight.multiple_boxes_details = request.form.get('multiple_boxes_details')
                
                sea_freight.shipping_choice = request.form.get('shipping_choice')
        else:  # Export
            sea_freight.pickup_address = request.form.get('pickup_address')
            sea_freight.delivery_address = request.form.get('delivery_address')
            sea_freight.weight = request.form.get('weight')
            sea_freight.volumetric_dimension = request.form.get('volumetric_dimension')
            sea_freight.description = request.form.get('description')
            sea_freight.invoice_value = request.form.get('invoice_value')
            sea_freight.num_boxes = int(request.form.get('num_boxes', 1))
            
            if sea_freight.num_boxes > 1:
                sea_freight.multiple_boxes_details = request.form.get('multiple_boxes_details')
            
            sea_freight.shipping_choice = request.form.get('shipping_choice')
        
        # Save to database
        db.session.add(sea_freight)
        db.session.commit()
        
        flash('Sea freight request submitted successfully', 'success')
        return redirect(url_for('sea_freight.my_sea_freight'))
    
    except Exception as e:
        db.session.rollback()
        flash(f'Error submitting sea freight request: {str(e)}', 'error')
        return redirect(url_for('sea_freight.sea_freight'))

@sea_freight_bp.route('/my-sea-freight')
@login_required
def my_sea_freight():
    user_id = session['user_id']
    sea_freight_submissions = SeaFreight.query.filter_by(user_id=user_id).order_by(SeaFreight.created_at.desc()).all()
    return render_template('user/my_sea_freight.html', sea_freight_submissions=sea_freight_submissions)
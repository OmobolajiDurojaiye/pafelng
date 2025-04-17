from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, AirFreight, AirFreightMessage, db
import os
import datetime

air_freight_bp = Blueprint('air_freight', __name__, url_prefix='/air-freight')

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@air_freight_bp.route('/')
@login_required
def air_freight():
    return render_template('user/air_freight.html')

@air_freight_bp.route('/submit', methods=['POST'])
@login_required
def submit_air_freight():
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
        
        # Create new air freight object
        air_freight = AirFreight(
            user_id=user_id,
            name=name,
            email=email,
            phone=phone,
            freight_type=freight_type
        )
        
        # Conditional fields based on freight type
        if freight_type == 'import':
            import_type = request.form.get('import_type')
            
            if import_type == 'airwaybill':
                air_freight.airwaybill_number = request.form.get('airwaybill_number')
                air_freight.has_invoice = True if request.form.get('has_invoice') == 'yes' else False
            else:  # Pick up and delivery
                air_freight.pickup_address = request.form.get('pickup_address')
                air_freight.delivery_address = request.form.get('delivery_address')
                air_freight.weight = request.form.get('weight')
                air_freight.volumetric_dimension = request.form.get('volumetric_dimension')
                air_freight.description = request.form.get('description')
                air_freight.invoice_value = request.form.get('invoice_value')
                air_freight.num_boxes = int(request.form.get('num_boxes', 1))
                
                if air_freight.num_boxes > 1:
                    air_freight.multiple_boxes_details = request.form.get('multiple_boxes_details')
                
                air_freight.shipping_choice = request.form.get('shipping_choice')
        else:  # Export
            air_freight.pickup_address = request.form.get('pickup_address')
            air_freight.delivery_address = request.form.get('delivery_address')
            air_freight.weight = request.form.get('weight')
            air_freight.volumetric_dimension = request.form.get('volumetric_dimension')
            air_freight.description = request.form.get('description')
            air_freight.invoice_value = request.form.get('invoice_value')
            air_freight.num_boxes = int(request.form.get('num_boxes', 1))
            
            if air_freight.num_boxes > 1:
                air_freight.multiple_boxes_details = request.form.get('multiple_boxes_details')
            
            air_freight.shipping_choice = request.form.get('shipping_choice')
        
        # Save to database
        db.session.add(air_freight)
        db.session.commit()
        
        flash('Air freight request submitted successfully', 'success')
        return redirect(url_for('air_freight.my_air_freight'))
    
    except Exception as e:
        db.session.rollback()
        flash(f'Error submitting air freight request: {str(e)}', 'error')
        return redirect(url_for('air_freight.air_freight'))

@air_freight_bp.route('/my-air-freight')
@login_required
def my_air_freight():
    user_id = session['user_id']
    air_freight_submissions = AirFreight.query.filter_by(user_id=user_id).order_by(AirFreight.created_at.desc()).all()
    return render_template('user/my_air_freight.html', air_freight_submissions=air_freight_submissions)
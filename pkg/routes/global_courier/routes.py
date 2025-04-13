import os
import re
import random
import time
import uuid
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, GlobalCourier, db

global_route_bp = Blueprint('global_courier', __name__, url_prefix='/global-courier')

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@global_route_bp.route('/submit', methods=['GET', 'POST'])
@login_required
def global_courier():
    if request.method == 'GET':
        return render_template('user/global_courier.html')
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        if not user:
            flash('User not found', 'error')
            return redirect(url_for('auth.login'))
        
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        courier = request.form.get('courier')
        tracking = request.form.get('tracking')
        
        if not name or not email or not phone or not courier or not tracking:
            flash('All fields are required', 'error')
            return redirect(url_for('global_courier.global_courier'))
        
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            flash('Please enter a valid email address', 'error')
            return redirect(url_for('global_courier.global_courier'))
        
        if not re.match(r"^[0-9\s\-\+\(\)]{8,20}$", phone):
            flash('Please enter a valid phone number', 'error')
            return redirect(url_for('global_courier.global_courier'))
        
        if len(tracking) < 8:
            flash('Please enter a valid tracking number', 'error')
            return redirect(url_for('global_courier.global_courier'))
        
        new_courier = GlobalCourier(
            user_id=user_id,
            name=name,
            email=email,
            phone=phone,
            courier_company=courier,
            tracking_number=tracking
        )
        
        db.session.add(new_courier)
        db.session.commit()
        
        flash('Courier tracking request submitted successfully', 'success')
        return redirect(url_for('global_courier.my_global_courier'))
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in global courier submission: {str(e)}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return redirect(url_for('global_courier.global_courier'))


@global_route_bp.route('/my-submissions')
@login_required
def my_global_courier():
    user_id = session['user_id']
    courier_submissions = GlobalCourier.query.filter_by(user_id=user_id).order_by(GlobalCourier.created_at.desc()).all()
    return render_template('user/my_global_courier.html', courier_submissions=courier_submissions)
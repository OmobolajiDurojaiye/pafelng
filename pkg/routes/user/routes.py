import os
import re
import random
import time
import uuid
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, VehicleVerification, db, GlobalCourier

# Create blueprints
auth_bp = Blueprint('auth', __name__)
user_bp = Blueprint('user', __name__, url_prefix='/user')


# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Authentication routes
@auth_bp.route('/user/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('user/signup.html')

    try:
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')

        if not name or not email or not password:
            flash('All fields are required', 'error')
            return redirect(url_for('auth.signup'))

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered', 'error')
            return redirect(url_for('auth.signup'))

        new_user = User(name=name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully! Please log in.', 'success')
        return redirect(url_for('auth.login'))

    except Exception as e:
        db.session.rollback()
        print(f"Error in signup: {str(e)}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return redirect(url_for('auth.signup'))


@auth_bp.route('/user/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('user/login.html')
        
    try:
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            flash('Email and password are required', 'error')
            return redirect(url_for('auth.login'))

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            flash('Invalid email or password', 'error')
            return redirect(url_for('auth.login'))

        session['user_id'] = user.id
        session['user_name'] = user.name

        flash('Login successful', 'success')
        return redirect(url_for('user.dashboard'))
        
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('auth.login'))


@auth_bp.route('/user/logout')
def logout():
    session.pop('user_id', None)
    session.pop('user_name', None)
    flash('You have been logged out', 'success')
    return redirect(url_for('auth.login'))


# User routes - All these routes require authentication
@user_bp.route('/dashboard')
@login_required
def dashboard():
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        flash('User not found', 'error')
        return redirect(url_for('auth.login'))
        
    return render_template('user/dashboard.html', user=user)


@user_bp.route('/vehicle-verification', methods=['GET', 'POST'])
@login_required
def vehicle_verification():
    if request.method == 'GET':
        return render_template('user/vehicle_verification.html')
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        if not user:
            flash('User not found', 'error')
            return redirect(url_for('auth.login'))
        
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        c_number = request.form.get('cNumber')
        payment_method = request.form.get('paymentMethod')
        
        # Check that all required fields are filled
        if not name or not email or not phone or not c_number or not payment_method:
            flash('All required fields must be filled', 'error')
            return redirect(url_for('user.vehicle_verification'))
        
        # Create verification with C-Number
        new_verification = VehicleVerification(
            user_id=user_id,
            name=name,
            email=email,
            phone=phone,
            c_number=c_number,
            payment_method=payment_method
        )
        
        # Check for document upload - also required
        if 'document' not in request.files or not request.files['document'].filename:
            flash('Please upload a document', 'error')
            return redirect(url_for('user.vehicle_verification'))
            
        file = request.files['document']
        
        # Validate file type
        if not allowed_file(file.filename):
            flash('Invalid file type. Please upload PDF, JPG, or PNG files only.', 'error')
            return redirect(url_for('user.vehicle_verification'))
        
        # Generate unique filename with user name and random numbers
        original_filename = secure_filename(file.filename)
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        unique_id = str(uuid.uuid4().hex[:8]) + str(random.randint(1000, 9999))
        safe_username = secure_filename(user.name)
        new_filename = f"{safe_username}_{unique_id}.{file_extension}"
        
        # Create uploads directory if it doesn't exist
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'vehicle_documents')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        # Save file
        file_path = os.path.join(upload_folder, new_filename)
        file.save(file_path)
        
        # Store file info in database
        new_verification.document_path = os.path.join('uploads', 'vehicle_documents', new_filename)
        new_verification.original_filename = original_filename
        
        # Save to database
        db.session.add(new_verification)
        db.session.commit()
        
        flash('Vehicle verification submitted successfully', 'success')
        return redirect(url_for('user.dashboard'))
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in vehicle verification: {str(e)}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return redirect(url_for('user.vehicle_verification'))
    
# Route to view submitted vehicle verifications
@user_bp.route('/my-verifications')
@login_required
def my_verifications():
    user_id = session['user_id']
    verifications = VehicleVerification.query.filter_by(user_id=user_id).order_by(VehicleVerification.created_at.desc()).all()
    return render_template('user/my_verifications.html', verifications=verifications)


@user_bp.route('/global-courier', methods=['GET', 'POST'])
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
        
        # Get form data
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        courier = request.form.get('courier')
        tracking = request.form.get('tracking')
        
        # Validate input
        if not name or not email or not phone or not courier or not tracking:
            flash('All fields are required', 'error')
            return redirect(url_for('user.global_courier'))
        
        # Basic email validation
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            flash('Please enter a valid email address', 'error')
            return redirect(url_for('user.global_courier'))
        
        # Basic phone validation
        if not re.match(r"^[0-9\s\-\+\(\)]{8,20}$", phone):
            flash('Please enter a valid phone number', 'error')
            return redirect(url_for('user.global_courier'))
        
        # Basic tracking number validation
        if len(tracking) < 8:
            flash('Please enter a valid tracking number', 'error')
            return redirect(url_for('user.global_courier'))
        
        # Create new global courier record
        new_courier = GlobalCourier(
            user_id=user_id,
            name=name,
            email=email,
            phone=phone,
            courier_company=courier,
            tracking_number=tracking
        )
        
        # Save to database
        db.session.add(new_courier)
        db.session.commit()
        
        flash('Courier tracking request submitted successfully', 'success')
        return redirect(url_for('user.my_global_courier'))
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in global courier submission: {str(e)}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return redirect(url_for('user.global_courier'))

@user_bp.route('/my-global-courier')
@login_required
def my_global_courier():
    user_id = session['user_id']
    courier_submissions = GlobalCourier.query.filter_by(user_id=user_id).order_by(GlobalCourier.created_at.desc()).all()
    return render_template('user/my_global_courier.html', courier_submissions=courier_submissions)

@user_bp.route('/air-freight')
@login_required
def air_freight():
    return render_template('user/air_freight.html')

@user_bp.route('/my-air-freight')
@login_required
def my_air_freight():
    user_id = session['user_id']
    return render_template('user/my_air_freight.html')

@user_bp.route('/sea-freight')
@login_required
def sea_freight():
    return render_template('user/sea_freight.html')


@user_bp.route('/my-sea-freight')
@login_required
def my_sea_freight():
    user_id = session['user_id']
    return render_template('user/my_sea_freight.html')
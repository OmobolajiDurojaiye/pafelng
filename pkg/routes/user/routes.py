import os
import re
import random
import time
import uuid
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, VehicleVerification, GlobalCourier, VehicleVerificationMessage, GlobalCourierMessage, db
from flask_mail import Mail, Message

# Create blueprints
auth_bp = Blueprint('auth', __name__)
user_bp = Blueprint('user', __name__, url_prefix='/user')

# Initialize mail
mail = Mail()

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


# Helper function for file uploads
def save_file(file, directory_type):
    """Save uploaded file to the specified directory"""
    if not file:
        return None, None
    
    # Define upload folder
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', directory_type)
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Secure filename and make it unique
    original_filename = secure_filename(file.filename)
    file_extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    unique_id = str(uuid.uuid4().hex[:8]) + str(random.randint(1000, 9999))
    
    # Get user name for filename
    user = User.query.get(session['user_id'])
    safe_username = secure_filename(user.name) if user else 'user'
    
    # Create new filename
    new_filename = f"{safe_username}_{unique_id}.{file_extension}" if file_extension else f"{safe_username}_{unique_id}"
    
    # Save file
    file_path = os.path.join(upload_folder, new_filename)
    file.save(file_path)
    
    # Return relative path for storage in database
    return f'uploads/{directory_type}/{new_filename}', original_filename


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

@user_bp.route('/quotes_update')
@login_required
def quotes_update():
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        flash('User not found', 'error')
        return redirect(url_for('auth.login'))
    
    # Get all vehicle verifications for this user
    vehicle_verifications = VehicleVerification.query.filter_by(user_id=user.id).all()
    
    # Get all global couriers for this user
    global_couriers = GlobalCourier.query.filter_by(user_id=user.id).all()
    
    # Combine and format for template
    quotes = []
    
    for vv in vehicle_verifications:
        # Count unread messages (from admin)
        unread_messages = VehicleVerificationMessage.query.filter_by(
            verification_id=vv.id, 
            is_admin=True
        ).count()  # In a real app, you'd track read status
        
        quotes.append({
            'id': vv.id,
            'prefix': 'VV',
            'service_type': 'Vehicle Verification',
            'status': vv.verification_status,
            'created_at': vv.created_at,
            'c_number': vv.c_number,
            'unread_messages': unread_messages
        })
    
    for gc in global_couriers:
        # Count unread messages (from admin)
        unread_messages = GlobalCourierMessage.query.filter_by(
            courier_id=gc.id, 
            is_admin=True
        ).count()  # In a real app, you'd track read status
        
        quotes.append({
            'id': gc.id,
            'prefix': 'GC',
            'service_type': 'Global Courier',
            'status': gc.status,
            'created_at': gc.created_at,
            'courier_company': gc.courier_company,
            'unread_messages': unread_messages
        })
    
    # Sort by creation date, newest first
    quotes.sort(key=lambda x: x['created_at'], reverse=True)
    
    # Count quotes by status
    total_quotes = len(quotes)
    pending_quotes = sum(1 for q in quotes if q['status'] == 'pending')
    processing_quotes = sum(1 for q in quotes if q['status'] == 'processing')
    completed_quotes = sum(1 for q in quotes if q['status'] == 'completed')
    
    return render_template(
        'user/quotes_update.html',
        user=user,
        quotes=quotes,
        total_quotes=total_quotes,
        pending_quotes=pending_quotes,
        processing_quotes=processing_quotes,
        completed_quotes=completed_quotes
    )

@user_bp.route('/quote_details/<quote_type>/<int:quote_id>')
@login_required
def quote_details(quote_type, quote_id):
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        flash('User not found', 'error')
        return redirect(url_for('auth.login'))
    
    quote = None
    messages = []
    
    if quote_type == 'vehicle_verification':
        quote = VehicleVerification.query.filter_by(id=quote_id, user_id=user.id).first_or_404()
        messages = VehicleVerificationMessage.query.filter_by(verification_id=quote_id).order_by(VehicleVerificationMessage.created_at).all()
    elif quote_type == 'global_courier':
        quote = GlobalCourier.query.filter_by(id=quote_id, user_id=user.id).first_or_404()
        messages = GlobalCourierMessage.query.filter_by(courier_id=quote_id).order_by(GlobalCourierMessage.created_at).all()
    else:
        flash('Invalid quote type', 'error')
        return redirect(url_for('user.quotes_update'))
    
    return render_template(
        'user/quote_details.html',
        user=user,
        quote=quote,
        quote_type=quote_type,
        messages=messages
    )

@user_bp.route('/send_message/<quote_type>/<int:quote_id>', methods=['POST'])
@login_required
def send_message(quote_type, quote_id):
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        flash('User not found', 'error')
        return redirect(url_for('auth.login'))
    
    # Verify ownership of the quote
    if quote_type == 'vehicle_verification':
        quote = VehicleVerification.query.filter_by(id=quote_id, user_id=user.id).first_or_404()
    elif quote_type == 'global_courier':
        quote = GlobalCourier.query.filter_by(id=quote_id, user_id=user.id).first_or_404()
    else:
        flash('Invalid quote type', 'error')
        return redirect(url_for('user.quotes_update'))
    
    message_content = request.form.get('message')
    if not message_content:
        flash('Message content is required', 'error')
        return redirect(url_for('user.quote_details', quote_type=quote_type, quote_id=quote_id))
    
    # Handle attachment if any
    attachment_path = None
    original_filename = None
    
    if 'attachment' in request.files and request.files['attachment'].filename:
        try:
            attachment_path, original_filename = save_file(
                request.files['attachment'], 
                'user_attachments'
            )
        except Exception as e:
            flash(f'Error uploading file: {str(e)}', 'error')
            return redirect(url_for('user.quote_details', quote_type=quote_type, quote_id=quote_id))
    
    try:
        # Create new message
        if quote_type == 'vehicle_verification':
            new_message = VehicleVerificationMessage(
                verification_id=quote_id,
                content=message_content,
                attachment_path=attachment_path,
                original_filename=original_filename,
                is_admin=False
            )
        else:  # global_courier
            new_message = GlobalCourierMessage(
                courier_id=quote_id,
                content=message_content,
                attachment_path=attachment_path,
                original_filename=original_filename,
                is_admin=False
            )
        
        db.session.add(new_message)
        db.session.commit()
        
        # Optional: Send email notification to admin
        msg = Message(
            subject=f"New Message from User - {quote_type.replace('_', ' ').title()} #{quote_id}",
            sender="durojaiyeomobolaji93@gmail.com",
            recipients=["durojaiyeomobolaji93@gmail.com"]  # Admin email
        )
        msg.body = f"""
        A user has sent a new message regarding their {quote_type.replace('_', ' ')} request.
        
        User: {user.name} ({user.email})
        Request ID: {quote_id}
        Message: {message_content}
        
        Please log in to the admin panel to respond.
        """
        mail.send(msg)
        
        flash('Message sent successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('user.quote_details', quote_type=quote_type, quote_id=quote_id))
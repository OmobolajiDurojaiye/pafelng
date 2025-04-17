from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from pkg.models import db, Admin, VerificationCode, VehicleVerification, GlobalCourier, VehicleVerificationMessage, GlobalCourierMessage, AirFreight, SeaFreight
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
import random
import string
from flask_mail import Mail, Message
from functools import wraps
import os
import uuid
from datetime import datetime

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
mail = Mail()

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('admin.admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# Owner's email where verification codes will be sent
OWNER_EMAIL = os.environ.get('MAIL_USERNAME', 'durojaiyeomobolaji93@gmail.com')

# Helper function for status messages
def get_status_message(status):
    """Returns appropriate message based on status"""
    if status == 'pending':
        return "Your request is pending review. We will process it shortly."
    elif status == 'processing':
        return "We are currently processing your request. You will be notified when it's completed."
    elif status == 'completed':
        return "Your request has been completed successfully."
    elif status == 'declined':
        return "We regret to inform you that your request has been declined. Please contact our support for more information."
    else:
        return "Your request status has been updated."

# Helper function for file uploads - Updated to match user route approach
def save_file(file, directory_type):
    """Save uploaded file to the specified directory similar to user route"""
    if not file:
        return None, None
    
    # Define upload folder in the same way as user route
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', directory_type)
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Secure filename and make it unique, similar to user route
    original_filename = secure_filename(file.filename)
    file_extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    unique_id = str(uuid.uuid4().hex[:8]) + str(random.randint(1000, 9999))
    
    # Get admin name for filename
    admin = Admin.query.get(session['admin_id'])
    safe_adminname = secure_filename(admin.name) if admin else 'admin'
    
    # Create new filename
    new_filename = f"{safe_adminname}_{unique_id}.{file_extension}" if file_extension else f"{safe_adminname}_{unique_id}"
    
    # Save file
    file_path = os.path.join(upload_folder, new_filename)
    file.save(file_path)
    
    # Return relative path for storage in database
    return f'uploads/{directory_type}/{new_filename}', original_filename

@admin_bp.route('/')
@login_required
def admin_dashboard():
    # Fetch data for dashboard (pending verifications, etc.)
    vehicle_verifications = VehicleVerification.query.all()
    global_couriers = GlobalCourier.query.all()
    air_freights = AirFreight.query.all()
    sea_freights = SeaFreight.query.all()
    
    # Sort and slice for recent items
    recent_vehicle_verifications = sorted(vehicle_verifications, key=lambda x: x.created_at, reverse=True)[:5]
    recent_global_couriers = sorted(global_couriers, key=lambda x: x.created_at, reverse=True)[:5]
    recent_air_freights = sorted(air_freights, key=lambda x: x.created_at, reverse=True)[:5]
    recent_sea_freights = sorted(sea_freights, key=lambda x: x.created_at, reverse=True)[:5]
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    return render_template(
        'admin/admin_dashboard.html',
        admin=admin,
        vehicle_verifications=vehicle_verifications,
        global_couriers=global_couriers,
        air_freights=air_freights,
        sea_freights=sea_freights,
        recent_vehicle_verifications=recent_vehicle_verifications,
        recent_global_couriers=recent_global_couriers,
        recent_air_freights=recent_air_freights,
        recent_sea_freights=recent_sea_freights
    )

@admin_bp.route('/signup', methods=['GET', 'POST'])
def admin_signup():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Validate inputs
        if not name or not email or not password or not confirm_password:
            flash('All fields are required', 'error')
            return render_template('admin/admin_signup.html')
        
        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return render_template('admin/admin_signup.html')
        
        existing_admin = Admin.query.filter_by(email=email).first()
        if existing_admin:
            flash('Email already registered', 'error')
            return render_template('admin/admin_signup.html')
        
        # Create a new admin (but not verified yet)
        new_admin = Admin(name=name, email=email)
        new_admin.set_password(password)
        new_admin.is_verified = False
        
        # Generate a 6-digit verification code
        verification_code = ''.join(random.choices(string.digits, k=6))
        
        # Save verification code to database
        code_entry = VerificationCode(code=verification_code, admin_email=email, admin_name=name)
        
        session['admin_name'] = name
        session['admin_email'] = email
        session['admin_password'] = password
        
        try:
            db.session.add(code_entry)
            db.session.commit()
            
            # Send verification code to owner's email
            msg = Message(
                subject="New Admin Registration Verification Code",
                sender="durojaiyeomobolaji93@gmail.com", 
                recipients=[OWNER_EMAIL]
            )
            msg.body = f"""
            A new admin is trying to register:
            
            Name: {name}
            Email: {email}
            
            Verification Code: {verification_code}
            
            If you did not authorize this registration, please ignore this email.
            """
            mail.send(msg)
            
            # Redirect to verification page
            return redirect(url_for('admin.verify_code'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'An error occurred: {str(e)}', 'error')
            return render_template('admin/admin_signup.html')
    
    return render_template('admin/admin_signup.html')

@admin_bp.route('/verify', methods=['GET', 'POST'])
def verify_code():
    if 'admin_email' not in session:
        flash('Please complete the registration form first', 'error')
        return redirect(url_for('admin.admin_signup'))
    
    if request.method == 'POST':
        verification_code = request.form.get('verification_code')
        
        if not verification_code:
            flash('Verification code is required', 'error')
            return render_template('admin/verify_code.html')
        
        # Check if code exists and is valid
        valid_code = VerificationCode.query.filter_by(
            code=verification_code,
            admin_email=session['admin_email'],
            is_used=False
        ).first()
        
        if not valid_code:
            flash('Invalid verification code', 'error')
            return render_template('admin/verify_code.html')
        
        try:
            # Create and save the admin
            new_admin = Admin(name=session['admin_name'], email=session['admin_email'])
            new_admin.set_password(session['admin_password'])
            new_admin.is_verified = True
            
            # Mark code as used
            valid_code.is_used = True
            
            db.session.add(new_admin)
            db.session.commit()
            
            # Clear sensitive session data
            session.pop('admin_name', None)
            session.pop('admin_email', None)
            session.pop('admin_password', None)
            
            flash('Admin account created successfully! Please login.', 'success')
            return redirect(url_for('admin.admin_login'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'An error occurred: {str(e)}', 'error')
            return render_template('admin/verify_code.html')
    
    return render_template('admin/verify_code.html')

@admin_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember_me = True if request.form.get('remember_me') else False
        
        # Validate inputs
        if not email or not password:
            flash('Email and password are required', 'error')
            return render_template('admin/admin_login.html')
        
        # Find admin by email
        admin = Admin.query.filter_by(email=email).first()
        
        # Check if admin exists and password is correct
        if not admin or not admin.check_password(password):
            flash('Invalid email or password', 'error')
            return render_template('admin/admin_login.html')
        
        # Check if admin is verified
        if not admin.is_verified:
            flash('Your account is not verified yet', 'error')
            return render_template('admin/admin_login.html')
        
        # Check if admin is active
        if not admin.is_active:
            flash('Your account has been deactivated', 'error')
            return render_template('admin/admin_login.html')
        
        # Set session variables
        session['admin_id'] = admin.id
        session['admin_name'] = admin.name
        session['admin_email'] = admin.email
        
        # If remember me is checked, set session to permanent
        if remember_me:
            session.permanent = True
        
        flash('Login successful!', 'success')
        return redirect(url_for('admin.admin_dashboard'))
    
    return render_template('admin/admin_login.html')

@admin_bp.route('/logout')
def logout():
    # Clear all session data
    session.clear()
    flash('You have been logged out successfully', 'success')
    return redirect(url_for('admin.admin_login'))


#other pages (not dashboard)
@admin_bp.route('/vehicle-verification')
@login_required
def vehicle_verification():
    # Get all vehicle verifications
    all_verifications = VehicleVerification.query.all()
    
    # Filter only pending verifications
    pending_verifications = VehicleVerification.query.filter_by(verification_status='pending').order_by(VehicleVerification.created_at.desc()).all()
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    return render_template(
        'admin/admin_vehicle_verification.html',
        admin=admin,
        vehicle_verifications=all_verifications,
        pending_verifications=pending_verifications
    )

@admin_bp.route('/global-courier')
@login_required
def global_courier():
    # Get all global couriers
    all_couriers = GlobalCourier.query.all()
    
    # Filter only pending couriers
    pending_couriers = GlobalCourier.query.filter_by(status='pending').order_by(GlobalCourier.created_at.desc()).all()
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    return render_template(
        'admin/admin_global_courier.html',
        admin=admin,
        global_couriers=all_couriers,
        pending_couriers=pending_couriers
    )

@admin_bp.route('/vehicle-verification/<int:id>')
@login_required
def vehicle_verification_detail(id):
    # Get the verification by id
    verification = VehicleVerification.query.get_or_404(id)
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    # Get all messages for this verification
    messages = VehicleVerificationMessage.query.filter_by(verification_id=id).order_by(VehicleVerificationMessage.created_at).all()
    
    return render_template(
        'admin/admin_vehicle_verification_details.html',
        admin=admin,
        verification=verification,
        messages=messages
    )

@admin_bp.route('/global-courier/<int:id>')
@login_required
def global_courier_detail(id):
    # Get the courier by id
    courier = GlobalCourier.query.get_or_404(id)
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    # Get all messages for this courier
    messages = GlobalCourierMessage.query.filter_by(courier_id=id).order_by(GlobalCourierMessage.created_at).all()
    
    return render_template(
        'admin/admin_global_courier_details.html',
        admin=admin,
        courier=courier,
        messages=messages
    )

@admin_bp.route('/vehicle-verification/<int:id>/status', methods=['POST'])
@login_required
def update_vehicle_verification_status(id):
    verification = VehicleVerification.query.get_or_404(id)
    
    new_status = request.form.get('status')
    if new_status not in ['pending', 'processing', 'completed', 'declined']:
        flash('Invalid status value', 'error')
        return redirect(url_for('admin.vehicle_verification_detail', id=id))
    
    # Update status
    old_status = verification.verification_status
    verification.verification_status = new_status
    
    try:
        db.session.commit()
        
        # Add system message about status change
        status_message = VehicleVerificationMessage(
            verification_id=id,
            content=f"Status changed from {old_status} to {new_status}",
            is_admin=True
        )
        db.session.add(status_message)
        db.session.commit()
        
        # Send email notification to user about status change
        msg = Message(
            subject=f"Vehicle Verification Status Update - {new_status.capitalize()}",
            sender="durojaiyeomobolaji93@gmail.com",
            recipients=[verification.email]
        )
        msg.body = f"""
        Dear {verification.name},
        
        Your vehicle verification request (ID: VV-{verification.id}) status has been updated to {new_status.capitalize()}.
        
        {get_status_message(new_status)}
        
        If you have any questions, please reply to this email.
        
        Regards,
        Pafelng Team
        """
        mail.send(msg)
        
        flash(f'Status updated to {new_status} successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('admin.vehicle_verification_detail', id=id))

@admin_bp.route('/global-courier/<int:id>/status', methods=['POST'])
@login_required
def update_global_courier_status(id):
    courier = GlobalCourier.query.get_or_404(id)
    
    new_status = request.form.get('status')
    if new_status not in ['pending', 'processing', 'completed', 'declined']:
        flash('Invalid status value', 'error')
        return redirect(url_for('admin.global_courier_detail', id=id))
    
    # Update status
    old_status = courier.status
    courier.status = new_status
    
    try:
        db.session.commit()
        
        # Add system message about status change
        status_message = GlobalCourierMessage(
            courier_id=id,
            content=f"Status changed from {old_status} to {new_status}",
            is_admin=True
        )
        db.session.add(status_message)
        db.session.commit()
        
        # Send email notification to user about status change
        msg = Message(
            subject=f"Global Courier Request Status Update - {new_status.capitalize()}",
            sender="durojaiyeomobolaji93@gmail.com",
            recipients=[courier.email]
        )
        msg.body = f"""
        Dear {courier.name},
        
        Your global courier request (ID: GC-{courier.id}) status has been updated to {new_status.capitalize()}.
        
        {get_status_message(new_status)}
        
        If you have any questions, please reply to this email.
        
        Regards,
        Pafelng Team
        """
        mail.send(msg)
        
        flash(f'Status updated to {new_status} successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('admin.global_courier_detail', id=id))

@admin_bp.route('/vehicle-verification/<int:id>/message', methods=['POST'])
@login_required
def send_vehicle_verification_message(id):
    verification = VehicleVerification.query.get_or_404(id)
    
    message_content = request.form.get('message')
    if not message_content:
        flash('Message content is required', 'error')
        return redirect(url_for('admin.vehicle_verification_detail', id=id))
    
    # Handle attachment if any - Updated to match user route approach
    attachment_path = None
    original_filename = None
    
    if 'attachment' in request.files and request.files['attachment'].filename:
        try:
            attachment_path, original_filename = save_file(
                request.files['attachment'], 
                'admin_documents'
            )
        except Exception as e:
            flash(f'Error uploading file: {str(e)}', 'error')
            return redirect(url_for('admin.vehicle_verification_detail', id=id))
    
    # Create new message
    new_message = VehicleVerificationMessage(
        verification_id=id,
        content=message_content,
        attachment_path=attachment_path,
        original_filename=original_filename,
        is_admin=True
    )
    
    try:
        db.session.add(new_message)
        db.session.commit()
        
        # Send email notification to user
        msg = Message(
            subject=f"New Message Regarding Your Vehicle Verification Request",
            sender="durojaiyeomobolaji93@gmail.com", 
            recipients=[verification.email]
        )
        msg.body = f"""
        Dear {verification.name},
        
        You have received a new message regarding your vehicle verification request (ID: VV-{verification.id}).
        
        Message:
        {message_content}
        
        Please log in to your account to view the complete conversation and any attachments.
        
        Regards,
        Pafelng Team
        """
        
        if attachment_path and original_filename:
            with current_app.open_resource(os.path.join(current_app.root_path, 'static', attachment_path)) as fp:
                msg.attach(original_filename, "application/octet-stream", fp.read())
        
        mail.send(msg)
        
        flash('Message sent successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('admin.vehicle_verification_detail', id=id))

@admin_bp.route('/global-courier/<int:id>/message', methods=['POST'])
@login_required
def send_global_courier_message(id):
    courier = GlobalCourier.query.get_or_404(id)
    
    message_content = request.form.get('message')
    if not message_content:
        flash('Message content is required', 'error')
        return redirect(url_for('admin.global_courier_detail', id=id))
    
    # Handle attachment if any - Updated to match user route approach
    attachment_path = None
    original_filename = None
    
    if 'attachment' in request.files and request.files['attachment'].filename:
        try:
            attachment_path, original_filename = save_file(
                request.files['attachment'], 
                'admin_documents'
            )
        except Exception as e:
            flash(f'Error uploading file: {str(e)}', 'error')
            return redirect(url_for('admin.global_courier_detail', id=id))
    
    # Create new message
    new_message = GlobalCourierMessage(
        courier_id=id,
        content=message_content,
        attachment_path=attachment_path,
        original_filename=original_filename,
        is_admin=True
    )
    
    try:
        db.session.add(new_message)
        db.session.commit()
        
        # Send email notification to user
        msg = Message(
            subject=f"New Message Regarding Your Global Courier Request",
            sender="durojaiyeomobolaji93@gmail.com", 
            recipients=[courier.email]
        )
        msg.body = f"""
        Dear {courier.name},
        
        You have received a new message regarding your global courier request (ID: GC-{courier.id}).
        
        Message:
        {message_content}
        
        Please log in to your account to view the complete conversation and any attachments.
        
        Regards,
        Pafelng Team
        """
        
        if attachment_path and original_filename:
            with current_app.open_resource(os.path.join(current_app.root_path, 'static', attachment_path)) as fp:
                msg.attach(original_filename, "application/octet-stream", fp.read())
        
        mail.send(msg)
        
        flash('Message sent successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('admin.global_courier_detail', id=id))
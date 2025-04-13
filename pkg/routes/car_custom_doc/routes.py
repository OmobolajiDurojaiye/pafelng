import os
import re
import random
import time
import uuid
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, VehicleVerification, db

car_doc_bp = Blueprint('car_custom_doc', __name__, url_prefix='/car')

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

@car_doc_bp.route('/vehicle-verification', methods=['GET', 'POST'])
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
        
        if not name or not email or not phone or not c_number or not payment_method:
            flash('All required fields must be filled', 'error')
            return redirect(url_for('car_custom_doc.vehicle_verification'))
        
        new_verification = VehicleVerification(
            user_id=user_id,
            name=name,
            email=email,
            phone=phone,
            c_number=c_number,
            payment_method=payment_method
        )
        
        if 'document' not in request.files or not request.files['document'].filename:
            flash('Please upload a document', 'error')
            return redirect(url_for('car_custom_doc.vehicle_verification'))
            
        file = request.files['document']
        
        if not allowed_file(file.filename):
            flash('Invalid file type. Please upload PDF, JPG, or PNG files only.', 'error')
            return redirect(url_for('car_custom_doc.vehicle_verification'))
        
        original_filename = secure_filename(file.filename)
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        unique_id = str(uuid.uuid4().hex[:8]) + str(random.randint(1000, 9999))
        safe_username = secure_filename(user.name)
        new_filename = f"{safe_username}_{unique_id}.{file_extension}"
        
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'vehicle_documents')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        file_path = os.path.join(upload_folder, new_filename)
        file.save(file_path)
        
        new_verification.document_path = 'uploads/vehicle_documents/' + new_filename
        new_verification.original_filename = original_filename
        
        db.session.add(new_verification)
        db.session.commit()
        
        flash('Vehicle verification submitted successfully', 'success')
        return redirect(url_for('car_custom_doc.my_verifications'))
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in vehicle verification: {str(e)}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return redirect(url_for('car_custom_doc.vehicle_verification'))


@car_doc_bp.route('/my-verifications')
@login_required
def my_verifications():
    user_id = session['user_id']
    verifications = VehicleVerification.query.filter_by(user_id=user_id).order_by(VehicleVerification.created_at.desc()).all()
    return render_template('user/my_verifications.html', verifications=verifications)
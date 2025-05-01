from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from pkg.models import db, Admin, AirFreight, SeaFreight, AirFreightMessage, SeaFreightMessage
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
import random
import string
from flask_mail import Mail, Message
from functools import wraps
import os
import uuid
from datetime import datetime

admin_air_sea_bp = Blueprint('admin_air_sea', __name__, url_prefix='/admin-air-sea')
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

@admin_air_sea_bp.route('/air-freight')
@login_required
def air_freight():
    # Get all air freights (all statuses)
    air_freights = AirFreight.query.order_by(AirFreight.created_at.desc()).all()
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    return render_template(
        'admin/admin_air_freight.html',
        admin=admin,
        air_freights=air_freights
    )

@admin_air_sea_bp.route('/sea-freight')
@login_required
def sea_freight():
    # Get all sea freights (all statuses)
    sea_freights = SeaFreight.query.order_by(SeaFreight.created_at.desc()).all()
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    return render_template(
        'admin/admin_sea_freight.html',
        admin=admin,
        sea_freights=sea_freights
    )

@admin_air_sea_bp.route('/air-freight/<int:id>')
@login_required
def air_freight_detail(id):
    # Get the air freight by id
    freight = AirFreight.query.get_or_404(id)
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    # Get all messages for this freight
    messages = AirFreightMessage.query.filter_by(freight_id=id).order_by(AirFreightMessage.created_at).all()
    
    return render_template(
        'admin/admin_air_freight_details.html',
        admin=admin,
        freight=freight,
        messages=messages
    )

@admin_air_sea_bp.route('/sea-freight/<int:id>')
@login_required
def sea_freight_detail(id):
    # Get the sea freight by id
    freight = SeaFreight.query.get_or_404(id)
    
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    
    # Get all messages for this freight
    messages = SeaFreightMessage.query.filter_by(freight_id=id).order_by(SeaFreightMessage.created_at).all()
    
    return render_template(
        'admin/admin_sea_freight_details.html',
        admin=admin,
        freight=freight,
        messages=messages
    )

@admin_air_sea_bp.route('/air-freight/<int:id>/status', methods=['POST'])
@login_required
def update_air_freight_status(id):
    freight = AirFreight.query.get_or_404(id)
    
    new_status = request.form.get('status')
    if new_status not in ['pending', 'processing', 'completed', 'declined']:
        flash('Invalid status value', 'error')
        return redirect(url_for('admin_air_sea.air_freight_detail', id=id))
    
    # Update status
    old_status = freight.status
    freight.status = new_status
    
    try:
        db.session.commit()
        
        # Add system message about status change
        status_message = AirFreightMessage(
            freight_id=id,
            content=f"Status changed from {old_status} to {new_status}",
            is_admin=True
        )
        db.session.add(status_message)
        db.session.commit()
        
        # Send email notification to user about status change
        msg = Message(
            subject=f"Air Freight Request Status Update - {new_status.capitalize()}",
            sender="durojaiyeomobolaji93@gmail.com",
            recipients=[freight.email]
        )
        msg.html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; color: #333; padding: 20px;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-width: 600px; margin: auto;">
            <h2 style="color: #42b0d5;">Air Freight Status Update</h2>
            <p>Dear <strong>{freight.name}</strong>,</p>
            <p>Your air freight request <strong>(ID: AF-{freight.id})</strong> status has been updated to:</p>
            <p style="font-size: 20px; color: #42b0d5;"><strong>{new_status.capitalize()}</strong></p>
            <p>{get_status_message(new_status)}</p>
            <hr style="margin: 20px 0;">
            <p>If you have any questions, simply reply to this email.</p>
            <p style="color: #6c757d;">— PafelNG Logistics Team</p>
            </div>
        </body>
        </html>
        """

        mail.send(msg)
        
        flash(f'Status updated to {new_status} successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('admin_air_sea.air_freight_detail', id=id))

@admin_air_sea_bp.route('/sea-freight/<int:id>/status', methods=['POST'])
@login_required
def update_sea_freight_status(id):
    freight = SeaFreight.query.get_or_404(id)
    
    new_status = request.form.get('status')
    if new_status not in ['pending', 'processing', 'completed', 'declined']:
        flash('Invalid status value', 'error')
        return redirect(url_for('admin_air_sea.sea_freight_detail', id=id))
    
    # Update status
    old_status = freight.status
    freight.status = new_status
    
    try:
        db.session.commit()
        
        # Add system message about status change
        status_message = SeaFreightMessage(
            freight_id=id,
            content=f"Status changed from {old_status} to {new_status}",
            is_admin=True
        )
        db.session.add(status_message)
        db.session.commit()
        
        # Send email notification to user about status change
        msg = Message(
            subject=f"Sea Freight Request Status Update - {new_status.capitalize()}",
            sender="durojaiyeomobolaji93@gmail.com",
            recipients=[freight.email]
        )
        msg.html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <div style="background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-width: 600px; margin: auto;">
            <h2 style="color: #42b0d5;">Sea Freight Request Status</h2>
            <p>Hello <strong>{freight.name}</strong>,</p>
            <p>Your sea freight request <strong>(ID: SF-{freight.id})</strong> has been marked as:</p>
            <p style="font-size: 18px; color: #42b0d5;"><strong>{new_status.capitalize()}</strong></p>
            <p>{get_status_message(new_status)}</p>
            <p style="margin-top: 20px;">If you need help, feel free to reply.</p>
            <p style="color: #6c757d;">Sincerely,<br>The PafelNG Team</p>
            </div>
        </body>
        </html>
        """

        mail.send(msg)
        
        flash(f'Status updated to {new_status} successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('admin_air_sea.sea_freight_detail', id=id))

@admin_air_sea_bp.route('/air-freight/<int:id>/message', methods=['POST'])
@login_required
def send_air_freight_message(id):
    freight = AirFreight.query.get_or_404(id)
    
    message_content = request.form.get('message')
    if not message_content:
        flash('Message content is required', 'error')
        return redirect(url_for('admin_air_sea.air_freight_detail', id=id))
    
    # Handle attachment if any
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
            return redirect(url_for('admin_air_sea.air_freight_detail', id=id))
    
    # Create new message
    new_message = AirFreightMessage(
        freight_id=id,
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
            subject=f"New Message Regarding Your Air Freight Request",
            sender="durojaiyeomobolaji93@gmail.com", 
            recipients=[freight.email]
        )
        msg.html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; color: #333; padding: 20px;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-width: 600px; margin: auto;">
            <h2 style="color: #42b0d5;">New Message About Your Air Freight</h2>
            <p>Hi <strong>{freight.name}</strong>,</p>
            <p>You've received a new message regarding your air freight request (ID: AF-{freight.id}):</p>
            <blockquote style="border-left: 5px solid #42b0d5; padding-left: 15px; margin: 15px 0; color: #333;">
                {message_content}
            </blockquote>
            <p>Please log into your dashboard to view the full conversation or download any attachments.</p>
            <p style="color: #6c757d;">Thanks,<br>PafelNG Logistics Team</p>
            </div>
        </body>
        </html>
        """

        
        if attachment_path and original_filename:
            with current_app.open_resource(os.path.join(current_app.root_path, 'static', attachment_path)) as fp:
                msg.attach(original_filename, "application/octet-stream", fp.read())
        
        mail.send(msg)
        
        flash('Message sent successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('admin_air_sea.air_freight_detail', id=id))

@admin_air_sea_bp.route('/sea-freight/<int:id>/message', methods=['POST'])
@login_required
def send_sea_freight_message(id):
    freight = SeaFreight.query.get_or_404(id)
    
    message_content = request.form.get('message')
    if not message_content:
        flash('Message content is required', 'error')
        return redirect(url_for('admin_air_sea.sea_freight_detail', id=id))
    
    # Handle attachment if any
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
            return redirect(url_for('admin_air_sea.sea_freight_detail', id=id))
    
    # Create new message
    new_message = SeaFreightMessage(
        freight_id=id,
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
            subject=f"New Message Regarding Your Sea Freight Request",
            sender="durojaiyeomobolaji93@gmail.com", 
            recipients=[freight.email]
        )
        msg.html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <div style="background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-width: 600px; margin: auto;">
            <h2 style="color: #42b0d5;">Message From PafelNG</h2>
            <p>Dear <strong>{freight.name}</strong>,</p>
            <p>You received a message regarding your sea freight request (ID: SF-{freight.id}):</p>
            <div style="margin: 20px 0; padding: 15px; background-color: rgba(66, 176, 213, 0.1); border-radius: 10px;">
                {message_content}
            </div>
            <p>Please login to access more details or respond.</p>
            <p style="color: #6c757d;">Best regards,<br>PafelNG Support</p>
            </div>
        </body>
        </html>
        """

        
        if attachment_path and original_filename:
            with current_app.open_resource(os.path.join(current_app.root_path, 'static', attachment_path)) as fp:
                msg.attach(original_filename, "application/octet-stream", fp.read())
        
        mail.send(msg)
        
        flash('Message sent successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'An error occurred: {str(e)}', 'error')
    
    return redirect(url_for('admin_air_sea.sea_freight_detail', id=id))
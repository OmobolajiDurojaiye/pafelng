from flask import Blueprint, request, render_template, redirect, url_for, flash, jsonify, current_app
from werkzeug.utils import secure_filename
import os, uuid, datetime
from pkg.models import db, UnsignedVehicleVerification
import requests

unsigned_bp = Blueprint("unsigned", __name__, url_prefix="/unsigned")

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@unsigned_bp.route('/vehicle-verification', methods=['GET', 'POST'])
def vehicle_verification():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        c_number = request.form.get('cNumber')
        payment_method = request.form.get('paymentMethod')
        paystack_ref = request.form.get('paystack_ref')
        
        # Create new unsigned vehicle verification entry
        verification = UnsignedVehicleVerification(
            name=name,
            email=email,
            phone=phone,
            c_number=c_number,
            payment_method=payment_method,
            paystack_ref=paystack_ref,
            amount_paid=15000,  # Amount in Naira
            payment_verified=True if paystack_ref else False
        )
        
        # Handle document upload
        if 'document' in request.files:
            file = request.files['document']
            if file and allowed_file(file.filename):
                # Generate unique filename
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                
                # Save the file
                uploads_dir = os.path.join(current_app.root_path, 'static/uploads/vehicle_docs')
                if not os.path.exists(uploads_dir):
                    os.makedirs(uploads_dir)
                
                file_path = os.path.join(uploads_dir, unique_filename)
                file.save(file_path)
                
                # Update verification record with file info
                verification.document_path = f"/static/uploads/vehicle_docs/{unique_filename}"
                verification.original_filename = filename
        
        # Save verification to database
        db.session.add(verification)
        db.session.commit()

        
        flash('Your verification request has been submitted successfully!', 'success')
        return redirect(url_for('index.home'))
    
    return render_template('unsigned/vehicle_verification.html')

@unsigned_bp.route('/verify-payment/<reference>', methods=['GET'])
def verify_payment(reference):
    # Verify Paystack payment using their API
    secret_key = current_app.config.get('PAYSTACK_SECRET_KEY')
    headers = {
        'Authorization': f'Bearer {secret_key}'
    }
    
    response = requests.get(f'https://api.paystack.co/transaction/verify/{reference}', headers=headers)
    data = response.json()
    
    if data['status'] and data['data']['status'] == 'success':
        # Find the verification with this reference
        verification = UnsignedVehicleVerification.query.filter_by(paystack_ref=reference).first()
        
        if verification:
            verification.payment_verified = True
            db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Payment verified successfully'
            })
    
    return jsonify({
        'success': False,
        'message': 'Payment verification failed'
    })
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import re

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship with VehicleVerification
    vehicle_verifications = db.relationship('VehicleVerification', backref='user', lazy=True)

    # Relationship with GlobalCourier
    global_couriers = db.relationship('GlobalCourier', backref='user', lazy=True)

    # User.air_freights = db.relationship('AirFreight', backref='user', lazy=True)
    # User.sea_freights = db.relationship('SeaFreight', backref='user', lazy=True)
    
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at,
            'is_active': self.is_active
        }

class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at,
            'is_active': self.is_active,
            'is_verified': self.is_verified
        }

class VerificationCode(db.Model):
    __tablename__ = 'verification_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(6), nullable=False)
    admin_email = db.Column(db.String(120), nullable=False)
    admin_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_used = db.Column(db.Boolean, default=False)
    
    def __init__(self, code, admin_email, admin_name):
        self.code = code
        self.admin_email = admin_email
        self.admin_name = admin_name

class VehicleVerification(db.Model):
    __tablename__ = 'vehicle_verifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    
    # For C-Number verification method
    c_number = db.Column(db.String(50), nullable=True)
    
    # For document upload verification method
    document_path = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)
    
    payment_method = db.Column(db.String(50), nullable=False)
    verification_status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    paystack_ref = db.Column(db.String(100), nullable=True)
    amount_paid = db.Column(db.Integer, nullable=True)
    payment_verified = db.Column(db.Boolean, default=False)

    
    # Relationship with VehicleVerificationMessage
    messages = db.relationship('VehicleVerificationMessage', backref='verification', lazy=True, order_by='VehicleVerificationMessage.created_at')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'c_number': self.c_number,
            'document_path': self.document_path,
            'original_filename': self.original_filename,
            'payment_method': self.payment_method,
            'verification_status': self.verification_status,
            'created_at': self.created_at
        }

class VehicleVerificationMessage(db.Model):
    __tablename__ = 'vehicle_verification_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    verification_id = db.Column(db.Integer, db.ForeignKey('vehicle_verifications.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    attachment_path = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'verification_id': self.verification_id,
            'content': self.content,
            'attachment_path': self.attachment_path,
            'original_filename': self.original_filename,
            'is_admin': self.is_admin,
            'created_at': self.created_at
        }

class GlobalCourier(db.Model):
    __tablename__ = 'global_couriers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    courier_company = db.Column(db.String(50), nullable=False)
    tracking_number = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationship with GlobalCourierMessage
    messages = db.relationship('GlobalCourierMessage', backref='courier', lazy=True, order_by='GlobalCourierMessage.created_at')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'courier_company': self.courier_company,
            'tracking_number': self.tracking_number,
            'status': self.status,
            'created_at': self.created_at
        }

class GlobalCourierMessage(db.Model):
    __tablename__ = 'global_courier_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    courier_id = db.Column(db.Integer, db.ForeignKey('global_couriers.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    attachment_path = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'courier_id': self.courier_id,
            'content': self.content,
            'attachment_path': self.attachment_path,
            'original_filename': self.original_filename,
            'is_admin': self.is_admin,
            'created_at': self.created_at
        }

# Add these to your models.py file

class AirFreight(db.Model):
    __tablename__ = 'air_freights'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    freight_type = db.Column(db.String(10), nullable=False)  # Import or Export
    
    # For Import with Airwaybill
    airwaybill_number = db.Column(db.String(50), nullable=True)
    has_invoice = db.Column(db.Boolean, nullable=True)
    
    # For Import (pick up and delivery) and Export
    pickup_address = db.Column(db.Text, nullable=True)
    delivery_address = db.Column(db.Text, nullable=True)
    weight = db.Column(db.String(50), nullable=True)
    volumetric_dimension = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    invoice_value = db.Column(db.String(50), nullable=True)
    num_boxes = db.Column(db.Integer, nullable=True)
    multiple_boxes_details = db.Column(db.Text, nullable=True)
    shipping_choice = db.Column(db.String(50), nullable=True)
    
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationship with User
    user = db.relationship('User', backref=db.backref('air_freights', lazy=True))
    
    # Relationship with Messages
    messages = db.relationship('AirFreightMessage', backref='freight', lazy=True, order_by='AirFreightMessage.created_at')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'freight_type': self.freight_type,
            'airwaybill_number': self.airwaybill_number,
            'has_invoice': self.has_invoice,
            'pickup_address': self.pickup_address,
            'delivery_address': self.delivery_address,
            'weight': self.weight,
            'volumetric_dimension': self.volumetric_dimension,
            'description': self.description,
            'invoice_value': self.invoice_value,
            'num_boxes': self.num_boxes,
            'multiple_boxes_details': self.multiple_boxes_details,
            'shipping_choice': self.shipping_choice,
            'status': self.status,
            'created_at': self.created_at
        }

class AirFreightMessage(db.Model):
    __tablename__ = 'air_freight_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    freight_id = db.Column(db.Integer, db.ForeignKey('air_freights.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    attachment_path = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'freight_id': self.freight_id,
            'content': self.content,
            'attachment_path': self.attachment_path,
            'original_filename': self.original_filename,
            'is_admin': self.is_admin,
            'created_at': self.created_at
        }

class SeaFreight(db.Model):
    __tablename__ = 'sea_freights'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    freight_type = db.Column(db.String(10), nullable=False)  # Import or Export
    
    # For Import with tracking number
    tracking_number = db.Column(db.String(50), nullable=True)
    has_invoice = db.Column(db.Boolean, nullable=True)
    
    # For Import (pick up and delivery) and Export
    pickup_address = db.Column(db.Text, nullable=True)
    delivery_address = db.Column(db.Text, nullable=True)
    weight = db.Column(db.String(50), nullable=True)
    volumetric_dimension = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    invoice_value = db.Column(db.String(50), nullable=True)
    num_boxes = db.Column(db.Integer, nullable=True)
    multiple_boxes_details = db.Column(db.Text, nullable=True)
    shipping_choice = db.Column(db.String(50), nullable=True)
    
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationship with User
    user = db.relationship('User', backref=db.backref('sea_freights', lazy=True))
    
    # Relationship with Messages
    messages = db.relationship('SeaFreightMessage', backref='freight', lazy=True, order_by='SeaFreightMessage.created_at')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'freight_type': self.freight_type,
            'tracking_number': self.tracking_number,
            'has_invoice': self.has_invoice,
            'pickup_address': self.pickup_address,
            'delivery_address': self.delivery_address,
            'weight': self.weight,
            'volumetric_dimension': self.volumetric_dimension,
            'description': self.description,
            'invoice_value': self.invoice_value,
            'num_boxes': self.num_boxes,
            'multiple_boxes_details': self.multiple_boxes_details,
            'shipping_choice': self.shipping_choice,
            'status': self.status,
            'created_at': self.created_at
        }

class SeaFreightMessage(db.Model):
    __tablename__ = 'sea_freight_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    freight_id = db.Column(db.Integer, db.ForeignKey('sea_freights.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    attachment_path = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'freight_id': self.freight_id,
            'content': self.content,
            'attachment_path': self.attachment_path,
            'original_filename': self.original_filename,
            'is_admin': self.is_admin,
            'created_at': self.created_at
        }
    

class BlogPost(db.Model):
    __tablename__ = 'blog_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)
    is_published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def __init__(self, title, content, slug=None):
        self.title = title
        self.content = content
        if slug is None:
            self.slug = self.generate_slug(title)
        else:
            self.slug = slug
    
    @staticmethod
    def generate_slug(title):
        # Convert to lowercase and replace spaces with hyphens
        slug = title.lower().replace(' ', '-')
        # Remove special characters
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        # Replace multiple hyphens with single hyphen
        slug = re.sub(r'-+', '-', slug)
        return slug
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'cover_image': self.cover_image,
            'original_filename': self.original_filename,
            'is_published': self.is_published,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }


class IssueReport(db.Model):
    __tablename__ = 'issue_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    page_url = db.Column(db.String(255), nullable=False)
    error_type = db.Column(db.String(50), nullable=False)  # 404, 403, 500, etc.
    status = db.Column(db.String(20), default='pending')  # pending, resolved, investigating
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'description': self.description,
            'page_url': self.page_url,
            'error_type': self.error_type,
            'status': self.status,
            'created_at': self.created_at
        }

class NewsletterSubscriber(db.Model):
    __tablename__ = 'newsletter_subscribers'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    source = db.Column(db.String(50), nullable=True)  # 'article', 'footer', etc.
    subscribed_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __init__(self, email, source=None):
        self.email = email
        self.source = source
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'source': self.source,
            'subscribed_at': self.subscribed_at,
            'is_active': self.is_active
        }
    
class UnsignedVehicleVerification(db.Model):
    __tablename__ = 'unsigned_vehicle_verifications'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    
    # For C-Number verification method
    c_number = db.Column(db.String(50), nullable=True)
    
    # For document upload verification method
    document_path = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)
    
    payment_method = db.Column(db.String(50), nullable=False)
    verification_status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    paystack_ref = db.Column(db.String(100), nullable=True)
    amount_paid = db.Column(db.Integer, nullable=True)
    payment_verified = db.Column(db.Boolean, default=False)
    
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'c_number': self.c_number,
            'document_path': self.document_path,
            'original_filename': self.original_filename,
            'payment_method': self.payment_method,
            'verification_status': self.verification_status,
            'created_at': self.created_at
        }
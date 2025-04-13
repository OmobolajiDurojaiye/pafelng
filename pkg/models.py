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
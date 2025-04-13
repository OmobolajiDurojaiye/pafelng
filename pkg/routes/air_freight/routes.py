import os
import re
import random
import time
import uuid
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, db

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

@air_freight_bp.route('/air-freight')
@login_required
def air_freight():
    return render_template('user/air_freight.html')

@air_freight_bp.route('/my-air-freight')
@login_required
def my_air_freight():
    user_id = session['user_id']
    return render_template('user/my_air_freight.html')
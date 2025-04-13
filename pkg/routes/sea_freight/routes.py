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

sea_freight_bp = Blueprint('sea_freight', __name__, url_prefix='/sea-freight')

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@sea_freight_bp.route('/sea-freight')
@login_required
def sea_freight():
    return render_template('user/sea_freight.html')


@sea_freight_bp.route('/my-sea-freight')
@login_required
def my_sea_freight():
    user_id = session['user_id']
    return render_template('user/my_sea_freight.html')

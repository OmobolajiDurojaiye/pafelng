from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, current_app
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, BlogPost, NewsletterSubscriber, db
import os
import datetime
import uuid
import random
from sqlalchemy import desc

blog_bp = Blueprint('blog', __name__, url_prefix='/blog')

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

@blog_bp.route('/')
def all_blogs():
    posts = BlogPost.query.filter_by(is_published=True).order_by(desc(BlogPost.created_at)).all()
    newest_post = posts[0] if posts else None
    current_year = datetime.datetime.now().year
    return render_template('blog/all_blog.html', posts=posts, newest_post=newest_post, current_year=current_year)

@blog_bp.route('/post/<slug>')
def blog_post(slug):
    post = BlogPost.query.filter_by(slug=slug, is_published=True).first_or_404()
    current_year = datetime.datetime.now().year
    
    # Get related posts (excluding current post)
    related_posts = BlogPost.query.filter(
        BlogPost.is_published == True,
        BlogPost.id != post.id
    ).order_by(desc(BlogPost.created_at)).limit(3).all()
    
    return render_template('blog/blog_page.html', post=post, related_posts=related_posts, current_year=current_year)

@blog_bp.route('/search')
def search_blogs():
    query = request.args.get('query', '')
    
    if query:
        # Search in title and content
        posts = BlogPost.query.filter(
            BlogPost.is_published == True,
            (BlogPost.title.ilike(f'%{query}%') | BlogPost.content.ilike(f'%{query}%'))
        ).order_by(desc(BlogPost.created_at)).all()
    else:
        posts = []
    
    current_year = datetime.datetime.now().year
    return render_template('blog/all_blog.html', posts=posts, search_query=query, current_year=current_year)

@blog_bp.route('/subscribe-newsletter', methods=['POST'])
def subscribe_newsletter():
    email = request.form.get('email')
    source = request.form.get('source', 'footer')  # Default to 'footer' if not specified
    
    if not email:
        flash('Email address is required.', 'error')
        return redirect(request.referrer or url_for('blog.all_blogs'))
    
    # Check if email already exists
    existing_subscriber = NewsletterSubscriber.query.filter_by(email=email).first()
    
    if existing_subscriber:
        if existing_subscriber.is_active:
            flash('You are already subscribed to our newsletter!', 'error')
        else:
            # Reactivate the subscription
            existing_subscriber.is_active = True
            existing_subscriber.source = source  # Update the source
            db.session.commit()
            flash('Your subscription has been reactivated!', 'success')
    else:
        # Create new subscriber
        new_subscriber = NewsletterSubscriber(email=email, source=source)
        db.session.add(new_subscriber)
        db.session.commit()
        flash('Thank you for subscribing to our newsletter!', 'success')
    
    # Redirect back to the referring page
    return redirect(request.referrer or url_for('blog.all_blogs'))
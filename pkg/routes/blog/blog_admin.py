from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, current_app
from werkzeug.utils import secure_filename
from functools import wraps
from pkg.models import User, BlogPost, db
import os
import datetime
import re
import uuid
import random

blog_admin_bp = Blueprint('blog_admin', __name__, url_prefix='/admin-blog')

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session: 
            flash('Please log in to access this page', 'error')
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated_function

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Blog dashboard
@blog_admin_bp.route('/')
@login_required
def blog_dashboard():
    return redirect(url_for('blog_admin.all_posts'))

# All posts
@blog_admin_bp.route('/posts')
@login_required
def all_posts():
    posts = BlogPost.query.order_by(BlogPost.created_at.desc()).all()
    return render_template('blog/admin_all_posts.html', posts=posts)

# Create new post
@blog_admin_bp.route('/posts/new', methods=['GET', 'POST'])
@login_required
def new_post():
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        
        # Generate slug from title
        slug = BlogPost.generate_slug(title)
        
        # Check if a post with this slug already exists
        existing_post = BlogPost.query.filter_by(slug=slug).first()
        if existing_post:
            # Append a number to make the slug unique
            count = 1
            new_slug = f"{slug}-{count}"
            while BlogPost.query.filter_by(slug=new_slug).first():
                count += 1
                new_slug = f"{slug}-{count}"
            slug = new_slug
        
        post = BlogPost(title=title, content=content, slug=slug)
        
        # Handle cover image upload
        if 'cover_image' in request.files:
            file = request.files['cover_image']
            if file and file.filename:
                if not allowed_file(file.filename):
                    flash('Invalid file type. Please upload JPG, PNG, GIF or WebP files only.', 'error')
                    return redirect(url_for('blog_admin.new_post'))
                
                original_filename = secure_filename(file.filename)
                file_extension = original_filename.rsplit('.', 1)[1].lower()
                unique_id = str(uuid.uuid4().hex[:8]) + str(random.randint(1000, 9999))
                
                new_filename = f"blog_{unique_id}.{file_extension}"
                
                upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'blog_images')
                if not os.path.exists(upload_folder):
                    os.makedirs(upload_folder)
                
                file_path = os.path.join(upload_folder, new_filename)
                file.save(file_path)
                
                post.cover_image = os.path.join('uploads', 'blog_images', new_filename)
                post.original_filename = original_filename
        
        db.session.add(post)
        db.session.commit()
        
        flash('Blog post created successfully!', 'success')
        return redirect(url_for('blog_admin.all_posts'))
    
    return render_template('blog/admin_blog.html')

# Edit post
@blog_admin_bp.route('/posts/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(id):
    post = BlogPost.query.get_or_404(id)
    
    if request.method == 'POST':
        post.title = request.form.get('title')
        post.content = request.form.get('content')
        
        # Handle cover image upload
        if 'cover_image' in request.files:
            file = request.files['cover_image']
            if file and file.filename:
                if not allowed_file(file.filename):
                    flash('Invalid file type. Please upload JPG, PNG, GIF or WebP files only.', 'error')
                    return redirect(url_for('blog_admin.edit_post', id=id))
                    
                # Delete old cover image if it exists
                if post.cover_image:
                    try:
                        old_file_path = os.path.join(current_app.root_path, 'static', post.cover_image)
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                    except Exception as e:
                        print(f"Error deleting old image: {e}")
                
                original_filename = secure_filename(file.filename)
                file_extension = original_filename.rsplit('.', 1)[1].lower()
                unique_id = str(uuid.uuid4().hex[:8]) + str(random.randint(1000, 9999))
                
                new_filename = f"blog_{unique_id}.{file_extension}"
                
                upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'blog_images')
                if not os.path.exists(upload_folder):
                    os.makedirs(upload_folder)
                
                file_path = os.path.join(upload_folder, new_filename)
                file.save(file_path)
                
                post.cover_image = os.path.join('uploads', 'blog_images', new_filename)
                post.original_filename = original_filename
        
        db.session.commit()
        flash('Blog post updated successfully!', 'success')
        return redirect(url_for('blog_admin.all_posts'))
    
    return render_template('blog/admin_blog.html', post=post)

# Delete post
@blog_admin_bp.route('/posts/<int:id>/delete', methods=['POST'])
@login_required
def delete_post(id):
    post = BlogPost.query.get_or_404(id)
    
    # Delete cover image if it exists
    if post.cover_image:
        try:
            file_path = os.path.join(current_app.root_path, 'static', post.cover_image)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting image: {e}")
    
    db.session.delete(post)
    db.session.commit()
    
    flash('Blog post deleted successfully!', 'success')
    return redirect(url_for('blog_admin.all_posts'))

# Toggle publish status
@blog_admin_bp.route('/posts/<int:id>/toggle-publish', methods=['POST'])
@login_required
def toggle_publish(id):
    post = BlogPost.query.get_or_404(id)
    post.is_published = not post.is_published
    db.session.commit()
    
    status = 'published' if post.is_published else 'unpublished'
    flash(f'Blog post {status} successfully!', 'success')
    return redirect(url_for('blog_admin.all_posts'))
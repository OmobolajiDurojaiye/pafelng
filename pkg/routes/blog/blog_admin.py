from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, current_app
from werkzeug.utils import secure_filename
from functools import wraps
from flask_mail import Mail, Message
from pkg.models import User, BlogPost, db, NewsletterSubscriber, Admin
import os
import datetime
import re
import uuid
import random
import html

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

# Helper function to send notification emails to subscribers
def send_notification_emails(post):
    mail = Mail(current_app)
    subscribers = NewsletterSubscriber.query.filter_by(is_active=True).all()
    
    if not subscribers:
        return
    
    # Create an excerpt from the content (first 150 characters)
    content_text = html.unescape(re.sub(r'<[^>]+>', '', post.content))
    excerpt = content_text[:150] + '...' if len(content_text) > 150 else content_text
    
    # Generate the article URL
    article_url = url_for('blog.blog_post', slug=post.slug, _external=True)
    
    # Image URL (if exists)
    image_url = None
    if post.cover_image:
        image_url = url_for('static', filename=post.cover_image, _external=True)
    
    # Create email subject
    subject = f"New Blog Post: {post.title}"
    
    # Create email HTML body
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <div style="background-color: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-width: 600px; margin: auto;">
                <h2 style="color: #42b0d5;">New Article Published!</h2>
                <h3><a href="{article_url}">{post.title}</a></h3>
                
                {'<img src="' + image_url + '" style="max-width:600px; height:auto;" />' if image_url else ''}
                
                <p>{excerpt}</p>
                
                <p><a href="{article_url}">Read the full article</a></p>
                
                <hr>
                <p style="color: #6c757d;">You received this email because you subscribed to our newsletter. 
                If you no longer wish to receive these emails, please contact us.</p>
            </div>
        </body>
    </html>
    """
    
    # Create a single message with BCC for all subscribers
    msg = Message(
        subject=subject,
        # recipients=[current_app.config['MAIL_USERNAME']],  # Send to self
        bcc=[subscriber.email for subscriber in subscribers],  # BCC to all subscribers
        sender="durojaiyeomobolaji93@gmail.com",
        html=html_body
    )
    
    try:
        mail.send(msg)
        print(f"Email notification sent to {len(subscribers)} subscribers")
    except Exception as e:
        print(f"Error sending email notification: {e}")

# Blog dashboard
@blog_admin_bp.route('/')
@login_required
def blog_dashboard():
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    return redirect(url_for('blog_admin.all_posts'), admin=admin)

# All posts
@blog_admin_bp.route('/posts')
@login_required
def all_posts():
    # Get admin info
    admin = Admin.query.get(session['admin_id'])
    posts = BlogPost.query.order_by(BlogPost.created_at.desc()).all()
    return render_template('blog/admin_all_posts.html', posts=posts, admin=admin)

# Create new post
@blog_admin_bp.route('/posts/new', methods=['GET', 'POST'])
@login_required
def new_post():
    # Get admin info
    admin = Admin.query.get(session['admin_id'])

    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        
        # Generate slug from title
        slug = BlogPost.generate_slug(title)
        
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
                
                post.cover_image = 'uploads/blog_images/' + new_filename
                post.original_filename = original_filename
        
        db.session.add(post)
        db.session.commit()
        
        # Send notification emails to subscribers if the post is published
        if post.is_published:
            send_notification_emails(post)

        
        flash('Blog post created successfully!', 'success')
        return redirect(url_for('blog_admin.all_posts'))
    
    return render_template('blog/admin_blog.html', admin=admin)

# Edit post
@blog_admin_bp.route('/posts/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(id):
    # Get admin info
    admin = Admin.query.get(session['admin_id'])

    post = BlogPost.query.get_or_404(id)
    
    if request.method == 'POST':
        was_published = post.is_published
        post.title = request.form.get('title')
        post.content = request.form.get('content')
        
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
    
    return render_template('blog/admin_blog.html', post=post, admin=admin)

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
    
    # If the post is being published, send notification emails
    if post.is_published:
        send_notification_emails(post)
    
    status = 'published' if post.is_published else 'unpublished'
    flash(f'Blog post {status} successfully!', 'success')
    return redirect(url_for('blog_admin.all_posts'))
from flask import Blueprint, render_template, request, jsonify, current_app
from pkg.models import db, IssueReport

index_bp = Blueprint('index', __name__)

@index_bp.route('/')
def home():
    return render_template('home.html')

@index_bp.route('/about')
def about():
    return render_template('about.html')

# Error handlers
@index_bp.app_errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404

@index_bp.app_errorhandler(403)
def forbidden(e):
    return render_template('errors/403.html'), 403

@index_bp.app_errorhandler(500)
def server_error(e):
    return render_template('errors/500.html'), 500

@index_bp.route('/report-issue', methods=['POST'])
def report_issue():
    try:
        data = request.form
        email = data.get('email')
        description = data.get('description')
        page_url = request.referrer or 'Unknown'
        error_type = data.get('error_type', 'Unknown')
        
        if not email or not description:
            return jsonify({
                'success': False,
                'message': 'Email and description are required'
            }), 400
        
        # Create new issue report
        new_report = IssueReport(
            email=email,
            description=description,
            page_url=page_url,
            error_type=error_type
        )
        
        db.session.add(new_report)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Your issue has been reported. Thank you!'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error reporting issue: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'An error occurred while reporting your issue. Please try again.'
        }), 500
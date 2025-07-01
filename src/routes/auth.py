from flask import Blueprint, request, jsonify, session
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# Authorized user credentials
AUTHORIZED_EMAIL = "nnadipallileela@gmail.com"
AUTHORIZED_PHONE = "7989470351"

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session['logged_in']:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    
    if not email or not phone:
        return jsonify({'error': 'Email and phone number are required'}), 400
    
    # Check if credentials match the authorized user
    if email == AUTHORIZED_EMAIL.lower() and phone == AUTHORIZED_PHONE:
        session['logged_in'] = True
        session['user_email'] = email
        session['user_phone'] = phone
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logout successful'})

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'logged_in' in session and session['logged_in']:
        return jsonify({'authenticated': True, 'email': session.get('user_email')})
    else:
        return jsonify({'authenticated': False})


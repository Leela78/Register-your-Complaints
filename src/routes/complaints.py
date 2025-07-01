from flask import Blueprint, request, jsonify
from src.models.complaint import Complaint, db
from src.routes.auth import login_required
from datetime import datetime

complaints_bp = Blueprint('complaints', __name__)

@complaints_bp.route('/complaints', methods=['POST'])
def create_complaint():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['student_name', 'student_id', 'email', 'department', 'category', 'priority', 'description']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        complaint = Complaint(
            student_name=data['student_name'],
            student_id=data['student_id'],
            email=data['email'],
            phone=data.get('phone', ''),
            department=data['department'],
            category=data['category'],
            priority=data['priority'],
            subject=data.get('subject', ''),
            description=data['description']
        )
        
        db.session.add(complaint)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Complaint submitted successfully',
            'complaint_id': complaint.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to submit complaint'}), 500

@complaints_bp.route('/complaints', methods=['GET'])
@login_required
def get_complaints():
    try:
        status_filter = request.args.get('status')
        category_filter = request.args.get('category')
        
        query = Complaint.query
        
        if status_filter:
            query = query.filter(Complaint.status == status_filter)
        
        if category_filter:
            query = query.filter(Complaint.category == category_filter)
        
        complaints = query.order_by(Complaint.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'complaints': [complaint.to_dict() for complaint in complaints]
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch complaints'}), 500

@complaints_bp.route('/complaints/<int:complaint_id>/resolve', methods=['PUT'])
@login_required
def resolve_complaint(complaint_id):
    data = request.get_json()
    
    try:
        complaint = Complaint.query.get_or_404(complaint_id)
        
        complaint.status = data.get('status', 'Resolved')
        complaint.resolution_notes = data.get('resolution_notes', '')
        complaint.resolved_by = 'nnadipallileela@gmail.com'
        complaint.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Complaint updated successfully',
            'complaint': complaint.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update complaint'}), 500

@complaints_bp.route('/complaints/<int:complaint_id>', methods=['GET'])
@login_required
def get_complaint(complaint_id):
    try:
        complaint = Complaint.query.get_or_404(complaint_id)
        return jsonify({
            'success': True,
            'complaint': complaint.to_dict()
        })
    except Exception as e:
        return jsonify({'error': 'Complaint not found'}), 404


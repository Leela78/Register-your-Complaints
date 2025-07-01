from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Complaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    student_id = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    department = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(20), nullable=False)
    subject = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_by = db.Column(db.String(100), nullable=True)
    resolution_notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Complaint {self.id}: {self.subject}>'

    def to_dict(self):
        return {
            'id': self.id,
            'student_name': self.student_name,
            'student_id': self.student_id,
            'email': self.email,
            'phone': self.phone,
            'department': self.department,
            'category': self.category,
            'priority': self.priority,
            'subject': self.subject,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'resolved_by': self.resolved_by,
            'resolution_notes': self.resolution_notes
        }


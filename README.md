# Register-complaints

A complaint registration system for Vignan Institute of Information Technology, Duvvada, Visakhapatnam.

## Features

- **Register Complaints**: Students can submit complaints with details like department, category, priority, etc.
- **Previous Complaints**: Students can view their previously submitted complaints by searching with their email
- **Admin Access**: Authorized admin (nnadipallileela@gmail.com, 7989470351) can view and resolve all complaints
- **Contact Services**: Direct phone calling, email, WhatsApp integration, and directions to the institute
- **Mobile Responsive**: Works well on all device sizes
- **Real-time Updates**: Status updates and notifications for complaint resolution

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Backend**: Flask (Python)
- **Database**: SQLite
- **Authentication**: Session-based authentication

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Leela78/Register-complaints.git
   cd Register-complaints
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```
   python src/init_db.py
   ```

5. Run the application:
   ```
   python src/main.py
   ```

6. Access the application at `http://localhost:5000`

## Admin Access

To access the admin panel:
- Email: nnadipallileela@gmail.com
- Phone: 7989470351

## Contact Information

For technical support, contact the admin at:
- Phone: +91 7989470351
- Email: nnadipallileela@gmail.com
- WhatsApp: +91 7989470351

## License

© 2025 Vignan Institute of Information Technology. All rights reserved.


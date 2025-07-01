// Global variables
let complaints = [];
let isAuthenticated = false;
let currentUser = null;

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (data.authenticated) {
            isAuthenticated = true;
            currentUser = data.email;
            updateUIForAuthenticatedUser();
        } else {
            isAuthenticated = false;
            updateUIForUnauthenticatedUser();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        isAuthenticated = false;
        updateUIForUnauthenticatedUser();
    }
}

function updateUIForAuthenticatedUser() {
    // Update header controls for authenticated user
    const headerControls = document.querySelector('.header-buttons');
    if (headerControls) {
        headerControls.innerHTML = `
            <div class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Admin Access
            </div>
            <button onclick="logout()" class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                Logout
            </button>
            <button onclick="showTab('register')" id="registerTab" class="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base">
                Register Complaint
            </button>
            <button onclick="showTab('previous')" id="previousTab" class="px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm md:text-base">
                Previous Complaints
            </button>
            <button onclick="showTab('view')" id="viewTab" class="px-4 md:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm md:text-base">
                View All Complaints
            </button>
        `;
    }
    
    // Load complaints if viewing complaints tab
    if (document.getElementById('viewSection') && !document.getElementById('viewSection').classList.contains('hidden')) {
        loadComplaints();
    }
}

function updateUIForUnauthenticatedUser() {
    // Add login button to view complaints
    const viewTab = document.getElementById('viewTab');
    const previousTab = document.getElementById('previousTab');
    
    if (viewTab) {
        viewTab.onclick = function() {
            window.location.href = '/login.html';
        };
    }
    
    if (previousTab) {
        previousTab.onclick = function() {
            showTab('previous');
        };
    }
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            isAuthenticated = false;
            currentUser = null;
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

function showTab(tab) {
    const registerSection = document.getElementById('registerSection');
    const viewSection = document.getElementById('viewSection');
    const previousSection = document.getElementById('previousSection');
    const registerTab = document.getElementById('registerTab');
    const viewTab = document.getElementById('viewTab');
    const previousTab = document.getElementById('previousTab');

    // Reset all tabs and sections
    registerSection.classList.add('hidden');
    viewSection.classList.add('hidden');
    previousSection.classList.add('hidden');
    
    registerTab.classList.remove('bg-blue-600', 'bg-green-600', 'text-white');
    registerTab.classList.add('bg-gray-200', 'text-gray-700');
    
    viewTab.classList.remove('bg-blue-600', 'bg-green-600', 'text-white');
    viewTab.classList.add('bg-gray-200', 'text-gray-700');
    
    previousTab.classList.remove('bg-blue-600', 'bg-green-600', 'text-white');
    previousTab.classList.add('bg-gray-200', 'text-gray-700');

    if (tab === 'register') {
        registerSection.classList.remove('hidden');
        registerTab.classList.remove('bg-gray-200', 'text-gray-700');
        registerTab.classList.add('bg-blue-600', 'text-white');
    } else if (tab === 'view') {
        if (!isAuthenticated) {
            window.location.href = '/login.html';
            return;
        }
        
        viewSection.classList.remove('hidden');
        viewTab.classList.remove('bg-gray-200', 'text-gray-700');
        viewTab.classList.add('bg-blue-600', 'text-white');
        
        loadComplaints();
    } else if (tab === 'previous') {
        previousSection.classList.remove('hidden');
        previousTab.classList.remove('bg-gray-200', 'text-gray-700');
        previousTab.classList.add('bg-green-600', 'text-white');
    }
}

// Complaint form submission
document.getElementById('complaintForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        student_name: document.getElementById('studentName').value,
        student_id: document.getElementById('studentId').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        department: document.getElementById('department').value,
        category: document.getElementById('category').value,
        priority: document.querySelector('input[name="priority"]:checked').value,
        subject: document.getElementById('subject').value,
        description: document.getElementById('description').value
    };
    
    try {
        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showSuccessModal(data.complaint_id);
            resetForm();
        } else {
            alert('Error: ' + (data.error || 'Failed to submit complaint'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

async function loadComplaints() {
    if (!isAuthenticated) return;
    
    try {
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        let url = '/api/complaints?';
        if (statusFilter) url += `status=${statusFilter}&`;
        if (categoryFilter) url += `category=${categoryFilter}&`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok && data.success) {
            complaints = data.complaints;
            displayComplaints();
        } else {
            console.error('Error loading complaints:', data.error);
        }
    } catch (error) {
        console.error('Network error loading complaints:', error);
    }
}

function displayComplaints() {
    const container = document.getElementById('complaintsContainer');
    const noComplaints = document.getElementById('noComplaints');
    
    if (complaints.length === 0) {
        container.innerHTML = '';
        noComplaints.classList.remove('hidden');
        return;
    }
    
    noComplaints.classList.add('hidden');
    
    const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Resolved': 'bg-green-100 text-green-800',
        'Closed': 'bg-gray-100 text-gray-800'
    };
    
    const priorityColors = {
        'Low': 'text-green-600',
        'Medium': 'text-yellow-600',
        'High': 'text-red-600',
        'Urgent': 'text-red-800'
    };
    
    container.innerHTML = complaints.map(complaint => `
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">${complaint.subject || 'No Subject'}</h3>
                    <p class="text-sm text-gray-600">ID: ${complaint.id} | ${complaint.student_name} (${complaint.student_id})</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status]}">${complaint.status}</span>
                    <span class="text-sm font-medium ${priorityColors[complaint.priority]}">${complaint.priority}</span>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div><strong>Email:</strong> ${complaint.email}</div>
                <div><strong>Phone:</strong> ${complaint.phone || 'N/A'}</div>
                <div><strong>Department:</strong> ${complaint.department}</div>
                <div><strong>Category:</strong> ${complaint.category}</div>
            </div>
            
            <div class="mb-4">
                <p class="text-sm text-gray-700">${complaint.description}</p>
            </div>
            
            <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
                <span>Created: ${new Date(complaint.created_at).toLocaleString()}</span>
                <span>Updated: ${new Date(complaint.updated_at).toLocaleString()}</span>
            </div>
            
            ${complaint.resolution_notes ? `
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p class="text-sm text-green-800"><strong>Resolution Notes:</strong> ${complaint.resolution_notes}</p>
                    <p class="text-xs text-green-600 mt-1">Resolved by: ${complaint.resolved_by}</p>
                </div>
            ` : ''}
            
            <div class="flex space-x-2">
                <button onclick="updateComplaintStatus(${complaint.id})" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Update Status
                </button>
                <button onclick="addResolutionNotes(${complaint.id})" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    Add Notes
                </button>
            </div>
        </div>
    `).join('');
}

async function updateComplaintStatus(complaintId) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;

    const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
    const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Resolved': 'bg-green-100 text-green-800',
        'Closed': 'bg-gray-100 text-gray-800'
    };

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
            <div class="text-center mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Update Complaint Status</h3>
                <p class="text-gray-600 mb-4">Complaint ID: ${complaintId}</p>
                <p class="text-sm text-gray-500">Current Status: <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status]}">${complaint.status}</span></p>
            </div>
            
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">Select New Status:</label>
                <div class="space-y-2">
                    ${statuses.map(status => `
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${status === complaint.status ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}">
                            <input type="radio" name="newStatus" value="${status}" class="text-blue-600 focus:ring-blue-500" ${status === complaint.status ? 'checked' : ''}>
                            <span class="ml-3 flex-1">${status}</span>
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}">${status}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button onclick="confirmStatusUpdate(${complaintId})" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Update Status
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function confirmStatusUpdate(complaintId) {
    const selectedStatus = document.querySelector('input[name="newStatus"]:checked');
    if (!selectedStatus) return;

    try {
        const response = await fetch(`/api/complaints/${complaintId}/resolve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: selectedStatus.value
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            closeModal();
            loadComplaints(); // Reload complaints
            alert(`Status updated to: ${selectedStatus.value}`);
        } else {
            alert('Error: ' + (data.error || 'Failed to update status'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

async function addResolutionNotes(complaintId) {
    const notes = prompt('Enter resolution notes:');
    if (!notes) return;

    try {
        const response = await fetch(`/api/complaints/${complaintId}/resolve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'Resolved',
                resolution_notes: notes
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            loadComplaints(); // Reload complaints
            alert('Resolution notes added successfully!');
        } else {
            alert('Error: ' + (data.error || 'Failed to add notes'));
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

function filterComplaints() {
    loadComplaints();
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (modal) {
        modal.remove();
    }
}

function showSuccessModal(complaintId) {
    const modal = document.getElementById('successModal');
    document.getElementById('complaintId').textContent = complaintId;
    modal.classList.remove('hidden');
}

function resetForm() {
    document.getElementById('complaintForm').reset();
}

// Initialize the page
showTab('register');


// Contact Service Functions
function callAdmin() {
    // Check if device supports phone calls
    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
        // Mobile device - initiate phone call
        window.location.href = 'tel:+917989470351';
    } else {
        // Desktop - show call information
        alert('Admin Contact Number: +91 7989470351\n\nPlease use your phone to call this number.');
    }
}

function sendEmail() {
    // Create email with pre-filled subject and body
    const subject = encodeURIComponent('College Complaint System - Support Request');
    const body = encodeURIComponent('Dear Admin,\n\nI need assistance with the College Complaint System.\n\nDetails:\n- Issue: \n- Student ID: \n- Contact Number: \n\nPlease respond at your earliest convenience.\n\nThank you,\n[Your Name]');
    
    // Open default email client
    window.location.href = `mailto:nnadipallileela@gmail.com?subject=${subject}&body=${body}`;
}

function getDirections() {
    // Check if geolocation is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                // Get user's current location and open directions
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const destination = 'College Campus'; // You can replace with actual college address
                
                // Open Google Maps with directions
                window.open(`https://www.google.com/maps/dir/${lat},${lng}/${encodeURIComponent(destination)}`, '_blank');
            },
            function(error) {
                // If geolocation fails, just open Google Maps search
                window.open('https://maps.google.com/?q=College+Campus', '_blank');
            }
        );
    } else {
        // Geolocation not supported, open Google Maps search
        window.open('https://maps.google.com/?q=College+Campus', '_blank');
    }
}

// Additional utility functions for contact services
function copyPhoneNumber() {
    const phoneNumber = '+917989470351';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(phoneNumber).then(function() {
            showNotification('Phone number copied to clipboard!', 'success');
        }).catch(function() {
            fallbackCopyTextToClipboard(phoneNumber);
        });
    } else {
        fallbackCopyTextToClipboard(phoneNumber);
    }
}

function copyEmail() {
    const email = 'nnadipallileela@gmail.com';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(function() {
            showNotification('Email address copied to clipboard!', 'success');
        }).catch(function() {
            fallbackCopyTextToClipboard(email);
        });
    } else {
        fallbackCopyTextToClipboard(email);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('Copied to clipboard!', 'success');
        } else {
            showNotification('Failed to copy. Please copy manually.', 'error');
        }
    } catch (err) {
        showNotification('Failed to copy. Please copy manually.', 'error');
    }
    
    document.body.removeChild(textArea);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
    
    // Set color based on type
    switch(type) {
        case 'success':
            notification.classList.add('bg-green-600');
            break;
        case 'error':
            notification.classList.add('bg-red-600');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-600');
            break;
        default:
            notification.classList.add('bg-blue-600');
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Emergency contact function
function emergencyContact() {
    const confirmed = confirm('This will call the emergency contact number: +91 7989470351\n\nProceed with the call?');
    if (confirmed) {
        callAdmin();
    }
}

// WhatsApp contact function (if needed)
function contactWhatsApp() {
    const phoneNumber = '917989470351'; // Remove + and spaces for WhatsApp
    const message = encodeURIComponent('Hello, I need assistance with the College Complaint System.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
}


// Function to search for previous complaints by email
async function searchPreviousComplaints() {
    const email = document.getElementById('searchEmail').value.trim();
    if (!email) {
        alert('Please enter your email address to search for your complaints.');
        return;
    }

    try {
        const response = await fetch(`/api/complaints/search?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        const container = document.getElementById('previousComplaintsContainer');
        const noComplaints = document.getElementById('noPreviousComplaints');
        
        container.innerHTML = '';
        
        if (data.complaints && data.complaints.length > 0) {
            noComplaints.classList.add('hidden');
            
            data.complaints.forEach(complaint => {
                const statusClass = getStatusClass(complaint.status);
                const priorityClass = getPriorityClass(complaint.priority);
                
                container.innerHTML += `
                    <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
                        <div class="p-5">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="text-xl font-semibold text-gray-900">${complaint.subject || 'No Subject'}</h3>
                                    <p class="text-sm text-gray-600 mt-1">ID: ${complaint.id} | ${complaint.student_name} (${complaint.student_id})</p>
                                </div>
                                <div class="flex space-x-2">
                                    <span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">${complaint.status}</span>
                                    <span class="${priorityClass} px-3 py-1 rounded-full text-xs font-medium">${complaint.priority}</span>
                                </div>
                            </div>
                            
                            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p class="text-gray-500">Email:</p>
                                    <p class="font-medium">${complaint.email}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Phone:</p>
                                    <p class="font-medium">${complaint.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Department:</p>
                                    <p class="font-medium">${complaint.department}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Category:</p>
                                    <p class="font-medium">${complaint.category}</p>
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <p class="text-gray-500">Description:</p>
                                <p class="mt-1 text-gray-800">${complaint.description}</p>
                            </div>
                            
                            <div class="mt-4 text-sm text-gray-500 flex justify-between items-center">
                                <div>
                                    <span>Created: ${new Date(complaint.created_at).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span>Updated: ${new Date(complaint.updated_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            noComplaints.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error searching complaints:', error);
        alert('Error searching for complaints. Please try again.');
    }
}

// Helper functions for status and priority styling
function getStatusClass(status) {
    switch(status) {
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800';
        case 'Resolved':
            return 'bg-green-100 text-green-800';
        case 'Closed':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getPriorityClass(priority) {
    switch(priority) {
        case 'Low':
            return 'bg-green-100 text-green-800';
        case 'Medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'High':
            return 'bg-orange-100 text-orange-800';
        case 'Urgent':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}


'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  collegeId: string;
  department?: string;
  location?: string;
  status?: string;
  lastSeen?: string;
  createdAt?: string;
  permissions?: string[];
  password?: string;
}

export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const csrfToken = sessionStorage.getItem('csrf_token');
      const response = await fetch('http://localhost:8000/admins/',{
        method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || '',
          },
        });
        
      
      
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      
      const data = await response.json();
      setAdmins(data.admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const csrfToken = sessionStorage.getItem('csrf_token');
      const response = await fetch('http://localhost:8000/add-admin/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify(newAdmin),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add admin');
      }
      
      const data = await response.json();
      setAdmins([...admins, data.admin]);
      setNewAdmin({ name: '', email: '', password: '' });
      setShowAddModal(false);
      toast.success('Admin added successfully');
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast.error(error.message || 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) {
      return;
    }
    
    try {
      const csrfToken = sessionStorage.getItem('csrf_token');
      const response = await fetch(`http://localhost:8000/admins/${adminId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete admin');
      }
      
      setAdmins(admins.filter(admin => admin._id !== adminId));
      toast.success('Admin removed successfully');
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error(error.message || 'Failed to delete admin');
    }
  };

  const handleViewProfile = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowProfileModal(true);
  };

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Manage Admins</h2>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          Add Admin
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4 flex">
          <input
            type="text"
            placeholder="Search admins..."
            className="flex-grow p-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading admins...</p>
          </div>
        ) : filteredAdmins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewProfile(admin)}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{admin.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{admin.createdAt ? new Date(admin.createdAt).toLocaleString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event
                          handleDeleteAdmin(admin._id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No admins found. Add an admin to get started.</p>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New Admin</h3>
            <form onSubmit={handleAddAdmin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Profile Modal */}
      {showProfileModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Admin Profile</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowProfileModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {selectedAdmin.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Name</h4>
                  <p className="text-gray-800">{selectedAdmin.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="text-gray-800">{selectedAdmin.email}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Role</h4>
                  <p className="text-gray-800">{selectedAdmin.role || 'anonymous'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">College ID</h4>
                  <p className="text-gray-800">{selectedAdmin.collegeId || 'N/A'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Department</h4>
                  <p className="text-gray-800">{selectedAdmin.department || 'N/A'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p className="text-gray-800">{selectedAdmin.location || 'N/A'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="text-gray-800 flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${selectedAdmin.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    {selectedAdmin.status || 'offline'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Seen</h4>
                  <p className="text-gray-800">{selectedAdmin.lastSeen ? new Date(selectedAdmin.lastSeen).toLocaleString() : 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                  <p className="text-gray-800">{selectedAdmin.createdAt ? new Date(selectedAdmin.createdAt).toLocaleString() : 'N/A'}</p>
                </div>

                {selectedAdmin.permissions && selectedAdmin.permissions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Permissions</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAdmin.permissions.map((permission, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
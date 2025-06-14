'use client';

import { useState, useEffect } from 'react';

interface Alumni {
  _id: string;
  name: string;
  email: string;
  gradYear?: number;
  currentRole?: string;
  department?: string;
  prn?: string;
  status?: string;
  lastSeen?: string;
}

export default function Alumni() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlumni, setNewAlumni] = useState({
    name: '',
    email: '',
    prn: '',
    gradYear: undefined as number | undefined,
    department: '',
    currentRole: ''
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    const csrfToken = sessionStorage.getItem('csrf_token');
    try {
      const response = await fetch('http://localhost:8000/alumni/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alumni');
      }

      const data = await response.json();
      setAlumni(data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for new alumni form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAlumni(prev => ({
      ...prev,
      [name]: name === 'gradYear' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  // Handle add alumni form submission
  const handleAddAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    
    try {
      const response = await fetch('http://localhost:8000/add-alumni/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify(newAlumni),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add alumni');
      }

      setAddSuccess(`Alumni added successfully! Temporary password: ${data.alumni.password}`);
      fetchAlumni(); // Refresh the alumni list
      
      // Reset form after successful submission
      setTimeout(() => {
        setNewAlumni({
          name: '',
          email: '',
          prn: '',
          gradYear: undefined,
          department: '',
          currentRole: ''
        });
        setShowAddModal(false);
        setAddSuccess('');
      }, 5000);
      
    } catch (error) {
      console.error('Error adding alumni:', error);
      setAddError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const getCsrfToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrf_token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/bulk-register-alumni/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': getCsrfToken(),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload alumni data');
      }

      alert(`Successfully uploaded ${data.count} alumni records`);
      fetchAlumni(); // Refresh the alumni list
    } catch (error) {
      console.error('Error uploading alumni data:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      // Reset the file input
      const fileInput = document.getElementById('excel-upload-alumni') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  // Filter alumni based on search term
  const filteredAlumni = alumni.filter(alum => 
    alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alum.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (alum.currentRole && alum.currentRole.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Manage Alumni</h2>
        <div className="flex space-x-4">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            Add Alumni
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-upload-alumni"
            />
            <label
              htmlFor="excel-upload-alumni"
              className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
            >
              Upload Excel
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search alumni..."
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading alumni...</p>
          </div>
        ) : filteredAlumni.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graduation Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-gray-800">
                {filteredAlumni.map((alum) => (
                  <tr key={alum._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{alum.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{alum.gradYear || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{alum.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{alum.currentRole || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No alumni found. Add alumni or upload an Excel file.</p>
          </div>
        )}
      </div>

      {/* Add Alumni Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Alumni</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError('');
                  setAddSuccess('');
                }}
              >
                ✕
              </button>
            </div>
            
            {addError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {addError}
              </div>
            )}
            
            {addSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                {addSuccess}
              </div>
            )}
            
            <form onSubmit={handleAddAlumni} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newAlumni.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={newAlumni.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">PRN *</label>
                <input
                  type="text"
                  name="prn"
                  value={newAlumni.prn}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                <input
                  type="number"
                  name="gradYear"
                  value={newAlumni.gradYear || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={newAlumni.department}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Role/Company</label>
                <input
                  type="text"
                  name="currentRole"
                  value={newAlumni.currentRole}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddError('');
                    setAddSuccess('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Alumni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
  rollno: string;
  email: string;
  department: string;
  lastseen: string;
  status: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollno: '',
    department: ''
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/bulk-register-students/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': getCsrfToken(),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload student data');
      }

      alert(`Successfully uploaded ${data.count} student records`);
      fetchStudents(); // Refresh the student list
    } catch (error) {
      console.error('Error uploading student data:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      // Reset the file input
      const fileInput = document.getElementById('excel-upload-student') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const handleEditStudent = (studentId: string) => {
    // Implement edit logic
    console.log('Edit student:', studentId);
  };

  const handleDeleteStudent = (studentId: string) => {
    // Implement delete logic
    console.log('Delete student:', studentId);
  };

  // Handle input change for new student form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add student form submission
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    
    try {
      const response = await fetch('http://localhost:8000/add-student/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify(newStudent),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add student');
      }

      setAddSuccess(`Student added successfully! Temporary password: ${data.student.password}`);
      fetchStudents(); // Refresh the student list
      
      // Reset form after successful submission
      setTimeout(() => {
        setNewStudent({
          name: '',
          email: '',
          rollno: '',
          department: ''
        });
        setShowAddModal(false);
        setAddSuccess('');
      }, 5000);
      
    } catch (error) {
      console.error('Error adding student:', error);
      setAddError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const getCsrfToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrf_token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/students/', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': getCsrfToken()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      console.log(data)
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch students when component mounts
  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Manage Students</h2>
        <div className="flex space-x-4">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            Add Student
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-upload-student"
            />
            <label
              htmlFor="excel-upload-student"
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
            placeholder="Search students..."
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewProfile(student)}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{student.rollno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{student.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">{student.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 mr-2" onClick={(e) => {
                        e.stopPropagation();
                        handleEditStudent(student.id);
                      }}>Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudent(student.id);
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No students found. Add students or upload an Excel file.</p>
          </div>
        )}
      </div>

      {/* Student Profile Modal */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Student Profile</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowProfileModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Name</h4>
                  <p className="text-gray-800">{selectedStudent.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Roll Number</h4>
                  <p className="text-gray-800">{selectedStudent.rollno}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="text-gray-800">{selectedStudent.email}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Department</h4>
                  <p className="text-gray-800">{selectedStudent.department}</p>
                </div>
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Student</h3>
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
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
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
                  value={newStudent.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Roll Number *</label>
                <input
                  type="text"
                  name="rollno"
                  value={newStudent.rollno}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  name="department"
                  value={newStudent.department}
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
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
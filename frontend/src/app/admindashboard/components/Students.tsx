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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File uploaded:', file.name);
      // Implement the actual upload logic
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
          'X-CSRF-Token': document.cookie.split('csrf_token=')[1]?.split(';')[0] || ''
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

// ... existing code ...

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Manage Students</h2>
        <div className="flex space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
    </div>
  );
}
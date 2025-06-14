'use client';

import { useState, useEffect } from 'react';

interface Achievement {
  id?: string;
  title: string;
  description: string;
  studentName: string;
  date: string;
  category: string;
  imageUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement>({
    title: '',
    description: '',
    studentName: '',
    date: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/achievements', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch achievements');
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAchievement = async () => {
    try {
      const response = await fetch('http://localhost:8000/achievements', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify(newAchievement)
      });
      if (!response.ok) throw new Error('Failed to create achievement');
      const data = await response.json();
      setAchievements([...achievements, data]);
      setShowModal(false);
      setNewAchievement({
        title: '',
        description: '',
        studentName: '',
        date: '',
        category: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error('Error creating achievement:', error);
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/achievements/${achievementId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        }
      });
      if (!response.ok) throw new Error('Failed to delete achievement');
      setAchievements(achievements.filter(achievement => achievement.id !== achievementId));
    } catch (error) {
      console.error('Error deleting achievement:', error);
    }
  };

  const filteredAchievements = achievements.filter(achievement =>
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Manage Achievements</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Achievement
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search achievements..."
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading achievements...</p>
          </div>
        ) : filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div key={achievement.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {achievement.imageUrl ? (
                    <img 
                      src={achievement.imageUrl} 
                      alt={achievement.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No Image Available</span>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      achievement.status === 'approved' ? 'bg-green-100 text-green-800' :
                      achievement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {achievement.status || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{achievement.title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {achievement.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{achievement.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Student: {achievement.studentName}</span>
                    <span>Date: {achievement.date}</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-2">
                  <button 
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => {
                      setNewAchievement(achievement);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteAchievement(achievement.id!)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">
              {searchTerm ? 'No achievements found matching your search.' : 'No achievements found. Add an achievement to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Achievement Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              {newAchievement.id ? 'Edit Achievement' : 'Add New Achievement'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input
                  type="text"
                  value={newAchievement.studentName}
                  onChange={(e) => setNewAchievement({...newAchievement, studentName: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newAchievement.category}
                  onChange={(e) => setNewAchievement({...newAchievement, category: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newAchievement.imageUrl}
                  onChange={(e) => setNewAchievement({...newAchievement, imageUrl: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAchievement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {newAchievement.id ? 'Update Achievement' : 'Create Achievement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
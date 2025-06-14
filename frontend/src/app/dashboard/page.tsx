'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../components/landingpage/Header';

interface Event {
  title: string;
  type: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  organizer: string;
}

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

interface UserProfile {
  name: string;
  email: string;
  department: string;
  graduationYear: string;
  role: string;
  skills: string[];
  experiences: {
    title: string;
    company: string;
    period: string;
    description: string;
  }[];
}


export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Demo achievements data
  const demoAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Place in National Coding Competition',
      description: 'Won first place in the annual national coding competition, demonstrating exceptional problem-solving skills and algorithmic thinking.',
      studentName: 'John Doe',
      date: '2024-01-15',
      category: 'Competition',
      imageUrl: 'https://thedailytexan.com/wp-content/uploads/2019/09/coding_2019-09-14_Terminal_Coding_Competition_Joshua.Guenther13782-scaled.jpg',
      status: 'approved'
    },
    {
      id: '2',
      title: 'Research Paper Publication',
      description: 'Published a research paper on Machine Learning applications in Healthcare in the International Journal of Computer Science.',
      studentName: 'Jane Smith',
      date: '2024-02-20',
      category: 'Academic',
      imageUrl: 'https://media.gettyimages.com/id/92259124/photo/laptop-computer-with-books-pen-and-yellow-legal-pad.jpg?s=612x612&w=gi&k=20&c=kU0y9uAryoziQKf0RcpOxXRU5j_YIR7QqZGGOEPuxuY=',
      status: 'approved'
    },
    {
      id: '3',
      title: 'Startup Innovation Award',
      description: 'Received the Young Innovator Award for developing a sustainable technology solution at the State Startup Summit.',
      studentName: 'Mike Johnson',
      date: '2024-03-05',
      category: 'Innovation',
      imageUrl: 'https://affairscloud.com/assets/uploads/2023/01/Union-Minister-Piyush-Goyal-felicitates-National-Startup-Awards-2022-winners.jpg.webp',
      status: 'pending'
    },
    {
      id: '4',
      title: 'Community Service Recognition',
      description: 'Recognized for developing a free coding education platform that has helped over 1000 underprivileged students learn programming.',
      studentName: 'Sarah Williams',
      date: '2024-03-10',
      category: 'Social Impact',
      imageUrl: 'https://example.com/community-service.jpg',
      status: 'approved'
    },
    {
      id: "5",
      title: "Environmental Sustainability Champion",
      description: "Led a campus-wide recycling initiative that reduced plastic waste by 40% over six months, engaging over 500 students.",
      studentName: "Raj Mehta",
      date: "2024-04-15",
      category: "Social Impact",
      imageUrl: "https://example.com/environmental-sustainability.jpg",
      status: "approved"
    },
    {
      id: "6",
      title: "Mental Health Awareness Advocate",
      description: "Organized a series of mental health workshops and support groups, benefiting more than 300 students and faculty.",
      studentName: "Aisha Khan",
      date: "2024-02-20",
      category: "Social Impact",
      imageUrl: "https://example.com/mental-health-awareness.jpg",
      status: "approved"
    }
    
    
  ];

  // Demo events data
  const events: Event[] = [
    {
      title: 'Annual Alumni Meet 2024',
      type: 'Networking',
      description: 'Join us for our biggest alumni gathering of the year! Connect with fellow graduates, share experiences, and explore new opportunities. The event will feature keynote speakers, panel discussions, and networking sessions.',
      date: 'March 15, 2024 | 10:00 AM',
      location: 'University Main Auditorium',
      attendees: 250,
      organizer: 'Alumni Association'
    },
    {
      title: 'Tech Career Fair',
      type: 'Career',
      description: 'Exclusive career fair for IT and Engineering graduates. Meet recruiters from top tech companies, participate in on-spot interviews, and attend industry expert sessions on emerging technologies.',
      date: 'April 5, 2024 | 9:00 AM',
      location: 'Tech Center',
      attendees: 180,
      organizer: 'Career Development Cell'
    },
    {
      title: 'Entrepreneurship Workshop',
      type: 'Workshop',
      description: 'A comprehensive workshop on starting and scaling your business. Learn from successful alumni entrepreneurs, understand funding opportunities, and get insights into business plan development.',
      date: 'April 20, 2024 | 2:00 PM',
      location: 'Business School',
      attendees: 120,
      organizer: 'E-Cell'
    },
    {
      title: 'Global Alumni Webinar',
      type: 'Online',
      description: 'Virtual knowledge-sharing session with our international alumni. Topics include global career opportunities, higher education abroad, and international business perspectives.',
      date: 'May 10, 2024 | 6:00 PM',
      location: 'Online (Zoom)',
      attendees: 300,
      organizer: 'International Relations Office'
    }
  ];
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Remove the duplicate declaration
  // const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement>({
    title: '',
    description: '',
    studentName: userInfo?.name || '',
    date: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/me', {
          credentials: 'include',
          headers: {
            'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        const profile = {
          name: data.name,
          email: data.email,
          department: data.department,
          graduationYear: data.gradYear?.toString() || '',
          role: data.role,
          skills: data.skills || [],
          experiences: data.professionalExperience || data.Experience || []
        };
        setUserInfo(profile);
        setEditForm(profile);
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!editForm) return;
    
    try {
      const response = await fetch('http://localhost:8000/users/me', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUserInfo(data);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  const handleAddExperience = async (newExperience: any) => {
    try {
      const response = await fetch('http://localhost:8000/users/me/experience', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify(newExperience)
      });

      if (!response.ok) {
        throw new Error('Failed to add experience');
      }

      const data = await response.json();
      setUserInfo(prev => ({
        ...prev!,
        experiences: [...prev!.experiences, data]
      }));
    } catch (err) {
      setError('Failed to add experience');
      console.error(err);
    }
  };

  const handleAddSkill = async (newSkill: string) => {
    try {
      const response = await fetch('http://localhost:8000/users/me/skills', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify({ skill: newSkill })
      });

      if (!response.ok) {
        throw new Error('Failed to add skill');
      }

      const data = await response.json();
      setUserInfo(prev => ({
        ...prev!,
        skills: [...prev!.skills, newSkill]
      }));
    } catch (err) {
      setError('Failed to add skill');
      console.error(err);
    }
  };
  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'achievements') {
      fetchAchievements();
    }
  }, [activeTab]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      // For demo purposes, using demo data instead of API call
      setAchievements(demoAchievements);
      // Uncomment below for actual API integration
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
      setShowAchievementModal(false);
      setNewAchievement({
        title: '',
        description: '',
        studentName: userInfo?.name || '',
        date: '',
        category: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error('Error creating achievement:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/events', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const navigationItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'networking', label: 'Networking', icon: '🌐', href: '/networking' },
    { id: 'donations', label: 'Donations', icon: '💰' },
    { id: 'directory', label: 'Directory', icon: '👥', href: '/directory' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      <Header />
      <div className="h-16"></div>

      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 p-4">{error}</div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-6 relative">
            {/* Sidebar Navigation */}
            <div className={`${isSidebarCollapsed ? 'col-span-1' : 'col-span-3'} transition-all duration-300 ease-in-out`}>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-10"
                >
                  <svg className={`w-4 h-4 transform transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-4'} mb-8`}>
                  <div className="relative group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full overflow-hidden ring-4 ring-white hover:ring-blue-100 transition-all duration-300">
                      <Image 
                        src="/avatar.png" 
                        alt="Profile" 
                        width={64} 
                        height={64} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      />
                    </div>
                    {!isSidebarCollapsed && (
                      <button 
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 hover:rotate-12"
                        aria-label="Update profile picture"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{userInfo?.name || 'Loading...'}</h3>
                      <p className="text-sm text-gray-600">{userInfo?.department || 'Department'}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      </div>
                    </div>
                  )}
                </div>

                <nav className="space-y-2 mt-6">
                  {navigationItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => item.href ? window.location.href = item.href : setActiveTab(item.id)}
                      className={`w-full flex items-center justify-${isSidebarCollapsed ? 'center' : 'between'} px-4 py-3 rounded-xl transition-all duration-200 group ${
                        activeTab === item.id && !item.href
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 transform scale-105' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                        <span className="text-xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                        {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <button 
                    className={`w-full flex items-center justify-${isSidebarCollapsed ? 'center' : 'center space-x-2'} px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 group`}
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/';
                    }}
                  >
                    <svg className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className={`${isSidebarCollapsed ? 'col-span-11' : 'col-span-9'} space-y-6 transition-all duration-300`}>
            // ... existing code ...
  {activeTab === 'donations' && (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter donation amount"
                min="1"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter your message"
            ></textarea>
          </div>
          <div>
            
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Make Donation
          </button>
        </form>
      </div>
    </div>
  )}
              {/* Events Content */}  

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h1>
                        <p className="text-gray-600">Manage your personal information and preferences</p>
                      </div>
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                      >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </button>
                    </div>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-1 block">Full Name</label>
                          <input
                            type="text"
                            value={editForm?.name || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-1 block">Email</label>
                          <input
                            type="email"
                            value={editForm?.email || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-1 block">Department</label>
                          <input
                            type="text"
                            value={editForm?.department || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-1 block">Graduation Year</label>
                          <input
                            type="text"
                            value={editForm?.graduationYear || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, graduationYear: e.target.value }))}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end mt-4">
                          <button
                            onClick={handleUpdateProfile}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                          <p className="text-lg text-gray-900">{userInfo?.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                          <p className="text-lg text-gray-900">{userInfo?.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                          <p className="text-lg text-gray-900">{userInfo?.department}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Graduation Year</h3>
                          <p className="text-lg text-gray-900">{userInfo?.graduationYear}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills & Interests - Dynamic */}
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Skills & Interests</h2>
                      <button 
                        onClick={() => {
                          const skill = prompt('Enter new skill:');
                          if (skill) handleAddSkill(skill);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Skill
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(userInfo?.skills || []).map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience - Dynamic */}
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
                      <button 
                        onClick={() => {
                          const title = prompt('Enter job title:');
                          const company = prompt('Enter company name:');
                          const period = prompt('Enter period (e.g. 2020-2021):');
                          const description = prompt('Enter job description:');
                          
                          if (title && company && period && description) {
                            handleAddExperience({ title, company, period, description });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Add Experience
                      </button>
                    </div>
                    <div className="space-y-6">
                      {(userInfo?.experiences || []).map((exp, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                            <p className="text-gray-600">{exp.company} • {exp.period}</p>
                            <p className="text-gray-500 mt-2">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Events Section */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
                        <p className="text-gray-600">Stay updated with the latest events and activities</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      {events.map((event, index) => (
                        <div 
                          key={index} 
                          className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${selectedEvent ? 'opacity-20' : ''}`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-white text-6xl opacity-30">
                              🎓
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                {event.type}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4">{event.description.substring(0, 100)}...</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>📅 {event.date}</span>
                              <span>👥 {event.attendees} attendees</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Event Modal */}
              {selectedEvent && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 -mx-8 -mt-8 rounded-t-2xl relative mb-6">
                      <div className="absolute inset-0 flex items-center justify-center text-white text-8xl opacity-30">
                        🎓
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-3xl font-bold text-gray-900">{selectedEvent.title}</h2>
                      <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {selectedEvent.type}
                      </span>
                    </div>

                    <div className="space-y-6">
                      <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-gray-500 mb-1">Date & Time</p>
                          <p className="font-medium text-gray-900">📅 {selectedEvent.date}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-gray-500 mb-1">Location</p>
                          <p className="font-medium text-gray-900">📍 {selectedEvent.location}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-gray-500 mb-1">Attendees</p>
                          <p className="font-medium text-gray-900">👥 {selectedEvent.attendees} registered</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-gray-500 mb-1">Organizer</p>
                          <p className="font-medium text-gray-900">👤 {selectedEvent.organizer}</p>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                        Register for Event
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Content */}
              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">College Achievements</h1>
                        <p className="text-gray-600">Showcase your accomplishments and milestones</p>
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-10">
                        <p className="text-black-600">Loading achievements...</p>
                      </div>
                    ) : achievements.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievements.map((achievement) => (
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
                              
                            </div>
                            <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{achievement.title}</h3>
                              <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded">
                               {achievement.category}
                                </span>
                                </div>

                              <p className="text-gray-600 mb-4">{achievement.description}</p>
                              <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>Date: {achievement.date}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-600">No achievements found. Add your first achievement to get started!</p>
                      </div>
                    )}
                  </div>
                </div>
                
              )}
            </div>
          </div>
        </div>
      )}

      {/* Achievement Modal */}
      {showAchievementModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowAchievementModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Add New Achievement</h3>
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
              <div className="col-span-2">
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
                onClick={() => setShowAchievementModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAchievement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Achievement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

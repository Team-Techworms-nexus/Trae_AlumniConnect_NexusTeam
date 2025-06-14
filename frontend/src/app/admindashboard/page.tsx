'use client';

import { useState, useEffect } from 'react';
import Header from '../components/landingpage/Header';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Students from './components/Students';
import Alumni from './components/Alumni';
import Admins from './components/Admins';
import Groups from './components/Groups';
import Networking from './components/Networking';
import Events from './components/Events';
import Achievements from './components/Achievements';
import Donations from './components/Donations';
import Notifications from './components/Notifications';
import Settings from './components/Settings';

interface CollegeStats {
  total_students: number;
  total_alumni: number;
  total_achievements: number;
  total_donations: number;
  donations_growth_percent: number;
  achievements_growth_percent: number;
  active_groups: number;
  upcoming_events: number;
  recent_achievements: number;
  recent_donations: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

useEffect(() => {
  // Get from storage only after component is mounted (client-side)
  const savedTab = sessionStorage.getItem('activeTab');
  if (savedTab) {
    setActiveTab(savedTab);
  }
}, []);

useEffect(() => {
  sessionStorage.setItem('activeTab', activeTab);
}, [activeTab]);

  
  const [stats, setStats] = useState<CollegeStats>({
    total_students: 0,
    total_alumni: 0,
    total_achievements: 0,
    total_donations: 0,
    donations_growth_percent: 0,
    achievements_growth_percent: 0,
    active_groups: 0,
    upcoming_events: 0,
    recent_achievements: 0,
    recent_donations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Manage Students', icon: '👨‍🎓' },
    { id: 'alumni', label: 'Manage Alumni', icon: '🎓' },
    { id: 'admins', label: 'Manage Admins', icon: '👥' },
    { id: 'groups', label: 'Manage Groups', icon: '👥' },
    { id: 'networking', label: 'Networking', icon: '🌐' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'donations', label: 'Donations', icon: '💸' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  // Fetch college stats when component mounts
  useEffect(() => {
    const fetchCollegeStats = async () => {
      try {
        setLoading(true);
        const csrfToken = sessionStorage.getItem('csrf_token');
        
        const response = await fetch('http://localhost:8000/college-stats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || '',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch college stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching college stats:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollegeStats();
  }, []);

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview stats={stats} loading={loading} error={error} />;
      case 'students':
        return <Students />;
      case 'alumni':
        return <Alumni />;
      case 'admins':
        return <Admins />;
      case 'groups':
        return <Groups />;
      case 'networking':
        return <Networking />;
      case 'events':
        return <Events />;
      case 'achievements':
        return <Achievements />;
      case 'donations':
        return <Donations />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview stats={stats} loading={loading} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Add spacing after header */}
      <div className="h-8"></div>
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          navigationItems={navigationItems} 
        />

        {/* Main Content */}
        <main className="flex-1 p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black">
              {navigationItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>

          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}
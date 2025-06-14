'use client';

import { useState, useEffect } from 'react';
import Header from '../components/landingpage/Header';

interface Alumni {
  id: string;
  name: string;
  email: string;
  gradYear: number;
  department: string;
  currentRole: string;
  company: string;
  location: string;
  profileImage: string;
  skills: string[];
  linkedin?: string;
}

export default function AlumniDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterGradYear, setFilterGradYear] = useState('');
  
  // Demo alumni data
  const demoAlumni: Alumni[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      gradYear: 2020,
      department: 'Computer Science',
      currentRole: 'Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      skills: ['JavaScript', 'React', 'Node.js', 'AWS'],
      linkedin: 'https://linkedin.com/in/johnsmith'
    },
    {
      id: '2',
      name: 'Emily Johnson',
      email: 'emily.johnson@example.com',
      gradYear: 2019,
      department: 'Electrical Engineering',
      currentRole: 'Hardware Engineer',
      company: 'Apple',
      location: 'Cupertino, CA',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      skills: ['Circuit Design', 'PCB Layout', 'FPGA', 'Embedded Systems']
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      gradYear: 2021,
      department: 'Computer Science',
      currentRole: 'Data Scientist',
      company: 'Microsoft',
      location: 'Seattle, WA',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis']
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      gradYear: 2018,
      department: 'Business Administration',
      currentRole: 'Product Manager',
      company: 'Amazon',
      location: 'Seattle, WA',
      profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
      skills: ['Product Strategy', 'Agile', 'User Research', 'Market Analysis']
    },
    {
      id: '5',
      name: 'David Rodriguez',
      email: 'david.rodriguez@example.com',
      gradYear: 2020,
      department: 'Mechanical Engineering',
      currentRole: 'Mechanical Engineer',
      company: 'Tesla',
      location: 'Fremont, CA',
      profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
      skills: ['CAD', 'FEA', 'Thermal Analysis', 'Manufacturing']
    },
    {
      id: '6',
      name: 'Jessica Lee',
      email: 'jessica.lee@example.com',
      gradYear: 2021,
      department: 'Computer Science',
      currentRole: 'Frontend Developer',
      company: 'Facebook',
      location: 'Menlo Park, CA',
      profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
      skills: ['React', 'TypeScript', 'CSS', 'UI/UX']
    },
    {
      id: '7',
      name: 'Robert Kim',
      email: 'robert.kim@example.com',
      gradYear: 2019,
      department: 'Electrical Engineering',
      currentRole: 'Systems Engineer',
      company: 'SpaceX',
      location: 'Hawthorne, CA',
      profileImage: 'https://randomuser.me/api/portraits/men/7.jpg',
      skills: ['Systems Integration', 'Control Systems', 'Embedded Software']
    },
    {
      id: '8',
      name: 'Amanda Martinez',
      email: 'amanda.martinez@example.com',
      gradYear: 2018,
      department: 'Marketing',
      currentRole: 'Marketing Manager',
      company: 'Adobe',
      location: 'San Jose, CA',
      profileImage: 'https://randomuser.me/api/portraits/women/8.jpg',
      skills: ['Digital Marketing', 'Content Strategy', 'Analytics', 'SEO']
    },
    {
      id: '9',
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      gradYear: 2020,
      department: 'Computer Science',
      currentRole: 'Backend Developer',
      company: 'Twitter',
      location: 'San Francisco, CA',
      profileImage: 'https://randomuser.me/api/portraits/men/9.jpg',
      skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes']
    },
    {
      id: '10',
      name: 'Sophia Garcia',
      email: 'sophia.garcia@example.com',
      gradYear: 2021,
      department: 'Data Science',
      currentRole: 'AI Researcher',
      company: 'NVIDIA',
      location: 'Santa Clara, CA',
      profileImage: 'https://randomuser.me/api/portraits/women/10.jpg',
      skills: ['Deep Learning', 'Computer Vision', 'PyTorch', 'Research']
    }
  ];

  // Get unique departments and grad years for filters
  const departments = [...new Set(demoAlumni.map(alumni => alumni.department))];
  const gradYears = [...new Set(demoAlumni.map(alumni => alumni.gradYear))];

  // Filter alumni based on search term and filters
  const filteredAlumni = demoAlumni.filter(alumni => {
    const matchesSearch = 
      alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = filterDepartment === '' || alumni.department === filterDepartment;
    const matchesGradYear = filterGradYear === '' || alumni.gradYear.toString() === filterGradYear;
    
    return matchesSearch && matchesDepartment && matchesGradYear;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="h-14"></div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Alumni Directory</h1>
          <p className="text-lg text-gray-600">Connect with graduates from our institution</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, role, company, or skills"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                id="department"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="gradYear" className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <select
                id="gradYear"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filterGradYear}
                onChange={(e) => setFilterGradYear(e.target.value)}
              >
                <option value="">All Years</option>
                {gradYears.map((year) => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">{filteredAlumni.length} alumni found</p>
        </div>
        
        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumni) => (
            <div key={alumni.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={alumni.profileImage} 
                    alt={alumni.name} 
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{alumni.name}</h3>
                    <p className="text-gray-600">{alumni.currentRole} at {alumni.company}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center text-gray-700 mb-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>{alumni.department}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700 mb-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>Class of {alumni.gradYear}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700 mb-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{alumni.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>{alumni.email}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {alumni.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    View Profile
                  </button>
                  
                  {alumni.linkedin && (
                    <a 
                      href={alumni.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* No Results */}
        {filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  );
}
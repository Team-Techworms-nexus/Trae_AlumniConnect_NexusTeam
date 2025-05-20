'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../landingpage/Header';

export default function LoginForm() {
  const router = useRouter();
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [studentFormData, setStudentFormData] = useState({
    collegeId: '',
    email: '',
    password: '',
    userType: '',
  });
  const [adminFormData, setAdminFormData] = useState({ collegeId: '', password: '' });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
  e: React.FormEvent,
  formType: 'student' | 'admin'
) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const formData = formType === 'student' ? studentFormData : adminFormData;
    const method = formType === 'student' ? 'POST' : 'PUT';
  
    const fastapiUrl =
      formType === 'student'
        ? 'http://localhost:8000/login'
        : 'http://localhost:8000/college-login';
    console.log('Form data:', formData);
    console.log('FastAPI URL:', fastapiUrl);
    const response = await fetch(fastapiUrl, {
      method: 'POST', // FastAPI expects POST for both
      credentials: 'include', // ✅ Allow cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
  
    const data = await response.json();
  
    // Store CSRF token from response
    if (data.csrf_token) {
      sessionStorage.setItem('csrf_token', data.csrf_token);
    }
  
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
  
    // Redirect based on user type
    if (formType === 'student') {
      router.push('/dashboard');
    } else {
      router.push('/admindashboard');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsLoading(false);
  }
};


 
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  formType: 'student' | 'admin'
) => {
  const { name, value } = e.target;
  if (formType === 'student') {
    setStudentFormData((prev) => ({ ...prev, [name]: value }));
  } else {
    setAdminFormData((prev) => ({ ...prev, [name]: value }));
  }
};

  const handleRoleSelect = (selectedRole: string) => {
    setStudentFormData(prev => ({
      ...prev,
      userType: selectedRole
    }));
    console.log('Role selected:', selectedRole); // Add logging to debug
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setUserType(null);
      }
    };

    if (userType) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userType]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white flex flex-col">
      <Header />
      <div className="container mx-auto px-4 flex items-center justify-center flex-1 py-18">
        <div className="flex w-full max-w-6xl min-h-[500px] bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden mx-auto">
          {/* Student/Alumni Section */}
          <div className="w-1/2 p-33 border-r border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-black text-white text-sm rounded-full mb-4">
                STUDENT / ALUMNI
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">For Alumni & Students</h2>
              <p className="text-sm text-gray-600 leading-relaxed">Connect with peers, explore opportunities, and grow your network through alumni interactions and college events.</p>
            </div>
            <button
              onClick={() => setUserType('student')}
              className="w-full py-3 px-6 bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-900 transition-all duration-300"
            >
              Login
            </button>
          </div>

          {/* Admin Section */}
          <div className="w-1/2 p-32">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1 bg-black text-white text-sm rounded-full mb-4">
                ADMIN
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">For College Admin</h2>
              <p className="text-sm text-gray-600 leading-relaxed">Manage students, connect with alumni, and facilitate engagement across your institution efficiently.</p>
            </div>
            <button
              onClick={() => setUserType('admin')}
              className="w-full py-3 px-6 bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-900 transition-all duration-300"
            >
              Login
            </button>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Login Form Overlay */}
          {userType && (
            <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50">
              <div 
                ref={modalRef}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl mx-auto my-auto overflow-y-auto max-h-[90vh]"
              >
                <div className="text-center mb-8">
                  <Image src="/logo.png" alt="Net4Grad Logo" width={64} height={64} className="mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    {userType === 'student' ? 'Student/Alumni Login' : 'Admin Login'}
                  </h3>
                </div>

                <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-6">
                  <div>
                    <label htmlFor="collegeId" className="block text-sm font-medium text-gray-700 mb-2">
                      CollegeID
                    </label>
                    <input
                      id="collegeId"
                      name="collegeId"
                      type="text"
                      required
                      value={userType === 'student' ? studentFormData.collegeId : adminFormData.collegeId}
                      onChange={(e) => handleChange(e, userType)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your CollegeID"
                    />
                  </div>

                  {userType === 'student' && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={studentFormData.email}
                        onChange={(e) => handleChange(e, 'student')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={userType === 'student' ? studentFormData.password : adminFormData.password}
                      onChange={(e) => handleChange(e, userType)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                    />
                  </div>
                  
                  {userType === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Role
                      </label>
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => handleRoleSelect('Student')}
                          className={`flex flex-col items-center justify-center p-3 border ${studentFormData.userType === 'Student' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} rounded-lg transition-all duration-200 hover:border-blue-300`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${studentFormData.userType === 'Student' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">Student</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleRoleSelect('Alumni')}
                          className={`flex flex-col items-center justify-center p-3 border ${studentFormData.userType === 'Alumni' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} rounded-lg transition-all duration-200 hover:border-blue-300`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${studentFormData.userType === 'Alumni' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">Alumni</span>
                        </button>
                      </div>
                      {!studentFormData.userType && (
                        <p className="text-xs text-red-500 mt-1">Please select a role</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>

                    <Link
                      href="/forgot-password"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-900 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                <button
                  onClick={() => setUserType(null)}
                  className="mt-6 w-full text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to selection</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
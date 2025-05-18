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
    password: '',
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

    const endpoint = formType === 'student' ? '/login' : '/college-login';

    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include', // important for cookies if you're setting session tokens
    });

    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();

    // ✅ Store CSRF token if returned in response
    if (data.csrf_token) {
      sessionStorage.setItem('csrf_token', data.csrf_token);
    }

    // ✅ Redirect based on user type
    if (formType === 'student') {
      router.push('/dashboard');
    } else {
      router.push('/admindashboard');
    }
  } catch (err) {
    setError('Invalid credentials. Please try again.');
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
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl mx-auto my-auto"
              >
                <div className="text-center mb-8">
                  <Image src="/logo.png" alt="Net4Grad Logo" width={64} height={64} className="mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    {userType === 'student' ? 'Student/Alumni Login' : 'Admin Login'}
                  </h3>
                </div>

                <form onSubmit={(e) => handleSubmit(e, userType)} className="space-y-6">
                  <div>
                    <label htmlFor="CollegeID" className="block text-sm font-medium text-gray-700 mb-2">
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
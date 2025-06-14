'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../components/landingpage/Header'
import { delay } from 'framer-motion/dom';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    collegeId: '',
    collegeName: '',
    password: '',
    accreditation: '',
    departments: [],
    description: '',
    email: '',
    established: '',
    location: '',
    logo_url: '',
    phone: '',
    website: '',
    social_media: {
      facebook: '',
      linkedin: '',
      twitter: ''
    }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check for compulsory fields
    if (!formData.collegeId || !formData.collegeName || !formData.password) {
      setError('Please fill in all compulsory fields.');
      setIsLoading(false);
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and include both letters and numbers.');
      setIsLoading(false);
      return;
    }

    try {
      // Format departments as array if it's a string
      const departments = typeof formData.departments === 'string' 
        ? (formData.departments as string).split(',').map(d => d.trim()).filter(d => d)
        : formData.departments;

      // Clean up social media object by removing empty values
      const social_media = Object.entries(formData.social_media)
        .reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      const requestData = {
        college: {
          accreditation: formData.accreditation || undefined,
          collegeId: formData.collegeId.trim(),
          collegeName: formData.collegeName.trim(),
          departments: departments.length > 0 ? departments : undefined,
          description: formData.description || undefined,
          email: formData.email || undefined,
          established: formData.established ? parseInt(formData.established) : undefined,
          location: formData.location || undefined,
          logo_url: formData.logo_url || undefined,
          phone: formData.phone || undefined,
          social_media: Object.keys(social_media).length > 0 ? social_media : undefined,
          website: formData.website || undefined
        },
        admin_password: formData.password
      };

      const response = await fetch('http://localhost:8000/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Redirect to login page after successful registration
       // Delay for 1 second before redirecting
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social_media.')) {
      const socialPlatform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social_media: {
          ...prev.social_media,
          [socialPlatform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-16 mt-8">
        <div className="flex gap-4 max-w-8xl mx-auto">
          {/* Left Side - Promotion */}
          <div className="w-1/2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white p-8 rounded-2xl shadow-xl">
            <div className="mb-8">
              <Image src="/logo.png" alt="Net4Grad Logo" width={64} height={64} className="mb-6" />
              <h2 className="text-3xl font-bold mb-4">Connect with your alumni network effortlessly</h2>
              <p className="text-blue-100 mb-6">Join thousands of institutions using Net4Grad to build stronger alumni relationships.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
              <h3 className="text-2xl font-bold mb-2">30 day Free Trial</h3>
              <p className="text-blue-100 mb-4">Explore the future of alumni networking</p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Alumni directory management</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Event organization tools
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Communication platform
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Analytics dashboard
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-2/3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Start your free trial</h2>
              <p className="text-gray-600 mt-2">No Credit Card Required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="collegeId" className="block text-sm font-medium text-gray-700 mb-2">
                    College ID
                  </label>
                  <input
                    required
                    id="collegeId"
                    name="collegeId"
                    type="text"
                    value={formData.collegeId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 mb-2">
                    College Name
                  </label>
                  <input
                    required
                    id="collegeName"
                    name="collegeName"
                    type="text"
                    value={formData.collegeName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    required
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="accreditation" className="block text-sm font-medium text-gray-700 mb-2">
                    Accreditation
                  </label>
                  <input
                    id="accreditation"
                    name="accreditation"
                    type="text"
                    value={formData.accreditation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label htmlFor="established" className="block text-sm font-medium text-gray-700 mb-2">
                    Established Year
                  </label>
                  <input
                    id="established"
                    name="established"
                    type="number"
                    value={formData.established}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="social_media.facebook" className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      id="social_media.facebook"
                      name="social_media.facebook"
                      type="text"
                      value={formData.social_media.facebook}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="social_media.twitter" className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      id="social_media.twitter"
                      name="social_media.twitter"
                      type="text"
                      value={formData.social_media.twitter}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="social_media.linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      id="social_media.linkedin"
                      name="social_media.linkedin"
                      type="text"
                      value={formData.social_media.linkedin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? 'Creating Account...' : 'Start free trial'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';

export default function SuccessStoriesSection() {
  const stories = [
    {
      name: 'John Doe',
      initials: 'JD',
      class: '2018',
      story: 'Through Alumni Connect, I found my dream job at a leading tech company. The network has been invaluable for my career growth.',
      role: 'Software Engineer at TechCorp'
    },
    {
      name: 'Jane Smith',
      initials: 'JS',
      class: '2015',
      story: 'The mentorship program connected me with industry leaders who helped shape my entrepreneurial journey.',
      role: 'Founder & CEO at StartupX'
    },
    {
      name: 'Robert Johnson',
      initials: 'RJ',
      class: '2020',
      story: 'The alumni events have helped me build a strong professional network and opened doors to amazing opportunities.',
      role: 'Marketing Director at BrandCo'
    },
    {
      name: 'Sarah Chen',
      initials: 'SC',
      class: '2019',
      story: 'The alumni resource library and workshops helped me transition into a new career field successfully.',
      role: 'Data Scientist at AI Labs'
    },
    {
      name: 'Michael Park',
      initials: 'MP',
      class: '2017',
      story: 'Connected with fellow alumni to co-found a successful startup. The network was instrumental in our early growth.',
      role: 'Co-founder at TechStart'
    },
    {
      name: 'Emily Rodriguez',
      initials: 'ER',
      class: '2016',
      story: 'Found incredible mentors through the platform who guided me to leadership roles in my industry.',
      role: 'VP of Operations at GlobalCorp'
    }
  ];

  return (
    <section id="success-stories" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 snap-start py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover how our alumni are making an impact across industries</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-white backdrop-blur-sm bg-opacity-80 p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-gray-100"
            >
              <div className="flex items-center mb-6 space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-inner">
                  <span className="text-xl font-bold text-white">{story.initials}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{story.name}</h3>
                  <p className="text-sm text-gray-500">Class of {story.class}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic text-lg">
                "{story.story}"
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">{story.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

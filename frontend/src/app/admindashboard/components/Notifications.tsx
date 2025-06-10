'use client';

import { useState } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Notifications</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Send Notification
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Notifications</h3>
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-900">Mark All as Read</button>
            <button className="text-red-600 hover:text-red-900">Clear All</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {/* Map through notifications data here */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-black">System Notification</h4>
                  <p className="text-gray-600">This is an example notification message.</p>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                <button className="text-blue-600 hover:text-blue-900 text-sm">Mark as Read</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-black">New Achievement</h4>
                  <p className="text-gray-600">A new achievement has been added to the system.</p>
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                <button className="text-blue-600 hover:text-blue-900 text-sm">Mark as Read</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No notifications found.</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Send New Notification</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Type</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option value="all">All Users</option>
              <option value="students">All Students</option>
              <option value="alumni">All Alumni</option>
              <option value="admins">All Admins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Notification title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea className="w-full p-2 border border-gray-300 rounded-lg" rows={4} placeholder="Notification message"></textarea>
          </div>
          <div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
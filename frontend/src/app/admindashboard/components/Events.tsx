'use client';

import { useState, useEffect } from 'react';

interface Event {
  id?: string;
  title: string;
  type: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  organizer: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    title: '',
    type: '',
    description: '',
    date: '',
    location: '',
    attendees: 0,
    organizer: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

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
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const response = await fetch('http://localhost:8000/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify(newEvent)
      });
      if (!response.ok) throw new Error('Failed to create event');
      const data = await response.json();
      setEvents([...events, data]);
      setShowModal(false);
      setNewEvent({
        title: '',
        type: '',
        description: '',
        date: '',
        location: '',
        attendees: 0,
        organizer: ''
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        }
      });
      if (!response.ok) throw new Error('Failed to delete event');
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Manage Events</h2>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Event
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">{event.type}</span>
                </div>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-sm text-gray-500">{event.location}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span>Organizer: {event.organizer}</span>
                  <span className="mx-2">•</span>
                  <span>Attendees: {event.attendees}</span>
                </div>
                <div className="space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id!)} 
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No events found. Create an event to get started.</p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Create New Event</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendees Limit</label>
                <input
                  type="number"
                  value={newEvent.attendees}
                  onChange={(e) => setNewEvent({...newEvent, attendees: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                <input
                  type="text"
                  value={newEvent.organizer}
                  onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                  className="w-full p-2 border rounded-lg"
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
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
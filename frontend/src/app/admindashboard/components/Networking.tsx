'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  groupId?: string;
  receiverId?: string;
  content: string;
  timestamp: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export default function Networking() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [chatType, setChatType] = useState<'group' | 'individual'>('individual');
  const [userRole, setUserRole] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch groups and users when component mounts
  useEffect(() => {
    fetchGroups();
    fetchUsers();
    getCurrentUserRole();
  }, []);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    
    if (userId) {
      // No need to pass token in URL as it will be sent in cookies automatically
      const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setSocket(ws);
      };
      
      ws.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        console.log('WebSocket message received:', receivedData);
        
        if (receivedData.type === 'group_message' && chatType === 'group') {
          const messageData = receivedData.data;
          if (messageData.groupId === selectedGroup?._id) {
            setMessages(prev => [...prev, messageData]);
          }
        } else if (receivedData.type === 'message' && chatType === 'individual') {
          // For individual chat, check if the message is from or to the selected user
          const messageData = receivedData.data;
          const currentUserId = sessionStorage.getItem('user_id');
          if ((messageData.senderId === selectedUser?._id && messageData.receiverId === currentUserId) || 
              (messageData.senderId === currentUserId && messageData.receiverId === selectedUser?._id)) {
            setMessages(prev => [...prev, messageData]);
          }
        }
      };
      
      //ws.onerror = (error) => {
      //console.error('WebSocket error:', error);
      //  setError('Failed to connect to chat server');
      //};
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      
      return () => {
        ws.close();
      };
    }
  }, [selectedGroup, selectedUser, chatType]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/groups/', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      setGroups(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/users/', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const getCurrentUserRole = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/me', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }

      const data = await response.json();
      setUserRole(data.role);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchMessages = async (groupId?: string, userId?: string) => {
    try {
      setLoading(true);
      let url = 'http://localhost:8000/messages/?';
      
      if (chatType === 'group' && groupId) {
        url += `group_id=${groupId}`;
      } else if (chatType === 'individual' && userId) {
        url += `receiver_id=${userId}`;
      } else {
        setMessages([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setChatType('group');
    fetchMessages(group._id);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setChatType('individual');
    fetchMessages(undefined, user._id);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    let message;
    
    if (chatType === 'group' && selectedGroup) {
      message = {
        type: 'group_message',
        groupId: selectedGroup._id,
        content: newMessage
      };
    } else if (chatType === 'individual' && selectedUser) {
      message = {
        type: 'message',
        receiverId: selectedUser._id,
        content: newMessage
      };
    } else {
      return;
    }

    socket.send(JSON.stringify(message));
    setNewMessage('');
  };

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberFilter, setMemberFilter] = useState<string>('All');
  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };
  const handleSelectAll = () => {
    setSelectedMembers((memberFilter === 'All' ? users : users.filter(u => u.role === memberFilter)).map(u => u._id));
  };
  const handleDeselectAll = () => {
    setSelectedMembers([]);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    if (selectedMembers.length === 0) {
      setError('Please select at least one member.');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/groups/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': sessionStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          members: selectedMembers,
          type: 'community'
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create group');
      }
      const newGroup = await response.json();
      setGroups(prev => [...prev, newGroup]);
      setNewGroupName('');
      setNewGroupDescription('');
      setSelectedMembers([]);
      setShowCreateGroup(false);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Networking</h2>
        {userRole === 'Admin' && (
          <button 
            onClick={() => setShowCreateGroup(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Group
          </button>
        )}
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setChatType('group')}
          className={`px-4 py-2 rounded-lg ${chatType === 'group' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Group Chat
        </button>
        <button
          onClick={() => setChatType('individual')}
          className={`px-4 py-2 rounded-lg ${chatType === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Individual Chat
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Groups/Users List */}
        <div className="w-1/4 bg-white rounded-lg shadow-md overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">{chatType === 'group' ? 'Groups' : 'Users'}</h3>
          </div>
          
          {loading && ((chatType === 'group' && groups.length === 0) || (chatType === 'individual' && users.length === 0)) ? (
            <div className="p-4 text-center text-gray-500">Loading {chatType === 'group' ? 'groups' : 'users'}...</div>
          ) : chatType === 'group' ? (
            groups.length > 0 ? (
              <ul>
                {groups.map(group => (
                  <li 
                    key={group._id} 
                    onClick={() => handleGroupSelect(group)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedGroup?._id === group._id ? 'bg-blue-50' : ''}`}
                  >
                    <h4 className="font-medium text-gray-800">{group.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{group.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">No groups found</div>
            )
          ) : users.length > 0 ? (
            <ul>
              {users.map(user => (
                <li 
                  key={user._id} 
                  onClick={() => handleUserSelect(user)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-blue-50' : ''}`}
                >
                  <h4 className="font-medium text-gray-800">{user.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <span className={`inline-block w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          {(chatType === 'group' && selectedGroup) || (chatType === 'individual' && selectedUser) ? (
            <>
              <div className="p-4 border-b border-gray-200">
                {chatType === 'group' && selectedGroup ? (
                  <>
                    <h3 className="font-medium text-gray-800">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-500">{selectedGroup.description}</p>
                  </>
                ) : chatType === 'individual' && selectedUser ? (
                  <>
                    <h3 className="font-medium text-gray-800">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </>
                ) : null}
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {loading ? (
                  <div className="text-center text-gray-500">Loading messages...</div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div key={message._id} className="flex flex-col">
                        <div className="flex items-end">
                          <div className="bg-white rounded-lg shadow-sm p-3 max-w-xs md:max-w-md">
                            <div className="font-medium text-blue-600">{message.senderName}</div>
                            <p className="text-gray-800">{message.content}</p>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No messages yet</div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {chatType === 'group' ? 'Select a group to start chatting' : 'Select a user to start chatting'}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create New Group</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="groupName">Group Name</label>
              <input id="groupName" type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter group name" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="groupDescription">Description</label>
              <textarea id="groupDescription" value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter group description" rows={3} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Select Members</label>
              <div className="flex gap-2 mb-2">
                <button type="button" className={`px-2 py-1 rounded ${memberFilter==='All'?'bg-blue-600 text-white':'bg-gray-200 text-gray-800'}`} onClick={()=>setMemberFilter('All')}>All</button>
                <button type="button" className={`px-2 py-1 rounded ${memberFilter==='Student'?'bg-blue-600 text-white':'bg-gray-200 text-gray-800'}`} onClick={()=>setMemberFilter('Student')}>Students</button>
                <button type="button" className={`px-2 py-1 rounded ${memberFilter==='Alumni'?'bg-blue-600 text-white':'bg-gray-200 text-gray-800'}`} onClick={()=>setMemberFilter('Alumni')}>Alumni</button>
                <button type="button" className={`px-2 py-1 rounded ${memberFilter==='Admin'?'bg-blue-600 text-white':'bg-gray-200 text-gray-800'}`} onClick={()=>setMemberFilter('Admin')}>Admins</button>
                <button type="button" className="px-2 py-1 rounded bg-green-500 text-white" onClick={handleSelectAll}>Select All</button>
                <button type="button" className="px-2 py-1 rounded bg-red-500 text-white" onClick={handleDeselectAll}>Deselect All</button>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {(memberFilter === 'All' ? users : users.filter(u => u.role === memberFilter)).length === 0 ? <div className="text-gray-500">No users found.</div> : (memberFilter === 'All' ? users : users.filter(u => u.role === memberFilter)).map(user => (
                  <label key={user._id} className="flex items-center gap-2 mb-1 cursor-pointer">
                    <input type="checkbox" checked={selectedMembers.includes(user._id)} onChange={()=>handleMemberToggle(user._id)} />
                    <span>{user.name} <span className="text-xs text-gray-500">({user.role})</span></span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={()=>setShowCreateGroup(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleCreateGroup} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
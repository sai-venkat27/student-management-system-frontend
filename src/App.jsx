import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, GraduationCap, LogIn, LogOut, Lock, User } from 'lucide-react';
import API from './api'; // Ensure your src/api.js matches the clean Axios instance

export default function App() {
  // --- State Management ---
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Form state aligning directly with your backend StudentDto properties
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    rollNumber: '',
    course: 'Computer Science',
    status: 'Active'
  });

  // --- Read: Fetch Records from Spring Boot on Initial Mount ---
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await API.get(''); // Hits /api/students endpoint directly
      setStudents(response.data);
    } catch (error) {
      console.error('Error syncing with database repo:', error);
      alert('Synchronization failed: Unable to parse student directories from server.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Authentication Handlers ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Simple hardcoded check for demonstration (Change username/password as needed)
    if (loginCredentials.username === 'admin' && loginCredentials.password === 'password123') {
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      setLoginCredentials({ username: '', password: '' });
      setLoginError('');
    } else {
      setLoginError('Invalid username or password. Try admin / password123');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    alert('Logged out successfully. Switched back to Read-Only mode.');
  };

  // --- Handlers ---
  const handleOpenModal = (student = null) => {
    if (!isLoggedIn) {
      alert('Access Denied: Please log in as an administrator to modify student records.');
      return;
    }

    if (student) {
      setEditingStudent(student);
      setFormData({
        id: student.id,
        firstname: student.firstname || '',
        lastname: student.lastname || '',
        email: student.email || '',
        rollNumber: student.rollNumber || student.rollNo || '',
        course: student.course || 'Computer Science',
        status: student.status || 'Active'
      });
    } else {
      setEditingStudent(null);
      setFormData({ firstname: '', lastname: '', email: '', rollNumber: '', course: 'Computer Science', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Create & Update Operations ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;

    try {
      if (editingStudent) {
        const response = await API.put(`/${editingStudent.id}`, formData);
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? response.data : s));
      } else {
        const { id, ...newStudentData } = formData; 
        const response = await API.post('', newStudentData);
        setStudents(prev => [...prev, response.data]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving student profile:', error);
      alert('Failed to save student record to backend server.');
    }
  };

  // --- Delete Operation ---
  const handleDelete = async (id) => {
    if (!isLoggedIn) {
      alert('Access Denied: Please log in as an administrator to delete records.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this student record from the database permanently?')) {
      try {
        await API.delete(`/${id}`);
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting student profile:', error);
        alert('Could not remove record from backend database.');
      }
    }
  };

  // --- Front-end Quick Filtering ---
  const filteredStudents = students.filter(student => {
    const fname = student.firstname || '';
    const lname = student.lastname || '';
    const roll = student.rollNumber || student.rollNo || '';
    const major = student.course || '';

    return (
      fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      major.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="font-bold text-xl tracking-tight text-gray-900">Students Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full ${isLoggedIn ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              <UserCheck className="w-4 h-4" />
              <span>Role: {isLoggedIn ? 'Super Admin' : 'Guest (Read-Only)'}</span>
            </div>

            {/* Login / Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 shadow-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <LogIn className="w-4 h-4" />
                Admin Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLoggedIn ? 'Manage, update, and track active student profiles.' : 'Viewing student records in Read-Only mode. Log in to make changes.'}
            </p>
          </div>
          
          {/* Only show Add button if logged in */}
          {isLoggedIn && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-150 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add New Student
            </button>
          )}
        </div>

        {/* Search Input Filter utility */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, roll number, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
          />
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Student Info</th>
                  <th className="px-6 py-4">Course/Major</th>
                  <th className="px-6 py-4">Status</th>
                  {isLoggedIn && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={isLoggedIn ? "5" : "4"} className="px-6 py-12 text-center text-gray-400">
                      Synchronizing with database...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-gray-600">
                        {student.rollNumber || student.rollNo || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {`${student.firstname || ''} ${student.lastname || ''}`.trim() || 'Unnamed Student'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{student.course}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {student.status || 'Active'}
                        </span>
                      </td>
                      {isLoggedIn && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(student)}
                            className="inline-flex items-center p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="inline-flex items-center p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isLoggedIn ? "5" : "4"} className="px-6 py-12 text-center text-gray-400">
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- Admin Login Modal with Username & Password Fields --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" /> Admin Login
              </h3>
              <button 
                onClick={() => { setIsLoginModalOpen(false); setLoginError(''); }}
                className="text-gray-400 hover:text-gray-600 text-xl font-semibold focus:outline-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {loginError && (
                <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginCredentials.username}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="password123"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsLoginModalOpen(false); setLoginError(''); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all duration-150"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Add/Edit Modal */}
      {isModalOpen && isLoggedIn && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingStudent ? 'Modify Student Record' : 'Enroll New Student'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-semibold focus:outline-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    required
                    value={formData.firstname}
                    onChange={handleInputChange}
                    placeholder="e.g. Eleanor"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastname"
                    required
                    value={formData.lastname}
                    onChange={handleInputChange}
                    placeholder="Vance"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="eleanor@univ.edu"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Roll ID</label>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    placeholder="STU999"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Course / Major</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all duration-150"
                >
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
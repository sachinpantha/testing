import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(username, password);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      switch (user.role) {
        case 'super_admin':
          navigate('/super-admin');
          break;
        case 'waiter':
          navigate('/waiter');
          break;
        case 'chef':
          navigate('/chef');
          break;
        case 'receptionist':
          navigate('/receptionist');
          break;
        default:
          navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏨</div>
          <h2 className="text-2xl font-bold text-gray-800">धुर्बतारा रेस्टुरेन्ट एण्ड लज</h2>
          <p className="text-gray-600 mt-1">आफ्नो खातामा साइन इन गर्नुहोस्</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              प्रयोगकर्ता नाम
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="आफ्नो प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              पासवर्ड
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
          >
            साइन इन
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>डेमो प्रमाणहरू:</p>
          <p>admin/admin123 • waiter1/waiter123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, createUser, deleteUser, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, getAllOrders, getAllBills, initializeTables } from '../services/api';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'waiter' });
  const [newMenuItem, setNewMenuItem] = useState({ name: '', category: '', price: '', description: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'users') {
        const response = await getUsers();
        setUsers(response.data);
      } else if (activeTab === 'menu') {
        const response = await getMenuItems();
        setMenuItems(response.data);
      } else if (activeTab === 'orders') {
        const response = await getAllOrders();
        setOrders(response.data);
      } else if (activeTab === 'bills') {
        const response = await getAllBills();
        setBills(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setNewUser({ username: '', password: '', role: 'waiter' });
      loadData();
    } catch (error) {
      alert('Error creating user');
    }
  };

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    try {
      await createMenuItem({ ...newMenuItem, price: parseFloat(newMenuItem.price) });
      setNewMenuItem({ name: '', category: '', price: '', description: '' });
      loadData();
    } catch (error) {
      alert('Error creating menu item');
    }
  };

  const handleInitializeTables = async () => {
    try {
      await initializeTables();
      alert('Tables initialized successfully');
    } catch (error) {
      alert('Error initializing tables');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">सुपर एडमिन ड्यासबोर्ड</h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">प्रयोगकर्ता, मेनु, अर्डर र बिलहरू व्यवस्थापन गर्नुहोस्</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm sm:text-base text-gray-700">स्वागत छ, {user.username}</span>
              <button 
                onClick={logout} 
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition duration-200 text-sm sm:text-base"
              >
                लगआउट
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">


        <div className="border-b border-gray-200 mb-4 sm:mb-6">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            {['users', 'menu', 'orders', 'bills'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'users' ? 'प्रयोगकर्ताहरू' : tab === 'menu' ? 'मेनु' : tab === 'orders' ? 'अर्डरहरू' : 'बिलहरू'}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'users' && (
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">प्रयोगकर्ता व्यवस्थापन</h3>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">नयाँ प्रयोगकर्ता थप्नुहोस्</h4>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="प्रयोगकर्ता नाम"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="password"
                    placeholder="पासवर्ड"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="waiter">वेटर</option>
                    <option value="chef">खाना पकाउने</option>
                    <option value="receptionist">रिसेप्सनिस्ट</option>
                  </select>
                  <button 
                    type="submit" 
                    className="w-full sm:col-span-2 lg:col-span-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm"
                  >
                    प्रयोगकर्ता थप्नुहोस्
                  </button>
                </form>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">प्रयोगकर्ता नाम</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">भूमिका</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">स्थिति</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">कार्यहरू</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteUser(user._id).then(loadData)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">मेनु व्यवस्थापन</h3>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">नयाँ मेनु आइटम थप्नुहोस्</h4>
                <form onSubmit={handleCreateMenuItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="आइटमको नाम"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <select
                    value={newMenuItem.category}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">केटेगोरी छान्नुहोस्</option>
                    <option value="Veg">शाकाहारी</option>
                    <option value="Non-Veg">मांसाहारी</option>
                  </select>
                  <input
                    type="number"
                    placeholder="मूल्य"
                    value={newMenuItem.price}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button 
                    type="submit" 
                    className="w-full sm:col-span-2 lg:col-span-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm"
                  >
                    आइटम थप्नुहोस्
                  </button>
                </form>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">नाम</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">केटेगोरी</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">मूल्य</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">उपलब्ध</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">कार्यहरू</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {menuItems.map(item => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">रू{item.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isAvailable ? 'छ' : 'छैन'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteMenuItem(item._id).then(loadData)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">सबै अर्डरहरू</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">टेबल</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">वेटर</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">आइटमहरू</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">जम्मा</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">स्थिति</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">मिति</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.tableNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.waiter?.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items.length} आइटमहरू</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">रू{order.totalAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bills' && (
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">सबै बिलहरू</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">टेबल</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">उपजम्मा</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">कर</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">जम्मा</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">रिसेप्सनिस्ट</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">मिति</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bills.map(bill => (
                      <tr key={bill._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.tableNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">रू{bill.subtotal}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">रू{bill.tax}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">रू{bill.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.receptionist?.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(bill.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
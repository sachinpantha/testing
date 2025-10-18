import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getKitchenOrders, updateOrderStatus } from '../services/api';
import socketService from '../services/socket';

const ChefDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
    
    // Connect to socket for real-time updates
    const socket = socketService.connect();
    
    // Listen for new orders and order updates
    const handleOrderUpdate = () => {
      loadOrders();
    };
    
    socketService.on('newOrder', handleOrderUpdate);
    socketService.on('orderUpdated', handleOrderUpdate);
    
    // Handle mobile app visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        socketService.connect();
        loadOrders();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      socketService.off('newOrder', handleOrderUpdate);
      socketService.off('orderUpdated', handleOrderUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socketService.disconnect();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getKitchenOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_kitchen': return '#f59e0b';
      case 'ready': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'in_kitchen': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_kitchen': return 'In Kitchen';
      case 'ready': return 'Ready';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">खाना पकाउने ड्यासबोर्ड</h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">भान्साको अर्डर र स्थिति व्यवस्थापन गर्नुहोस्</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <span className="text-sm sm:text-base text-gray-700 text-center sm:text-left">स्वागत छ, {user.username}</span>
              <div className="flex space-x-2">
                <button
                  onClick={loadOrders}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  रिफ्रेस
                </button>
                <button 
                  onClick={logout} 
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  लगआउट
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending orders</h3>
              <p className="text-gray-600">All orders are completed!</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Table {order.tableNumber}</h3>
                  <span
                    className="px-3 py-1 text-xs font-medium text-white rounded-full"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="mb-4 space-y-1">
                  <p className="text-sm text-gray-600">
                    Waiter: <span className="font-medium">{order.waiter?.username}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Order Time: <span className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">
                          {item.menuItem?.name || 'Unknown Item'}
                        </span>
                        <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.status === 'in_kitchen' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'ready')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
                    >
                      Mark as Ready
                    </button>
                  )}
                  
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'served')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
                    >
                      Mark as Served
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Guide</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">In Kitchen - Currently being prepared</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Ready - Ready for serving</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
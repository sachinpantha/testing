import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTables, getMenuItems, createOrder } from '../services/api';
import socketService from '../services/socket';

const WaiterDashboard = () => {
  const { user, logout } = useAuth();
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    loadTables();
    loadMenuItems();
    
    // Connect to socket for real-time updates
    const socket = socketService.connect();
    
    // Listen for table updates
    const handleTableUpdate = (updatedTable) => {
      console.log('Received tableUpdated event:', updatedTable);
      setTables(prevTables => 
        prevTables.map(table => 
          table.tableNumber === updatedTable.tableNumber ? updatedTable : table
        )
      );
    };
    
    socketService.on('tableUpdated', handleTableUpdate);
    
    return () => {
      socketService.off('tableUpdated', handleTableUpdate);
      socketService.disconnect();
    };
  }, []);

  const loadTables = async () => {
    try {
      const response = await getTables();
      setTables(response.data);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await getMenuItems();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleTableSelect = (table) => {
    if (table.status === 'vacant') {
      setSelectedTable(table);
      setOrderItems([]);
    } else {
      alert('Table is not available');
    }
  };

  const addItemToOrder = (menuItem) => {
    const existingItem = orderItems.find(item => item.menuItem === menuItem._id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItem === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const updateItemQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.menuItem !== menuItemId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.menuItem === menuItemId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const submitOrder = async () => {
    if (orderItems.length === 0) {
      alert('Please add items to the order');
      return;
    }

    try {
      await createOrder({
        tableNumber: selectedTable.tableNumber,
        items: orderItems.map(item => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
          price: item.price
        }))
      });
      
      alert('Order submitted successfully!');
      setSelectedTable(null);
      setOrderItems([]);
      loadTables();
    } catch (error) {
      alert('Error submitting order');
    }
  };

  const getTableColor = (status) => {
    switch (status) {
      case 'vacant': return '#10b981';
      case 'occupied': return '#f59e0b';
      case 'served': return '#3b82f6';
      case 'billed': return '#6b7280';
      default: return '#10b981';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">वेटर ड्यासबोर्ड</h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">टेबल छान्नुहोस् र अर्डर व्यवस्थापन गर्नुहोस्</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm sm:text-base text-gray-700">स्वागत छ, {user.username}</span>
              <button 
                onClick={loadTables} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition duration-200 text-sm sm:text-base"
              >
                रिफ्रेस
              </button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {!selectedTable ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">टेबल छान्नुहोस्</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {tables.map(table => (
                <div
                  key={table._id}
                  onClick={() => handleTableSelect(table)}
                  className={`p-4 sm:p-6 rounded-xl text-white text-center transition-all duration-200 transform hover:scale-105 ${
                    table.status === 'vacant' ? 'cursor-pointer shadow-lg' : 'cursor-not-allowed opacity-70'
                  }`}
                  style={{ backgroundColor: getTableColor(table.status) }}
                >
                  <div className="text-lg sm:text-2xl font-bold mb-1">टेबल {table.tableNumber}</div>
                  <div className="text-xs sm:text-sm uppercase tracking-wide">{table.status}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">टेबल स्थिति विवरण</h3>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">खाली</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700">भरिएको</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700">सेवा गरिएको</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm text-gray-700">बिल गरिएको</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900">टेबल {selectedTable.tableNumber} - अर्डर राख्नुहोस्</h2>
            <button
              onClick={() => setSelectedTable(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              टेबलमा फर्कनुहोस्
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">मेनु आइटमहरू</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menuItems.map(item => (
                  <div
                    key={item._id}
                    className="p-4 border border-gray-200 rounded-lg bg-white cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => addItemToOrder(item)}
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                    <p className="font-bold text-blue-600 mb-2">रू {item.price}</p>
                    {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4">हालको अर्डर</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200 sticky top-4">
                {orderItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">कुनै आइटम थपिएको छैन</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {orderItems.map(item => (
                        <div key={item.menuItem} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">रू {item.price} प्रत्येक</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => updateItemQuantity(item.menuItem, item.quantity - 1)}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition duration-200"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(item.menuItem, item.quantity + 1)}
                              className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition duration-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <p className="text-lg font-bold text-gray-900">
                        जम्मा: रू {orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <button
                      onClick={submitOrder}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-200 font-medium"
                    >
                      अर्डर पेश गर्नुहोस्
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default WaiterDashboard;
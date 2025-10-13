import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTables, getMenuItems, createOrder } from '../services/api';

const WaiterDashboard = () => {
  const { user, logout } = useAuth();
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    loadTables();
    loadMenuItems();
    // Auto-refresh tables every 30 seconds
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>Table {selectedTable.tableNumber} - Place Order</h2>
            <button
              onClick={() => setSelectedTable(null)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Back to Tables
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div>
              <h3>Menu Items</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {menuItems.map(item => (
                  <div
                    key={item._id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => addItemToOrder(item)}
                  >
                    <h4>{item.name}</h4>
                    <p style={{ color: '#666', margin: '0.5rem 0' }}>{item.category}</p>
                    <p style={{ fontWeight: 'bold', color: '#007bff' }}>रू{item.price}</p>
                    {item.description && <p style={{ fontSize: '0.9rem', color: '#666' }}>{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3>Current Order</h3>
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                {orderItems.length === 0 ? (
                  <p>No items added yet</p>
                ) : (
                  <>
                    {orderItems.map(item => (
                      <div key={item.menuItem} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <div>
                          <strong>{item.name}</strong>
                          <br />
                          <span>रू{item.price} each</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateItemQuantity(item.menuItem, item.quantity - 1)}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.menuItem, item.quantity + 1)}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem', marginTop: '1rem' }}>
                      <strong>
                        Total: रू{orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </strong>
                    </div>
                    
                    <button
                      onClick={submitOrder}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '1rem',
                        fontSize: '1rem'
                      }}
                    >
                      Submit Order
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
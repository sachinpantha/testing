import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTables, createBill, getBill, getAllTransactions, getOrdersByTable, markBillAsPaid } from '../services/api';
import socketService from '../services/socket';

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableOrders, setTableOrders] = useState([]);
  const [generatedBill, setGeneratedBill] = useState(null);
  const [activeTab, setActiveTab] = useState('tables');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (activeTab === 'tables') {
      loadTables();
      
      // Connect to socket for real-time updates
      const socket = socketService.connect();
      
      // Listen for table updates
      const handleTableUpdate = (updatedTable) => {
        setTables(prevTables => 
          prevTables.map(table => 
            table.tableNumber === updatedTable.tableNumber ? updatedTable : table
          )
        );
      };
      
      socketService.on('tableUpdated', handleTableUpdate);
      
      // Handle mobile app visibility changes
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          socketService.connect();
          loadTables();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        socketService.off('tableUpdated', handleTableUpdate);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else if (activeTab === 'history') {
      loadTransactions();
    }
  }, [activeTab]);

  const loadTables = async () => {
    try {
      const response = await getTables();
      setTables(response.data);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await getAllTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleTableSelect = async (table) => {
    if (table.status === 'served') {
      setSelectedTable(table);
      try {
        const response = await getOrdersByTable(table.tableNumber);
        setTableOrders(response.data);
      } catch (error) {
        console.error('Error loading orders:', error);
        setTableOrders([]);
      }
    } else {
      alert('Table must be served before billing');
    }
  };

  const generateBill = async () => {
    try {
      const response = await createBill({
        tableNumber: selectedTable.tableNumber
      });
      
      setGeneratedBill(response.data);
      alert('Bill generated successfully!');
      // Don't reload tables yet - wait for payment confirmation
    } catch (error) {
      alert('Error generating bill: ' + (error.response?.data?.message || error.message));
    }
  };

  const markAsPaid = async () => {
    try {
      await markBillAsPaid(generatedBill._id);
      alert('Payment confirmed! Table is now vacant.');
      setSelectedTable(null);
      setTableOrders([]);
      setGeneratedBill(null);
      loadTables();
    } catch (error) {
      alert('Error confirming payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const printBill = () => {
    const printWindow = window.open('', '_blank');
    const billContent = `
      <html>
        <head>
          <title>Hotel Bill - Table ${generatedBill.tableNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .bill-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total-section { text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏨 Hotel Management System</h1>
            <h2>Bill Receipt</h2>
          </div>
          
          <div class="bill-details">
            <p><strong>Table Number:</strong> ${generatedBill.tableNumber}</p>
            <p><strong>Date:</strong> ${new Date(generatedBill.createdAt).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(generatedBill.createdAt).toLocaleTimeString()}</p>
            <p><strong>Receptionist:</strong> ${generatedBill.receptionist?.username || user.username}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${generatedBill.order?.items?.map(item => `
                <tr>
                  <td>${item.menuItem?.name || 'Unknown Item'}</td>
                  <td>${item.quantity}</td>
                  <td>रू ${item.price?.toFixed(2)}</td>
                  <td>रू ${(item.price * item.quantity)?.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <p><strong>Subtotal: रू${generatedBill.subtotal.toFixed(2)}</strong></p>
            <p><strong>Tax (10%): रू${generatedBill.tax.toFixed(2)}</strong></p>
            <p style="font-size: 1.2em;"><strong>Grand Total: रू${generatedBill.total.toFixed(2)}</strong></p>
          </div>
          
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>Have a great day!</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.print();
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">रिसेप्सनिस्ट ड्यासबोर्ड</h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">बिल तयार गर्नुहोस् र लेनदेन इतिहास हेर्नुहोस्</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 mb-4 sm:mb-6">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            {['tables', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedTable(null);
                  setTableOrders([]);
                  setGeneratedBill(null);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'tables' ? 'टेबल र बिलिङ' : 'लेनदेन इतिहास'}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'tables' && !selectedTable ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">बिल तयार गर्न टेबल छान्नुहोस्</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {tables.map(table => (
                <div
                  key={table._id}
                  onClick={() => handleTableSelect(table)}
                  className={`p-6 rounded-xl text-white text-center transition-all duration-200 transform hover:scale-105 ${
                    table.status === 'served' ? 'cursor-pointer shadow-lg' : 'cursor-not-allowed opacity-70'
                  }`}
                  style={{ backgroundColor: getTableColor(table.status) }}
                >
                  <div className="text-2xl font-bold mb-1">Table {table.tableNumber}</div>
                  <div className="text-sm uppercase tracking-wide">{table.status}</div>
                  {table.status === 'served' && (
                    <div className="text-xs mt-1 opacity-90">बिल गर्न क्लिक गर्नुहोस्</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Table Status Legend</h3>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">खाली</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700">भरिएको (बिल गर्न सकिँदैन)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700">सेवा गरिएको (बिलिङको लागि तयार)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm text-gray-700">बिल गरिएको</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'tables' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Table {selectedTable.tableNumber} - Bill Details</h2>
              <button
                onClick={() => {
                  setSelectedTable(null);
                  setTableOrders([]);
                  setGeneratedBill(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Back to Tables
              </button>
            </div>

            <div>
              {tableOrders.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary - Table {selectedTable.tableNumber}</h3>
                  {tableOrders.map(order => (
                    <div key={order._id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Order by: {order.waiter?.username}</span>
                        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.menuItem?.name} x{item.quantity}</span>
                            <span>रू {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Bill</h3>
                <p className="text-gray-600 mb-6">Table {selectedTable.tableNumber} is ready for billing.</p>
              
              {!generatedBill ? (
                <button
                  onClick={generateBill}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
                >
                  Generate Bill
                </button>
              ) : (
                <div>
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                    <strong>✅ Bill Generated Successfully!</strong>
                  </div>
                  
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Bill Summary:</h4>
                    <div className="space-y-1 text-sm mb-3">
                      <div className="flex justify-between">
                        <span>Table:</span>
                        <span>{generatedBill.tableNumber}</span>
                      </div>
                    </div>
                    
                    {generatedBill.order?.items && (
                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-2">Items:</h5>
                        <div className="space-y-1">
                          {generatedBill.order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span>{item.menuItem?.name} x{item.quantity}</span>
                              <span>रू {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1 text-sm border-t pt-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>रू {generatedBill.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>रू {generatedBill.tax?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>रू {generatedBill.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={printBill}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
                    >
                      Print Bill
                    </button>
                    
                    <button
                      onClick={markAsPaid}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
                    >
                      भुक्तानी पूरा भयो (Mark as Paid)
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waiter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map(transaction => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.tableNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.waiter?.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.order?.items?.length || 0} items</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">रू {transaction.totalAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.completedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
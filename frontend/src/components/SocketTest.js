import React, { useEffect, useState } from 'react';
import socketService from '../services/socket';

const SocketTest = () => {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setConnected(true);
      setEvents(prev => [...prev, 'Connected to server']);
    });
    
    socket.on('disconnect', () => {
      setConnected(false);
      setEvents(prev => [...prev, 'Disconnected from server']);
    });
    
    socket.on('tableUpdated', (data) => {
      setEvents(prev => [...prev, `Table ${data.tableNumber} updated to ${data.status}`]);
    });
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 10, right: 10, background: 'white', padding: 10, border: '1px solid black', zIndex: 9999 }}>
      <div>Socket: {connected ? '✅ Connected' : '❌ Disconnected'}</div>
      <div>Events:</div>
      {events.slice(-5).map((event, i) => (
        <div key={i} style={{ fontSize: '12px' }}>{event}</div>
      ))}
    </div>
  );
};

export default SocketTest;
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to the Flask backend
    const socket = io(
      process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:8080'
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
    });

    socket.on('status', (data) => {
      console.log('Server status:', data.msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    connectionStatus
  };
}; 
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getSocketUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return process.env.NEXT_PUBLIC_SOCKET_URL || 'https://skillxchange-api-olgv.onrender.com';
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
};

export function getSocket(): Socket {
  if (!socket && typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || '';
    const socketUrl = getSocketUrl();
    socket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket!;
}

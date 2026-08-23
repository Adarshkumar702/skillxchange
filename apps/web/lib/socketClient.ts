import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket && typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || '';
    socket = io('http://localhost:5000', {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket!;
}

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { ENV } from './config/env';
import { setupSocketIO } from './sockets/socketHandler';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  },
});

setupSocketIO(io);

server.listen(ENV.PORT, () => {
  console.log(`🚀 SkillXchange Backend API running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
  console.log(`📚 Swagger OpenAPI documentation available at http://localhost:${ENV.PORT}/api/docs`);
});

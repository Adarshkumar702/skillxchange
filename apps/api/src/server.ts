import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { ENV } from './config/env';
import { socketCorsOptions } from './config/cors';
import { setupSocketIO } from './sockets/socketHandler';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: socketCorsOptions,
});

setupSocketIO(io);

server.listen(ENV.PORT, () => {
  console.log(`🚀 SkillXchange Backend API running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
  console.log(`📚 Swagger OpenAPI documentation available at http://localhost:${ENV.PORT}/api/docs`);
});

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { connectDatabase } from './database/sequelize';
import { seedDatabase } from './database/seed';

const PORT = parseInt(process.env.PORT || '4000', 10);

const bootstrap = async () => {
  try {
    await connectDatabase();
    await seedDatabase();

    const app = createApp();
    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      socket.on('join_organization', (orgId: string) => {
        socket.join(`org_${orgId}`);
        console.log(`[Socket.IO] ${socket.id} joined org_${orgId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    server.listen(PORT, () => {
      console.log(`[Server] Yoobic Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  bootstrap();
}

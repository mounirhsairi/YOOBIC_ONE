import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createApp } from './app';
import { connectDatabase } from './database/sequelize';
import { seedDatabase } from './database/seed';

const PORT = parseInt(process.env.PORT || '4000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_jwt_key_yoobic_2026';

const bootstrap = async () => {
  try {
    await connectDatabase();
    await seedDatabase();

    const app = createApp();
    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: {
        origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8081').split(','),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // P0 security fix: authenticate Socket.IO connections with JWT
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; isSuperAdmin: boolean };
        (socket as any).user = decoded;
        next();
      } catch {
        next(new Error('Invalid or expired authentication token'));
      }
    });

    io.on('connection', (socket) => {
      const user = (socket as any).user;
      console.log(`[Socket.IO] Authenticated client connected: ${socket.id} (user: ${user?.email})`);

      socket.on('join_organization', (orgId: string) => {
        // TODO: validate user membership in orgId before joining room
        socket.join(`org_${orgId}`);
        console.log(`[Socket.IO] ${user?.email} joined org_${orgId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    // Expose io for use in controllers via app.locals
    app.locals.io = io;

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Yoobic Backend running on http://0.0.0.0:${PORT} (reachable from emulator via 10.0.2.2:${PORT})`);
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  bootstrap();
}

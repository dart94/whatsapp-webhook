import app from './app';
import { PORT } from './config/constants';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocket } from "./socket";

const server = createServer(app);
initSocket(server);


// Manejo de cierre adecuado
process.on('SIGINT', () => {
  server.close(() => {
    console.log('\n🛑 Servidor detenido');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Error no manejado:', err);
  server.close(() => process.exit(1));
});
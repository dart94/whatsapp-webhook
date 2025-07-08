import app from './app';
import { PORT } from './config/constants';

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`✋ Presiona Ctrl+C para detener el servidor`);
});


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
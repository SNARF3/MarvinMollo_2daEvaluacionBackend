import express from 'express';
import { port } from './config.js';
import solicitudRoutes from './routes/solicitud.routes.js';
import cuentasRoutes from './routes/cuentas.routes.js';
import cors from 'cors'; 
import bodyParser from 'body-parser';
import proyectosRouter from './routes/proyectos.routes.js';
import calendarioRouter from './routes/calendario.routes.js';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

// Configuración avanzada del WebSocket
const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    threshold: 1024,
    concurrencyLimit: 10
  }
});

// Almacén de conexiones activas por ID de cuenta
const activeConnections = new Map();

// Función para notificar nuevos registros
const notifyNewUserRegistration = (userData) => {
  const adminConnection = activeConnections.get(1); // ID 1 para admin
  if (adminConnection && adminConnection.readyState === WebSocketServer.OPEN) {
    adminConnection.send(JSON.stringify({
      type: 'NUEVO_REGISTRO',
      data: {
        nombres: userData.nombres,
        apellido: userData.apellidoPat,
        correo: userData.correo,
        usuario: userData.usuario,
        timestamp: new Date().toISOString()
      }
    }));
  }
};

// Manejo de conexiones WebSocket
wss.on('connection', (ws, req) => {
  console.log('Nueva conexión WebSocket establecida');

  // Autenticación y registro de conexiones
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Mensaje WebSocket recibido:', data);

      if (data.type === 'REGISTER' && data.id_cuenta) {
        activeConnections.set(data.id_cuenta, ws);
        console.log(`Usuario registrado en WebSocket: ${data.id_cuenta}`);
      }
    } catch (error) {
      console.error('Error procesando mensaje WebSocket:', error);
    }
  });

  // Manejo de errores
  ws.on('error', (error) => {
    console.error('Error en conexión WebSocket:', error);
  });

  // Limpieza al cerrar conexión
  ws.on('close', () => {
    for (const [id_cuenta, connection] of activeConnections.entries()) {
      if (connection === ws) {
        activeConnections.delete(id_cuenta);
        console.log(`Conexión cerrada para usuario: ${id_cuenta}`);
        break;
      }
    }
  });

  // Mensaje de bienvenida
  ws.send(JSON.stringify({
    type: 'CONEXION_ESTABLECIDA',
    status: 'OK',
    timestamp: new Date().toISOString()
  }));
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(solicitudRoutes);
app.use(cuentasRoutes);
app.use(proyectosRouter);
app.use(calendarioRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    websocket: {
      activeConnections: activeConnections.size,
      totalClients: wss.clients.size
    },
    uptime: process.uptime()
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo no manejado en:', promise, 'razón:', reason);
});

// Inicio del servidor
server.listen(port, () => {
  console.log(`🚀 Servidor HTTP listo en http://localhost:${port}`);
  console.log(`⚡ WebSocket activo en ws://localhost:${port}`);
});

// Exportar para testing y uso en controladores
export { app, server, wss, notifyNewUserRegistration, activeConnections };
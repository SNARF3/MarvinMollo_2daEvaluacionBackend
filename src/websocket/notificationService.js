import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8083 });
const activeConnections = new Map();

wss.on('connection', (ws, req) => {
    console.log('Nuevo cliente WebSocket conectado');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'REGISTER_ADMIN' && data.id_cuenta === 1) { // ID 1 para admin
            activeConnections.set(data.id_cuenta, ws);
            console.log(`Admin conectado: ${data.id_cuenta}`);
        }
    });

    ws.on('close', () => {
        activeConnections.forEach((value, key) => {
            if (value === ws) {
                activeConnections.delete(key);
                console.log(`Usuario desconectado: ${key}`);
            }
        });
    });
});

export function notifyNewUserRegistration(userData) {
    const adminConnection = activeConnections.get(2); // ID 1 para admin
    if (adminConnection && adminConnection.readyState === WebSocket.OPEN) {
        adminConnection.send(JSON.stringify({
            type: 'NUEVO_REGISTRO',
            data: {
                nombres: userData.nombres,
                apellido: userData.apellidoPat,
                correo: userData.correo,
                usuario: userData.usuario,
                fecha: new Date().toISOString()
            }
        }));
    } else {
        console.log('Admin no está conectado al WebSocket');
    }
}
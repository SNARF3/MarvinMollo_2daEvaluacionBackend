import express from 'express';
import { port } from './config.js';
import solicitudRoutes from './routes/solicitud.routes.js';
import cuentasRoutes from './routes/cuentas.routes.js';
import formularioRouter from './routes/formulario.routes.js'
import cors from 'cors'; 
import bodyParser from 'body-parser';
import proyectosRouter from './routes/proyectos.routes.js'
import calendarioRouter from './routes/calendario.routes.js'

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());  
app.use(express.json());  // Middleware para parsear JSON
app.use(express.urlencoded({ extended: true }));  // Middleware para parsear datos de formularios
app.use(solicitudRoutes);
app.use(cuentasRoutes);
app.use(formularioRouter);
app.use(proyectosRouter);
app.use(calendarioRouter);
// Iniciar el servidor
app.listen(port)
console.log("server on port ", port);

import { fileUpload } from "../middlewares/upload.js"; // Middleware de Multer
import { formularioController } from "../controllers/formulario.controllers.js";
import { Router } from "express";
import { enviarFormulario } from "../controllers/formulario.controllers.js"; 


const router = Router();

// Ruta para manejar el envío de formulario con archivos
router.post(
  "/RegistrarFormulario", 
  fileUpload, // Middleware de Multer para manejar la carga de archivos
  enviarFormulario // El controlador que maneja el formulario
);

/*router.post(
    "/RegistrarTrabajoDirigido", 
    upload.fields([
        { name: 'proyectoTrabajo', maxCount: 1 }  // Campo para 'proyectoTrabajo'
    ]), 
    formularioController.enviarTrabajoDirigido // El controlador que maneja el formulario
);*/

//Tabla de solicitudes Pendientes:
router.patch("/cambiarEstado/:id_formulario/:nuevo_estado", formularioController.cambiarEstadoFormulario);

router.post('/RegistrarObservacion', formularioController.DejarObservacion)

export default router;

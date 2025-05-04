import { Router } from "express";
import { solicitudController } from "../controllers/solicitud.controllers.js";

const router = Router();

//Tabla de solicitudes Pendientes:
router.get("/solicitudesPendientes/:estado", solicitudController.solicitudesPendientes)

//Datos de un formulario Especifico por su id:
router.get("/formId/:id_formulario", solicitudController.solicitudesPendId)

router.get("/formRevisados", solicitudController.solicitudesPorEstado)

router.get("/revisionId/:id_cuenta", solicitudController.revisionesId)

router.get("/comentsId/:id_formulario", solicitudController.comentsForms)

export default router;

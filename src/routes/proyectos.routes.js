import { Router } from "express";
import { proyectoController} from "../controllers/proyectos.controllers.js";

const router = Router();
router.post("/Proyectos",proyectoController.BuscarProyectos)
export default router;

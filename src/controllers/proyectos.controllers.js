import { proyectosmodel } from '../models/proyectos.model.js';

export const BuscarProyectos = async(req, res) => {
    try {
        const { anio, categoria, titulo } = req.body;
        const resultado = await proyectosmodel.BuscarProyecto(anio, categoria, titulo);
        return res.send(resultado);
    } catch (error) {
        console.log("Error al buscar proyectos: ", error); // Corrección de console.log
    }
};

export const proyectoController = {
    BuscarProyectos
};
import { solicitudModel } from "../models/solicitud.model.js";

const solicitudesPendientes = async (req, res) => {
    try {
        const { estado } = req.params;
        const rows = await solicitudModel.solicitudesPendientes(estado);
        return res.send(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en la carga de solicitudes',
        });
    }
};

const solicitudesPendId = async (req, res) => {
    try {
        const { id_formulario } = req.params;
        const rows = await solicitudModel.solicitudPendId(id_formulario);
        return res.send(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en la carga de la solicitud: ' + error,
        });
    }
};



const solicitudesPorEstado = async (req, res) => {
    try {
        const rows = await solicitudModel.solicitudesPorEstado();
        return res.send(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener las solicitudes por estado',
        });
    }
};

const revisionesId = async (req, res) => {
    try {
        const { id_cuenta } = req.params; // ID del formulario recibido
        const rows = await solicitudModel.revisionId(id_cuenta); // Llama al modelo
        return res.send(rows); // Responde con los datos obtenidos
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener los datos del formulario: ' + error,
        });
    }
};

const comentsForms = async (req, res) => {
    try {
        const { id_formulario } = req.params; // ID del formulario recibido
        const rows = await solicitudModel.comentariosFormularios(id_formulario); // Llama al modelo
        return res.send(rows); // Responde con los datos obtenidos
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener los datos del formulario: ' + error,
        });
    }
};

export const solicitudController = {
    solicitudesPendientes,
    solicitudesPendId,
    solicitudesPorEstado, // Nueva función añadida
    revisionesId,
    comentsForms
};

import { formularioModel } from "../models/formulario.model.js";
import { uploadToGoogleDrive, cartasFolderId, propuestasFolderId } from '../middlewares/upload.js';
import { decodedToken } from "../middlewares/tokens.js";

export const enviarFormulario = async(req, res) => {
    try {
        const {
            token,
            categoria,
            titulo_propuesta
        } = req.body;

        // Decodificar el token
        const data = await decodedToken(token);
        const { nroDocumento, nombres, apellidoPaterno, apellidoMaterno, correo, id_cuenta } = data;

        // Inicializar las rutas de los archivos a null
        let proyectoTrabajo = null;
        let detallePropuesta = null;

        // Verificar si los archivos existen y subirlos a Google Drive
        if (req.files ?.proyectoTrabajo ?.[0]) {
            const file = req.files.proyectoTrabajo[0];
            const fileLink = await uploadToGoogleDrive(file.buffer, file.originalname, cartasFolderId); // Usar el ID de la carpeta correspondiente
            proyectoTrabajo = fileLink; // Guardar el link del archivo subido
        }

        if (req.files ?.detallePropuesta ?.[0]) {
            const file = req.files.detallePropuesta[0];
            const fileLink = await uploadToGoogleDrive(file.buffer, file.originalname, propuestasFolderId); // Usar el ID de la carpeta correspondiente
            detallePropuesta = fileLink; // Guardar el link del archivo subido
        }
        if (!proyectoTrabajo || !detallePropuesta) {
            return res.send({
                ok: false,
                message: 'debe ingresar todos los campos'
            })
        } else {
            // Guardar los datos del formulario, incluyendo los enlaces de los archivos subidos
            const formulario = await formularioModel.EnviarFormularioPG({
                nroDocumento,
                nombres,
                apellidoPaterno,
                apellidoMaterno,
                correo,
                categoria,
                proyectoTrabajo,
                titulo_propuesta,
                detallePropuesta,
                id_cuenta,
            });

            res.status(201).json({
                message: "Formulario enviado con éxito",
                formulario,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ocurrió un error al enviar el formulario: " + error });
    }
};



export const enviarTrabajoDirigido = async(req, res) => {
    try {
        const { token } = req.body;

        // Decodificar el token
        const data = await decodedToken(token);
        if (!data) {
            return res.status(400).json({ error: "Token inválido o expirado" });
        }

        const { nroDocumento, nombres, apellidoPaterno, apellidoMaterno, correo, id_cuenta } = data;

        // Validar que se haya subido el archivo necesario
        const proyectoTrabajo = req.files ?.proyectoTrabajo ?.[0] ?.path || null;

        if (!proyectoTrabajo) {
            return res.status(400).json({ error: "El archivo del proyecto de trabajo es obligatorio" });
        }

        // Llamar al modelo para guardar la información
        const trabajoDirigido = await formularioModel.EnviarTrabajoDirigidoPG({
            nroDocumento,
            nombres,
            apellidoPaterno,
            apellidoMaterno,
            correo,
            proyectoTrabajo,
            id_cuenta,
        });

        // Respuesta exitosa
        res.status(201).json({
            message: "Trabajo dirigido enviado con éxito",
            trabajoDirigido,
        });
    } catch (error) {
        console.error("Error al enviar el trabajo dirigido:", error);

        // Responder con un error más detallado
        res.status(500).json({
            error: "Ocurrió un error al enviar el trabajo dirigido",
            details: error.message || error,
        });
    }
};
export const cambiarEstadoFormulario = async(req, res) => {
    try {
        const { id_formulario, nuevo_estado } = req.params; // Obtener los parámetros de la URL

        // Validar entrada
        if (!id_formulario || nuevo_estado === undefined) {
            return res.status(400).json({
                error: "Faltan parámetros: 'id_formulario' y/o 'nuevo_estado'",
            });
        }

        // Cambiar el estado en la base de datos
        const formularioActualizado = await formularioModel.CambiarEstadoFormulario(
            id_formulario,
            nuevo_estado
        );

        res.status(200).json({
            message: "Estado del formulario actualizado con éxito",
            formulario: formularioActualizado,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Ocurrió un error al cambiar el estado del formulario: " +
                error.message,
        });
    }
};



export const DejarObservacion = async(req, res) => {
    try {
        const { id_formulario, id_cuenta, comentario } = req.body;
        if (!id_formulario || !comentario || !id_cuenta) {
            return res.status(400).json({
                error: "Faltan parámetros",
            });
        } else {
            const resultado = await formularioModel.DejarObservacion({ id_cuenta, id_formulario, comentario });
            if (resultado) {
                return res.status(201).json({
                    message: "Observacion enviada con exito"
                })
            } else {
                return res.status(400).json({
                    message: "No se envio la observacion porque la propuesta no ha sido observada ni rechazada"
                })
            }
        }
    } catch (error) {
        console.log("algo pasho en el controlador de dejar observacion : " + error)
    }
};

export const formularioController = {
    enviarFormulario,
    cambiarEstadoFormulario,
    DejarObservacion,
}
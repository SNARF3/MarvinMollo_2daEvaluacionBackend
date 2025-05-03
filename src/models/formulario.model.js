import { cambiarEstadoFormulario } from "../controllers/formulario.controllers.js";
import { pool } from "../db.js";

const EnviarFormularioPG = async ({
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
}) => {
    try {
        //procedimiento almacenado para que sea mas easy xd
        const query = `
        select InsertarFormularioEst($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [nroDocumento ,nombres, apellidoPaterno, apellidoMaterno, correo, proyectoTrabajo, titulo_propuesta, detallePropuesta, categoria, id_cuenta];
    const result = await pool.query(query, values);
    return result.rows[0]; // Devuelve el registro insertado
    } catch (error) {
        console.error("Error al insertar el formulario:", error);
        throw error;
    }
};


const EnviarTrabajoDirigidoPG = async ({
    nroDocumento,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    correo,
    proyectoTrabajo,
    id_cuenta,
}) => {
    try {
        const query = `
            INSERT INTO formulario (
                ci,
                nombres,
                apellido_paterno,
                apellido_materno,
                correo, 
                carta,
                tipo,
                fecha,
                id_cuenta    
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id_formulario;
        `;

        // Validar que se reciban todos los parámetros necesarios
        if (!nroDocumento || !nombres || !apellidoPaterno || !apellidoMaterno || !correo || !proyectoTrabajo || !id_cuenta) {
            throw new Error("Todos los campos son obligatorios para insertar el formulario");
        }

        // Ajuste en el valor para la fecha (usa `CURRENT_TIMESTAMP` en la consulta SQL para evitar errores de formato)
        const values = [
            nroDocumento,
            nombres,
            apellidoPaterno,
            apellidoMaterno,
            correo,
            proyectoTrabajo, // El archivo 'proyectoTrabajo' se guarda en la columna 'carta'
            2, // Tipo predeterminado (siempre es 2 para "trabajo dirigido")
            new Date(), // Fecha actual generada en JavaScript
            id_cuenta,
        ];

        const result = await pool.query(query, values);

        return result.rows[0]; // Devuelve el registro insertado
    } catch (error) {
        console.error("Error al insertar el formulario:", error);

        // Lanzar el error para que sea manejado en el controlador
        throw new Error("No se pudo insertar el formulario: " + error.message);
    }
};






// Cambiar el estado del formulario
const CambiarEstadoFormulario = async (id_formulario, nuevo_estado) => {
    try {
        const query = `
            UPDATE formulario
            SET estado = $1
            WHERE id_formulario = $2
            RETURNING *;
        `;
        const values = [nuevo_estado, id_formulario];
        const result = await pool.query(query, values);
        return result.rows[0]; // Devuelve el formulario actualizado
    } catch (error) {
        console.error("Error al cambiar el estado del formulario:", error);
        throw error;
    }
};

const DejarObservacion = async({id_formulario, id_cuenta, comentario})=> {
    try{
        const query = 
        `
        select insertarComentario ($1, $2, $3);
        `;
        const values = [id_cuenta, id_formulario, comentario];
        const result = await pool.query(query, values);
        return result.rows[0];
    }catch(error){
        console.log("paso algo: " , error)
        return false;
    }
};


export const formularioModel = {
    EnviarFormularioPG,
    CambiarEstadoFormulario,
    EnviarTrabajoDirigidoPG,
    DejarObservacion
};